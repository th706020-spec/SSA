import React, { useState, useEffect } from 'react';
// Import các component giao diện
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ScheduleManager } from './components/ScheduleManager';
import { ProjectTracker } from './components/ProjectTracker';
import { OnboardingSSR } from './components/OnboardingSSR';
import { SSRProfile } from './components/SSRProfile';
import { PomodoroTimer } from './components/PomodoroTimer';
import { SmartNotes } from './components/SmartNotes';
import { CommunityForum } from './components/CommunityForum';
import { UserDirectory } from './components/UserDirectory';
import { UserProfile } from './components/UserProfile';
import { Auth } from './components/Auth';

// Import Types và Icons
import { ViewState, Task, Project, User, Note } from './types';
import { Menu, LogOut } from 'lucide-react';
import { generateSmartSchedule } from './services/geminiService';

// --- GỌI FIREBASE AUTH & FIRESTORE (DATABASE) ---
import { auth, db } from './firebaseConfig'; // Thêm db
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Các hàm đọc/ghi dữ liệu

const App: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const sanitizeUser = (rawUser: User): User => {
        const u = { ...rawUser };
        if (!u.data) {
             u.data = { tasks: [], projects: [], notes: [], profile: null };
        }
        if (!u.data.notes) u.data.notes = [];
        if (!u.settings) u.settings = { notifications: true, soundEnabled: true };
        return u;
    };

    // --- 1. LOGIC ĐĂNG NHẬP & TẢI DỮ LIỆU TỪ DATABASE ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Bước 1: Lấy thông tin cơ bản
                let finalUserData: User = {
                    id: firebaseUser.uid,
                    username: firebaseUser.displayName || "Người dùng",
                    avatar: firebaseUser.photoURL || "",
                    data: { tasks: [], projects: [], notes: [], profile: null },
                    settings: { notifications: true, soundEnabled: true }
                };

                // Bước 2: Lên Database tìm xem ông này đã lưu dữ liệu bao giờ chưa
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userSnap = await getDoc(userDocRef);

                    if (userSnap.exists()) {
                        // Nếu tìm thấy -> Lấy dữ liệu cũ đắp vào
                        const savedData = userSnap.data();
                        if (savedData.data) {
                            finalUserData.data = savedData.data;
                        }
                    } else {
                        // Nếu chưa có (User mới tinh) -> Tạo một bản ghi rỗng trên Database
                        await setDoc(userDocRef, { 
                            username: finalUserData.username,
                            data: finalUserData.data 
                        });
                    }
                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu:", error);
                }

                setUser(sanitizeUser(finalUserData));
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    };

    // --- 2. CÁC HÀM CẬP NHẬT DỮ LIỆU (Cần Lưu Lên Database) ---
    
    // Hàm phụ để lưu nhanh lên Firebase
    const saveToFirebase = async (userId: string, newData: any) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { data: newData });
        } catch (error) {
            console.error("Lỗi lưu dữ liệu:", error);
        }
    };

    const handleTasksUpdate = (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
        if (!user) return;
        let updatedTasks: Task[];
        if (typeof newTasks === 'function') {
            updatedTasks = newTasks(user.data.tasks);
        } else {
            updatedTasks = newTasks;
        }
        
        const newData = { ...user.data, tasks: updatedTasks };
        const updatedUser = { ...user, data: newData };
        
        setUser(updatedUser); // Cập nhật màn hình ngay
        saveToFirebase(user.id, newData); // Lưu ngầm lên Database
    };

    const handleProjectsUpdate = (newProjects: Project[]) => {
        if (!user) return;
        const newData = { ...user.data, projects: newProjects };
        setUser({ ...user, data: newData });
        saveToFirebase(user.id, newData);
    };

    const handleNotesUpdate = (newNotes: Note[]) => {
        if (!user) return;
        const newData = { ...user.data, notes: newNotes };
        setUser({ ...user, data: newData });
        saveToFirebase(user.id, newData);
    }

    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        // Lưu setting nếu cần (chưa implement)
    };

    // --- 3. QUAN TRỌNG: LƯU KẾT QUẢ KHẢO SÁT ---
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

        const newData = { 
            ...user.data, 
            profile: updatedProfile,
            tasks: initialTasks 
        };

        // Cập nhật State
        setUser({ ...user, data: newData });

        // LƯU NGAY LẬP TỨC VÀO FIREBASE
        await saveToFirebase(user.id, newData);
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    // --- RENDER GIAO DIỆN ---
    if (isLoading) {
        return <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-[#151521] text-gray-500">Đang tải dữ liệu...</div>;
    }

    if (!user) {
        return <Auth onLogin={() => {}} />;
    }

    // Kiểm tra xem đã có Profile trong Database chưa
    if (!user.data.profile) {
        return (
            <OnboardingSSR 
                onComplete={handleSurveyComplete} 
            />
        );
    }

    const renderView = () => {
        switch (currentView) {
            case ViewState.DASHBOARD:
                return <Dashboard tasks={user!.data.tasks} projects={user!.data.projects} />;
            case ViewState.SSR_PROFILE:
                return user!.data.profile ? <SSRProfile profile={user!.data.profile} /> : null;
            case ViewState.SCHEDULE:
                return <ScheduleManager tasks={user!.data.tasks} setTasks={handleTasksUpdate} />;
            case ViewState.POMODORO:
                return <PomodoroTimer tasks={user!.data.tasks} />;
            case ViewState.PROJECTS:
                return <ProjectTracker projects={user!.data.projects} setProjects={handleProjectsUpdate} />;
            case ViewState.NOTES:
                return <SmartNotes notes={user!.data.notes || []} setNotes={handleNotesUpdate} />;
            case ViewState.FORUM:
                return <CommunityForum currentUser={user!} />;
            case ViewState.USER_DIRECTORY:
                return <UserDirectory />;
            case ViewState.SETTINGS:
                return <UserProfile user={user!} onUpdate={handleUserUpdate} onLogout={handleLogout} />;
            default:
                return <Dashboard tasks={user!.data.tasks} projects={user!.data.projects} />;
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