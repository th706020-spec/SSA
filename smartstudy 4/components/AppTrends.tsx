import React, { useMemo } from 'react';
import { authService } from '../services/authService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, CheckCircle, Clock } from 'lucide-react';

export const AppTrends: React.FC = () => {
    const stats = useMemo(() => {
        const users = Object.values(authService.getUsers());
        const totalUsers = users.length;
        
        let totalTasks = 0;
        let completedTasks = 0;
        let totalStudyMinutes = 0;
        
        const categoryCount: Record<string, number> = {
            study: 0,
            project: 0,
            break: 0,
            review: 0
        };

        users.forEach(user => {
            const tasks = user.data?.tasks || [];
            totalTasks += tasks.length;
            
            tasks.forEach(task => {
                if (task.completed) {
                    completedTasks++;
                }
                if (task.actualDuration) {
                    totalStudyMinutes += task.actualDuration;
                } else if (task.completed) {
                    totalStudyMinutes += (task.duration || 0);
                }
                if (task.category && categoryCount[task.category] !== undefined) {
                    categoryCount[task.category]++;
                }
            });
        });

        const avgTasksPerUser = totalUsers ? (totalTasks / totalUsers).toFixed(1) : '0';
        const avgStudyHoursPerUser = totalUsers ? (totalStudyMinutes / 60 / totalUsers).toFixed(1) : '0';
        const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const categoryData = [
            { name: 'Học tập', value: categoryCount.study, color: '#4f46e5' },
            { name: 'Dự án', value: categoryCount.project, color: '#0ea5e9' },
            { name: 'Ôn tập', value: categoryCount.review, color: '#f59e0b' },
            { name: 'Nghỉ ngơi', value: categoryCount.break, color: '#10b981' },
        ].filter(item => item.value > 0);

        return {
            totalUsers,
            avgTasksPerUser,
            avgStudyHoursPerUser,
            completionRate,
            categoryData
        };
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Xu hướng người dùng App</h2>
                <p className="text-gray-500 dark:text-gray-400">Thống kê dữ liệu trung bình từ tất cả người dùng</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tổng người dùng</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</h3>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">TB Nhiệm vụ / Người</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgTasksPerUser}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                            <CheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tỷ lệ hoàn thành</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate}%</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">TB Giờ học / Người</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgStudyHoursPerUser}h</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Phân bổ hoạt động</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Biểu đồ hoạt động (Số lượng)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e1e2d', borderColor: '#374151', color: '#fff', borderRadius: '8px' }}
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {stats.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};
