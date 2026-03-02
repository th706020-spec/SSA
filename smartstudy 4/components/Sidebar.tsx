import React from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Calendar, Target, GraduationCap, UserCircle, Timer, Moon, Sun, Settings, MessageSquare, TrendingUp, Flag } from 'lucide-react';

interface SidebarProps {
    currentView: ViewState;
    onChangeView: (view: ViewState) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isDarkMode, toggleTheme }) => {
    const navItems = [
        { id: ViewState.DASHBOARD, label: 'Tổng quan', icon: LayoutDashboard },
        { id: ViewState.POMODORO, label: 'Bắt đầu học tập', icon: Timer },
        { id: ViewState.SCHEDULE, label: 'Lịch học tập', icon: Calendar },
        { id: ViewState.PROJECTS, label: 'Dự án tự học', icon: Target },
        { id: ViewState.FORUM, label: 'Diễn đàn', icon: MessageSquare },
        { id: ViewState.TRENDS, label: 'Xu hướng người dùng', icon: TrendingUp },
        { id: ViewState.FEEDBACK, label: 'Góp ý quản trị viên', icon: Flag },
        { id: ViewState.SSR_PROFILE, label: 'Hồ sơ SSR', icon: UserCircle },
    ];

    return (
        <div className="bg-white dark:bg-[#1e1e2d] h-full w-full border-r border-gray-200 dark:border-gray-700 flex flex-col transition-colors duration-300">
            <div className="p-6 flex items-center gap-3 flex-shrink-0">
                <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-600/20">
                    <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">SmartStudy</h1>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Rhythm</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onChangeView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'}`} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 space-y-2">
                 <button 
                    onClick={() => onChangeView(ViewState.SETTINGS)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        currentView === ViewState.SETTINGS
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                    <Settings className="w-5 h-5" />
                    Cài đặt
                </button>

                <button 
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                    {isDarkMode ? (
                        <>
                            <Sun className="w-4 h-4" />
                            <span className="text-sm font-medium">Chế độ Sáng</span>
                        </>
                    ) : (
                        <>
                            <Moon className="w-4 h-4" />
                            <span className="text-sm font-medium">Chế độ Tối</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};