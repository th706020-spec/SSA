import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';
import { ShieldCheck, BookOpen, CheckCircle2, Search, User as UserIcon } from 'lucide-react';

export const UserDirectory: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const usersMap = authService.getUsers();
        setUsers(Object.values(usersMap));
    }, []);

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" />
                        Danh sách Thành viên
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Toàn bộ {users.length} tài khoản đã đăng ký trong hệ thống.
                    </p>
                </div>
                
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm thành viên..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e1e2d] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user, index) => (
                    <div key={user.username} className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                        <div className="relative">
                            <img 
                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} 
                                alt={user.username} 
                                className="w-16 h-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900 object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white dark:border-[#1e1e2d] w-5 h-5 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-bold text-gray-900 dark:text-white truncate flex items-center gap-1">
                                {user.username}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full">
                                    Thành viên
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" /> {user.data.tasks.filter(t => t.completed).length} đã học
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-[#1e1e2d]/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Không tìm thấy thành viên nào.</p>
                </div>
            )}
        </div>
    );
};