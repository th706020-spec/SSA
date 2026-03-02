import React, { useState } from 'react';
import { Project, Task } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Clock, CheckCircle2, AlertCircle, X, List } from 'lucide-react';

interface DashboardProps {
    tasks: Task[];
    projects: Project[];
}

export const Dashboard: React.FC<DashboardProps> = ({ tasks, projects }) => {
    const [showTasksModal, setShowTasksModal] = useState(false);

    // Calculate stats based on REAL USER DATA
    const completedTasksList = tasks.filter(t => t.completed);
    const completedTasksCount = completedTasksList.length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasksCount / tasks.length) * 100) : 0;
    
    // Calculate hours
    const expectedMinutes = tasks.reduce((acc, t) => acc + t.duration, 0);
    const actualMinutes = tasks.reduce((acc, t) => {
        if (t.actualDuration) return acc + t.actualDuration;
        if (t.completed) return acc + t.duration;
        return acc;
    }, 0);

    const formatHours = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return h > 0 ? `${h}h${m > 0 ? ` ${m}p` : ''}` : `${m}p`;
    };
    
    // ĐÃ SỬA: Tính tổng số phút cho từng danh mục thay vì đếm số lượng công việc
    const categoryMinutes: Record<string, number> = {
        study: 0,
        project: 0,
        review: 0,
        break: 0
    };

    tasks.forEach(task => {
        let taskMins = 0;
        if (task.actualDuration) {
            taskMins = task.actualDuration;
        } else if (task.completed) {
            taskMins = task.duration || 0;
        } else {
            taskMins = task.duration || 0;
        }

        if (task.category && categoryMinutes[task.category] !== undefined) {
            categoryMinutes[task.category] += taskMins;
        }
    });

    // Đổi ra giờ và làm tròn 1 chữ số thập phân
    const categoryData = [
        { name: 'Học tập', value: Number((categoryMinutes.study / 60).toFixed(1)) },
        { name: 'Dự án', value: Number((categoryMinutes.project / 60).toFixed(1)) },
        { name: 'Ôn tập', value: Number((categoryMinutes.review / 60).toFixed(1)) },
        { name: 'Nghỉ ngơi', value: Number((categoryMinutes.break / 60).toFixed(1)) },
    ].filter(d => d.value > 0);

    const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6B7280'];

    const projectData = projects.map(p => ({
        name: p.name,
        progress: p.progress
    }));

    // Empty State for New User
    if (tasks.length === 0 && projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full">
                    <Clock className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Chào mừng bạn mới!</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-2">
                        Mọi thông số đều đang là 0. Hãy vào phần "Lịch học tập" để thêm công việc hoặc "Dự án" để bắt đầu theo dõi tiến độ nhé.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <header>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tổng quan hôm nay</h2>
                <p className="text-gray-500 dark:text-gray-400">
                    {completionRate === 100 ? "Tuyệt vời! Bạn đã hoàn thành tất cả." : `Bạn đã hoàn thành ${completionRate}% mục tiêu hôm nay.`}
                </p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Giờ học (Thực / Dự kiến)</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            <span className="text-blue-600 dark:text-blue-400">{formatHours(actualMinutes)}</span>
                            <span className="text-gray-400 text-lg"> / {formatHours(expectedMinutes)}</span>
                        </h3>
                    </div>
                </div>

                <div 
                    onClick={() => setShowTasksModal(true)}
                    className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow group"
                >
                    <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-full">
                        <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium group-hover:text-indigo-500 flex items-center gap-1">
                            Nhiệm vụ hoàn thành <List className="w-3 h-3"/>
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{completedTasksCount}/{tasks.length}</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-full">
                        <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Dự án đang chạy</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</h3>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Distribution Chart */}
                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Phân bổ thời gian (Theo Giờ)</h3>
                    <div className="h-64">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(value: number) => [`${value}h`, 'Thời lượng']}
                                        contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}} 
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Chưa có dữ liệu lịch trình
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center mt-2">
                        {categoryData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Project Progress Chart */}
                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tiến độ dự án</h3>
                    <div className="h-64">
                        {projects.length > 0 ? (
                             <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#374151" opacity={0.2} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#9ca3af'}} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff'}} />
                                    <Bar dataKey="progress" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                             <div className="h-full flex items-center justify-center text-gray-400">
                                Chưa có dự án nào
                            </div>
                        )}
                       
                    </div>
                </div>
            </div>

            {/* Completed Tasks Modal */}
            {showTasksModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowTasksModal(false)}>
                    <div className="bg-white dark:bg-[#28292c] w-full max-w-md rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-4">
                            <h3 className="text-lg font-bold dark:text-white">Nhiệm vụ đã hoàn thành</h3>
                            <button onClick={() => setShowTasksModal(false)}><X className="w-6 h-6 text-gray-500" /></button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
                            {completedTasksList.length > 0 ? (
                                <ul className="space-y-3">
                                    {completedTasksList.map(t => (
                                        <li key={t.id} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{t.title}</p>
                                                <p className="text-xs text-gray-500">{t.duration} phút</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-gray-500 py-4">Chưa có nhiệm vụ nào hoàn thành.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};