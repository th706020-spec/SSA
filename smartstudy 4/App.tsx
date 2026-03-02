import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ScheduleManager } from './components/ScheduleManager';
import { ProjectTracker } from './components/ProjectTracker';
import { OnboardingSSR } from './components/OnboardingSSR';
import { SSRProfile } from './components/SSRProfile';
import { PomodoroTimer } from './components/PomodoroTimer';
import { UserProfile } from './components/UserProfile';
import { CommunityForum } from './components/CommunityForum';
import { AppTrends } from './components/AppTrends';
import { AdminFeedback } from './components/AdminFeedback';
import { Auth } from './components/Auth';
import { authService } from './services/authService';
import { ViewState, Task, Project, User, Note } from './types';
import { Menu, LogOut } from 'lucide-react';
import { generateSmartSchedule } from './services/geminiService';

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroState {
    mode: PomodoroMode;
    timeLeft: number;
    isActive: boolean;
    selectedTaskId: string;
    endTime: number | null;
    autoSync: boolean;
}

const App: React.FC = () => {
    // Theme State
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Auth & Data State
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Pomodoro State
    const [pomodoroState, setPomodoroState] = useState<PomodoroState>({
        mode: 'focus',
        timeLeft: 25 * 60,
        isActive: false,
        selectedTaskId: '',
        endTime: null,
        autoSync: true
    });

    // Helper to sanitize user data (ensure new fields exist)
    const sanitizeUser = (rawUser: User): User => {
        const u = { ...rawUser };
        if (!u.data.notes) u.data.notes = [];
        if (!u.settings) u.settings = { notifications: true, soundEnabled: true };
        return u;
    };

    const handleLogin = (loggedInUser: User) => {
        const sanitized = sanitizeUser(loggedInUser);
        setUser(sanitized);
    };

    // Initialize from LocalStorage (Auto Login)
    useEffect(() => {
        const savedUser = authService.getCurrentUser();
        if (savedUser) {
            handleLogin(savedUser);
        } else {
            // Only confirm logout if no user is found
            authService.logout();
            setUser(null);
        }
    }, []);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
    };

    const handleTasksUpdate = (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
        if (!user) return;
        
        let updatedTasks: Task[];
        if (typeof newTasks === 'function') {
            updatedTasks = newTasks(user.data.tasks);
        } else {
            updatedTasks = newTasks;
        }

        const updatedUser = { ...user, data: { ...user.data, tasks: updatedTasks } };
        setUser(updatedUser);
        authService.updateUserData(updatedTasks);
    };

    const handleProjectsUpdate = (newProjects: Project[]) => {
         if (!user) return;
        const updatedUser = { ...user, data: { ...user.data, projects: newProjects } };
        setUser(updatedUser);
        authService.updateUserData(undefined, newProjects);
    };

    const handleNotesUpdate = (newNotes: Note[]) => {
        if (!user) return;
        const updatedUser = { ...user, data: { ...user.data, notes: newNotes } };
        setUser(updatedUser);
        authService.updateUserData(undefined, undefined, undefined, newNotes);
    }

    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        // Persistence handled inside UserProfile component via authService but state needs update
    };

    // Pomodoro Timer Logic
    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null;
        if (pomodoroState.isActive && pomodoroState.endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const secondsLeft = Math.ceil((pomodoroState.endTime! - now) / 1000);
                if (secondsLeft <= 0) {
                    handleTimerComplete();
                    if (interval) clearInterval(interval);
                } else {
                    setPomodoroState(prev => ({ ...prev, timeLeft: secondsLeft }));
                }
            }, 200);
        }
        return () => { if (interval) clearInterval(interval); };
    }, [pomodoroState.isActive, pomodoroState.endTime, user]); // Added user to deps

    const handleTimerComplete = () => {
        // Play sound if possible (browsers might block it without user interaction)
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (e) {
            console.error("Audio play failed", e);
        }

        setPomodoroState(prev => {
            const isFocus = prev.mode === 'focus';
            const newMode = isFocus ? 'shortBreak' : 'focus';
            const newTimeLeft = (newMode === 'focus' ? 25 : 5) * 60;
            const newEndTime = Date.now() + newTimeLeft * 1000;

            // Update task actualDuration if it was a focus session
            if (isFocus && prev.selectedTaskId && user) {
                const isTask = user.data.tasks.some(t => t.id === prev.selectedTaskId);
                if (isTask) {
                    const updatedTasks = user.data.tasks.map(t => {
                        if (t.id === prev.selectedTaskId) {
                            return { ...t, actualDuration: (t.actualDuration || 0) + 25 };
                        }
                        return t;
                    });
                    setTimeout(() => handleTasksUpdate(updatedTasks), 0);
                }
            }

            return {
                ...prev,
                mode: newMode,
                timeLeft: newTimeLeft,
                endTime: newEndTime,
                isActive: true // Auto loop
            };
        });
    };

    const handleSurveyComplete = async (phoneSurvey: any, sleepSurvey: any, analysis: any) => {
        if (!user) return;

        let availableHours = 3; 
        if (phoneSurvey.dailyHours === 'Dưới 2 giờ') availableHours = 6;
        else if (phoneSurvey.dailyHours === '2–4 giờ') availableHours = 4;
        else if (phoneSurvey.dailyHours === '4–6 giờ') availableHours = 3;
        else availableHours = 2;

        const today = new Date().toISOString().split('T')[0];
        
        const focusTopics = phoneSurvey.purposes.length > 0 
            ? phoneSurvey.purposes.filter((p: string) => !p.includes('Giải trí') && !p.includes('Mạng xã hội'))
            : ['Tự học tổng quát'];
            
        if (focusTopics.length === 0) focusTopics.push('Cải thiện kỹ năng chuyên môn');

        const initialTasks = await generateSmartSchedule(focusTopics, today, availableHours);
        
        const updatedProfile = {
            name: user.username,
            phoneSurvey,
            sleepSurvey,
            analysis
        };

        const updatedUser = { 
            ...user, 
            data: { 
                ...user.data, 
                profile: updatedProfile,
                tasks: initialTasks 
            } 
        };
        setUser(updatedUser);
        authService.updateUserData(initialTasks, undefined, updatedProfile);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // 1. Not Logged In -> Show Auth
    if (!user) {
        return <Auth onLogin={handleLogin} />;
    }

    // 2. Logged In but No Profile -> Show Onboarding
    if (!user.data.profile) {
        return (
            <OnboardingSSR 
                onComplete={handleSurveyComplete} 
            />
        );
    }

    // 3. Main App
    const renderView = () => {
        switch (currentView) {
            case ViewState.DASHBOARD:
                return <Dashboard tasks={user.data.tasks} projects={user.data.projects} />;
            case ViewState.SSR_PROFILE:
                return user.data.profile ? <SSRProfile profile={user.data.profile} /> : null;
            case ViewState.SCHEDULE:
                return <ScheduleManager tasks={user.data.tasks} setTasks={handleTasksUpdate} />;
            case ViewState.POMODORO:
                return <PomodoroTimer 
                    tasks={user.data.tasks} 
                    projects={user.data.projects}
                    pomodoroState={pomodoroState}
                    setPomodoroState={setPomodoroState}
                />;
            case ViewState.PROJECTS:
                return <ProjectTracker projects={user.data.projects} setProjects={handleProjectsUpdate} />;
            case ViewState.FORUM:
                return <CommunityForum currentUser={user} />;
            case ViewState.TRENDS:
                return <AppTrends />;
            case ViewState.FEEDBACK:
                return <AdminFeedback currentUser={user} />;
            case ViewState.SETTINGS:
                return <UserProfile user={user} onUpdate={handleUserUpdate} onLogout={handleLogout} />;
            default:
                return <Dashboard tasks={user.data.tasks} projects={user.data.projects} />;
        }
    };

    return (
        <div className={`${isDarkMode ? 'dark' : ''} transition-colors duration-300`}>
            <div className="flex min-h-screen bg-gray-50 dark:bg-[#151521] font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
                {/* Mobile Header */}
                <div className="md:hidden fixed top-0 w-full bg-white dark:bg-[#1e1e2d] border-b border-gray-200 dark:border-gray-700 z-30 px-4 py-3 flex items-center justify-between shadow-sm transition-colors duration-300">
                    <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">SmartStudy Rhythm</span>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="w-64 h-full bg-white dark:bg-[#1e1e2d] shadow-xl animate-in slide-in-from-left duration-200" onClick={e => e.stopPropagation()}>
                            <Sidebar 
                                currentView={currentView} 
                                onChangeView={(v) => { setCurrentView(v); setIsMobileMenuOpen(false); }} 
                                isDarkMode={isDarkMode}
                                toggleTheme={toggleTheme}
                            />
                             <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-medium">
                                    <LogOut className="w-5 h-5" /> Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Desktop Sidebar */}
                <div className="hidden md:flex w-64 h-screen fixed left-0 top-0 z-10 flex-col bg-white dark:bg-[#1e1e2d] border-r border-gray-200 dark:border-gray-700">
                    <Sidebar 
                        currentView={currentView} 
                        onChangeView={setCurrentView} 
                        isDarkMode={isDarkMode}
                        toggleTheme={toggleTheme}
                    />
                </div>

                {/* Main Content */}
                <main className="flex-1 md:ml-64 p-4 md:p-8 mt-16 md:mt-0 transition-all">
                    <div className="max-w-6xl mx-auto h-full">
                        {renderView()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;