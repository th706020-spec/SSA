import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Armchair, ChevronDown, ListTodo, Zap } from 'lucide-react';
import { Task, Project } from '../types';
import { PomodoroState, PomodoroMode } from '../App';

interface PomodoroTimerProps {
    tasks: Task[];
    projects: Project[];
    pomodoroState: PomodoroState;
    setPomodoroState: React.Dispatch<React.SetStateAction<PomodoroState>>;
}

const MODES: Record<PomodoroMode, { label: string; minutes: number; colorFrom: string; colorTo: string; icon: any; glow: string }> = {
    focus: { 
        label: 'Tập trung', 
        minutes: 25, 
        colorFrom: '#6366f1', // Indigo 500
        colorTo: '#8b5cf6',   // Violet 500
        glow: 'shadow-indigo-500/50',
        icon: Brain 
    },
    shortBreak: { 
        label: 'Nghỉ ngắn', 
        minutes: 5, 
        colorFrom: '#10b981', // Emerald 500
        colorTo: '#34d399',   // Emerald 400
        glow: 'shadow-emerald-500/50',
        icon: Coffee 
    },
    longBreak: { 
        label: 'Nghỉ dài', 
        minutes: 15, 
        colorFrom: '#a855f7', // Purple 500
        colorTo: '#ec4899',   // Pink 500
        glow: 'shadow-purple-500/50',
        icon: Armchair 
    },
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks, projects, pomodoroState, setPomodoroState }) => {
    const { mode, timeLeft, isActive, selectedTaskId, autoSync } = pomodoroState;

    // Helper to get local date YYYY-MM-DD
    const getTodayString = () => {
        const d = new Date();
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };
    const todayStr = getTodayString();

    // Filter tasks strictly for TODAY
    const todayTasks = tasks.filter(t => t.date === todayStr && !t.completed);
    
    const audioContextRef = useRef<AudioContext | null>(null);

    // --- AUTO SYNC LOGIC ---
    useEffect(() => {
        if (!autoSync) return;

        const syncWithSchedule = () => {
            const now = new Date();
            const currentMins = now.getHours() * 60 + now.getMinutes();

            // Find a task that is happening RIGHT NOW
            const currentTask = todayTasks.find(t => {
                const [h, m] = t.startTime.split(':').map(Number);
                const startMins = h * 60 + m;
                const endMins = startMins + t.duration;
                return currentMins >= startMins && currentMins < endMins;
            });

            if (currentTask && currentTask.id !== selectedTaskId) {
                setPomodoroState(prev => ({ ...prev, selectedTaskId: currentTask.id }));
                // Automatically switch mode based on task category
                if (currentTask.category === 'break') {
                    if (currentTask.duration >= 15) changeMode('longBreak');
                    else changeMode('shortBreak');
                } else {
                    changeMode('focus');
                }
            }
        };

        syncWithSchedule(); // Run immediately
        const interval = setInterval(syncWithSchedule, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [todayTasks, autoSync, selectedTaskId, setPomodoroState]);

    const toggleTimer = () => {
        if (!isActive) {
            const now = Date.now();
            setPomodoroState(prev => ({
                ...prev,
                endTime: now + prev.timeLeft * 1000,
                isActive: true
            }));
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        } else {
            setPomodoroState(prev => ({
                ...prev,
                endTime: null,
                isActive: false
            }));
        }
    };

    const resetTimer = () => {
        setPomodoroState(prev => ({
            ...prev,
            isActive: false,
            endTime: null,
            timeLeft: MODES[prev.mode].minutes * 60
        }));
    };

    const changeMode = (newMode: PomodoroMode) => {
        setPomodoroState(prev => ({
            ...prev,
            mode: newMode,
            isActive: false,
            endTime: null,
            timeLeft: MODES[newMode].minutes * 60
        }));
    };

    const handleTaskSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const tId = e.target.value;
        setPomodoroState(prev => ({ ...prev, selectedTaskId: tId, autoSync: false }));
        // Manual selection disables auto-sync temporarily to allow user control
        if (tId) {
             const task = tasks.find(t => t.id === tId);
             if (task) {
                if (task.category === 'break') {
                    if (task.duration >= 15) changeMode('longBreak');
                    else changeMode('shortBreak');
                } else {
                    changeMode('focus');
                }
             } else {
                 // It might be a project
                 changeMode('focus');
             }
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return {
            m: mins.toString().padStart(2, '0'),
            s: secs.toString().padStart(2, '0')
        };
    };

    const totalTime = MODES[mode].minutes * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const radius = 140;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    const timeDisplay = formatTime(timeLeft);
    const CurrentIcon = MODES[mode].icon;
    const currentTheme = MODES[mode];

    return (
        <div className="flex flex-col h-full items-center justify-center p-4">
            {/* Main Glass Card */}
            <div className="bg-white/80 dark:bg-[#151521] backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/20 dark:border-white/5 p-8 w-full max-w-lg relative overflow-hidden transition-colors duration-300">
                
                {/* Auto Sync Indicator */}
                <div className="absolute top-6 left-8 flex items-center gap-2">
                    <button 
                        onClick={() => setAutoSync(!autoSync)}
                        className={`text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${autoSync ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-500'}`}
                    >
                        <Zap className={`w-3 h-3 ${autoSync ? 'fill-current' : ''}`} />
                        {autoSync ? 'Tự động theo lịch' : 'Thủ công'}
                    </button>
                </div>

                {/* Mode Selector */}
                <div className="flex justify-center mb-8 relative z-10 mt-8">
                    <div className="flex bg-gray-100 dark:bg-[#27273a] p-1.5 rounded-full shadow-inner">
                        {(Object.keys(MODES) as Mode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { changeMode(m); setAutoSync(false); }} // Manual change disables auto sync
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                                    mode === m 
                                    ? 'bg-white dark:bg-[#3f3f5a] text-gray-900 dark:text-white shadow-md transform scale-105' 
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                            >
                                {MODES[m].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Timer Circle Area */}
                <div className="relative w-[320px] h-[320px] mx-auto mb-8 z-10">
                    {/* Glowing Blur Behind */}
                    <div 
                        className={`absolute inset-0 rounded-full blur-[60px] opacity-20 transition-colors duration-700`}
                        style={{ background: `radial-gradient(circle, ${currentTheme.colorFrom}, transparent)` }}
                    ></div>

                    <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
                        <defs>
                            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={currentTheme.colorFrom} />
                                <stop offset="100%" stopColor={currentTheme.colorTo} />
                            </linearGradient>
                        </defs>
                        {/* Track */}
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-100 dark:text-[#27273a]"
                        />
                        {/* Progress */}
                        <circle
                            cx="160"
                            cy="160"
                            r={radius}
                            stroke="url(#progressGradient)"
                            strokeWidth="12"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className={`transition-all duration-1000 ease-linear`}
                        />
                    </svg>
                    
                    {/* Center Content */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full">
                        <div className={`text-7xl font-[JetBrains_Mono] font-bold tracking-tighter text-gray-800 dark:text-white mb-2 flex justify-center items-center gap-2`}>
                            <span>{timeDisplay.m}</span>
                            <span className="animate-pulse text-gray-300 dark:text-gray-600">:</span>
                            <span>{timeDisplay.s}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm font-semibold tracking-widest uppercase" style={{ color: currentTheme.colorFrom }}>
                            <CurrentIcon className="w-4 h-4" />
                            {isActive ? 'Đang chạy' : 'Đã tạm dừng'}
                        </div>
                    </div>
                </div>

                {/* Task Selector */}
                <div className="mb-8 relative z-10">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-20">
                            <ListTodo className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                        {/* High contrast select styling */}
                        <select 
                            value={selectedTaskId}
                            onChange={handleTaskSelect}
                            className="block w-full pl-10 pr-10 py-3 text-base 
                                bg-white text-gray-900 border border-gray-200 
                                dark:bg-[#27273a] dark:text-white dark:border-[#3f3f5a]
                                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                                rounded-xl transition-all appearance-none cursor-pointer 
                                hover:bg-gray-50 dark:hover:bg-[#32324a]"
                        >
                            <option value="" className="bg-white text-gray-900 dark:bg-[#1e1e2d] dark:text-white">
                                {todayTasks.length === 0 && projects.length === 0 ? '-- Hôm nay chưa có lịch --' : '-- Chọn công việc / dự án --'}
                            </option>
                            {todayTasks.length > 0 && (
                                <optgroup label="Lịch học hôm nay" className="bg-white text-gray-900 dark:bg-[#1e1e2d] dark:text-white font-bold">
                                    {todayTasks.map(t => (
                                        <option key={t.id} value={t.id} className="font-normal">
                                            {t.category === 'break' ? '☕' : '📚'} {t.startTime} - {t.title}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {projects.length > 0 && (
                                <optgroup label="Dự án học tập" className="bg-white text-gray-900 dark:bg-[#1e1e2d] dark:text-white font-bold">
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id} className="font-normal">
                                            🎯 {p.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-20">
                            <ChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </div>
                    </div>
                    {todayTasks.length === 0 && projects.length === 0 && (
                        <p className="text-center text-xs text-orange-500 mt-2">
                            Bạn chưa tạo lịch cho ngày hôm nay ({todayStr}). Hãy vào phần "Lịch học tập" để thêm.
                        </p>
                    )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-6 relative z-10">
                    <button 
                        onClick={toggleTimer}
                        className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${isActive ? 'bg-orange-500 text-white shadow-orange-500/30' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-gray-500/30'}`}
                    >
                        {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                    </button>
                    <button 
                        onClick={resetTimer}
                        className="w-20 h-20 rounded-[28px] bg-gray-100 dark:bg-[#27273a] text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#32324a] transition-colors"
                    >
                        <RotateCcw className="w-8 h-8" />
                    </button>
                </div>

                {/* Reflection effect on the glass */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
            </div>
            
             <p className="mt-6 text-gray-400 dark:text-gray-500 text-sm">
                Hãy bắt đầu nhỏ để đạt kết quả lớn.
            </p>
        </div>
    );
};