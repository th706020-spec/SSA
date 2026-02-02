import React, { useState } from 'react';
import { User } from '../types';
import { Camera, Bell, Volume2, Save, LogOut } from 'lucide-react';
import { authService } from '../services/authService';

interface UserProfileProps {
    user: User;
    onUpdate: (user: User) => void;
    onLogout: () => void;
}

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Zack', 'Midnight', 'Bandit', 'Bella'];

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate, onLogout }) => {
    const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
    const [notifications, setNotifications] = useState(user.settings?.notifications ?? true);
    const [sound, setSound] = useState(user.settings?.soundEnabled ?? true);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSave = () => {
        const updatedUser = {
            ...user,
            avatar: avatarUrl,
            settings: {
                notifications,
                soundEnabled: sound
            }
        };
        // Persist to local storage
        authService.updateUserData(undefined, undefined, undefined, undefined, updatedUser.settings, updatedUser.avatar);
        onUpdate(updatedUser);
        setSuccessMsg('Đã lưu thay đổi thành công!');
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cài đặt tài khoản</h2>
                <p className="text-gray-500 dark:text-gray-400">Quản lý thông tin cá nhân và tùy chọn ứng dụng.</p>
            </header>

            {/* Avatar Section */}
            <div className="bg-white dark:bg-[#1e1e2d] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-center gap-8">
                <div className="relative group">
                    <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-32 h-32 rounded-full border-4 border-indigo-100 dark:border-indigo-900 object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                        <Camera className="w-5 h-5" />
                    </div>
                </div>
                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Đường dẫn Avatar (URL)</label>
                        <input 
                            type="text" 
                            value={avatarUrl} 
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:bg-[#27273a] dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Hoặc chọn nhanh:</label>
                        <div className="flex gap-2 flex-wrap">
                            {AVATAR_SEEDS.map(seed => {
                                const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${seed}`;
                                return (
                                    <button 
                                        key={seed}
                                        onClick={() => setAvatarUrl(url)}
                                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${avatarUrl === url ? 'border-indigo-600 scale-110' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <img src={url} alt={seed} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* General Settings */}
            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Thông báo nhắc nhở</h3>
                            <p className="text-sm text-gray-500">Nhận thông báo khi đến giờ học.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={notifications} onChange={(e) => setNotifications(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>

                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                            <Volume2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Âm thanh</h3>
                            <p className="text-sm text-gray-500">Phát âm thanh khi hoàn thành Pomodoro.</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                    </label>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4">
                 <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium transition-colors"
                >
                    <LogOut className="w-5 h-5" /> Đăng xuất
                </button>

                <div className="flex items-center gap-4">
                    {successMsg && <span className="text-green-600 font-medium animate-pulse">{successMsg}</span>}
                    <button 
                        onClick={handleSave}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Save className="w-5 h-5" /> Lưu cài đặt
                    </button>
                </div>
            </div>
        </div>
    );
};