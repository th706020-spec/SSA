import React, { useState } from 'react';
import { Task } from '../types';
import { Trash2, Plus, X, Clock, AlignLeft, Check, ChevronLeft, ChevronRight, Calendar as CalIcon, Split } from 'lucide-react';

interface ScheduleManagerProps {
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({ tasks, setTasks }) => {
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    
    // Modal Form State
    const [formData, setFormData] = useState<{
        title: string;
        startTime: string;
        duration: number;
        category: 'study' | 'project' | 'break' | 'review';
        description: string;
        autoSplitPomodoro: boolean;
    }>({
        title: '',
        startTime: '08:00',
        duration: 60,
        category: 'study',
        description: '',
        autoSplitPomodoro: true
    });

    // Calendar Constants
    const START_HOUR = 0; 
    const END_HOUR = 24;
    const HOUR_HEIGHT = 80;

    // --- HANDLERS ---

    const openAddModal = (hour?: number) => {
        setEditingTask(null);
        setFormData({
            title: '',
            startTime: hour !== undefined ? `${hour.toString().padStart(2, '0')}:00` : '08:00',
            duration: 60,
            category: 'study',
            description: '',
            autoSplitPomodoro: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            startTime: task.startTime,
            duration: task.duration,
            category: task.category,
            description: task.description || '',
            autoSplitPomodoro: false // Don't auto-split when editing existing by default
        });
        setIsModalOpen(true);
    };

    // Helper to add minutes to HH:mm string
    const addMinutes = (time: string, minsToAdd: number) => {
        const [h, m] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m + minsToAdd);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const handleSave = () => {
        if (!formData.title) return;

        if (editingTask) {
            // Edit existing (No split logic for edit to avoid complexity)
            setTasks(prev => prev.map(t => t.id === editingTask.id ? {
                ...t,
                title: formData.title,
                startTime: formData.startTime,
                duration: formData.duration,
                category: formData.category,
                description: formData.description
            } : t));
        } else {
            // Create new
            // Check for Auto Split Logic
            if (formData.autoSplitPomodoro && formData.category === 'study' && formData.duration >= 30) {
                const newTasks: Task[] = [];
                let remainingTime = formData.duration;
                let currentTime = formData.startTime;
                let cycleCount = 0;

                while (remainingTime > 0) {
                    // Study Block
                    const studyDuration = Math.min(25, remainingTime);
                    newTasks.push({
                        id: Date.now().toString() + Math.random(),
                        date: currentDate,
                        completed: false,
                        title: `${formData.title} (${cycleCount + 1})`,
                        startTime: currentTime,
                        duration: studyDuration,
                        category: 'study',
                        description: formData.description
                    });
                    
                    currentTime = addMinutes(currentTime, studyDuration);
                    remainingTime -= studyDuration;

                    // Break Block (only if there is still time left in user intention, or just add a break after?)
                    // Logic: If user said 60 mins, they probably want 25-5-25-5.
                    if (remainingTime > 0 || (formData.duration - remainingTime < formData.duration)) {
                        // Check if we fit a break
                        // Let's assume breaks are added within the allocated slot if possible, 
                        // BUT standard Pomodoro adds break AFTER study. 
                        // To keep it simple: Add a 5m break if we just finished a study block and it's not the absolute end of the universe,
                        // but specifically if we have more study to do OR to fill the time.
                        
                        if (remainingTime >= 5) {
                            // Deduct break from remaining time
                             newTasks.push({
                                id: Date.now().toString() + Math.random(),
                                date: currentDate,
                                completed: false,
                                title: `Nghỉ giải lao`,
                                startTime: currentTime,
                                duration: 5,
                                category: 'break',
                                description: 'Thư giãn mắt, vươn vai.'
                            });
                            currentTime = addMinutes(currentTime, 5);
                            remainingTime -= 5;
                        } else if (remainingTime > 0) {
                            // If < 5 mins left, just make it a break or add to study? Let's make it a tiny break or ignore.
                            // Let's just finish loop if < 5 to avoid tiny tasks.
                            remainingTime = 0; 
                        }
                    }
                    cycleCount++;
                }
                setTasks(prev => [...prev, ...newTasks]);
            } else {
                // Normal Create
                const newTask: Task = {
                    id: Date.now().toString(),
                    date: currentDate,
                    completed: false,
                    title: formData.title,
                    startTime: formData.startTime,
                    duration: formData.duration,
                    category: formData.category,
                    description: formData.description
                };
                setTasks(prev => [...prev, newTask]);
            }
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (editingTask) {
            setTasks(prev => prev.filter(t => t.id !== editingTask.id));
            setIsModalOpen(false);
        }
    };

    const getTaskStyle = (task: Task) => {
        const [h, m] = task.startTime.split(':').map(Number);
        const startDecimal = h + m / 60;
        
        const top = (startDecimal - START_HOUR) * HOUR_HEIGHT;
        const height = (task.duration / 60) * HOUR_HEIGHT;
        
        // Colors matching Google Calendar Dark Mode vibe
        let bgColor = 'bg-blue-600 border-blue-800 text-white'; // study
        if (task.category === 'project') bgColor = 'bg-purple-600 border-purple-800 text-white';
        if (task.category === 'break') bgColor = 'bg-green-600 border-green-800 text-white';
        if (task.category === 'review') bgColor = 'bg-orange-600 border-orange-800 text-white';
        
        return {
            top: `${top}px`,
            height: `${height}px`,
            className: `absolute left-2 right-2 rounded-md border-l-4 p-2 shadow-md overflow-hidden hover:brightness-110 cursor-pointer transition-all z-10 ${bgColor}`
        };
    };

    const hours = [];
    for (let i = START_HOUR; i < END_HOUR; i++) {
        hours.push(i);
    }

    const todaysTasks = tasks.filter(t => t.date === currentDate);
    const displayDate = new Date(currentDate);

    // Categories for Sidebar
    const categories = [
        { id: 'study', label: 'Học tập (Study)', color: 'bg-blue-500' },
        { id: 'project', label: 'Dự án (Project)', color: 'bg-purple-500' },
        { id: 'review', label: 'Ôn tập (Review)', color: 'bg-orange-500' },
        { id: 'break', label: 'Nghỉ ngơi (Break)', color: 'bg-green-500' },
    ];

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] overflow-hidden rounded-xl border border-gray-800 bg-[#18181b] text-gray-200">
            {/* Sidebar (Google Calendar Dark Style) */}
            <div className="w-full lg:w-64 flex-shrink-0 bg-[#202124] border-r border-gray-700 p-4 flex flex-col gap-6">
                
                {/* Create Button */}
                <button 
                    onClick={() => openAddModal()}
                    className="flex items-center gap-3 bg-[#303134] hover:bg-[#3c4043] text-white px-4 py-3 rounded-full shadow-md transition-all w-fit"
                >
                    <Plus className="w-6 h-6 text-google-plus" />
                    <span className="font-medium pr-2">Tạo mới</span>
                </button>

                {/* Date Picker */}
                <div>
                     <div className="flex justify-between items-center mb-4">
                        <span className="font-medium text-lg text-gray-200">
                            {displayDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    {/* Simplified Date Input acting as Mini Calendar */}
                    <input 
                        type="date" 
                        value={currentDate} 
                        onChange={(e) => setCurrentDate(e.target.value)}
                        className="w-full bg-[#303134] border border-gray-600 rounded text-gray-200 p-2 outline-none focus:border-blue-500"
                    />
                </div>

                {/* My Calendars */}
                <div>
                    <h3 className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wider">Lịch của tôi</h3>
                    <div className="space-y-3">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-md ${cat.color} bg-opacity-80 border-2 border-transparent hover:border-white transition-all cursor-pointer`}></div>
                                <span className="text-sm text-gray-300">{cat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Calendar Grid */}
            <div className="flex-1 flex flex-col bg-[#202124]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-normal text-white">
                            {displayDate.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric' })}
                        </h2>
                    </div>
                    <div className="flex gap-2">
                         <button className="p-2 hover:bg-[#3c4043] rounded-full text-gray-300"><ChevronLeft className="w-5 h-5"/></button>
                         <button className="p-2 hover:bg-[#3c4043] rounded-full text-gray-300"><ChevronRight className="w-5 h-5"/></button>
                    </div>
                </div>
                
                {/* Scrollable Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                     <div className="flex min-h-full pb-10" style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}>
                        {/* Time Axis */}
                        <div className="w-16 flex-shrink-0 border-r border-gray-700 bg-[#202124]">
                            {hours.map(h => (
                                <div key={h} className="text-xs text-gray-400 text-right pr-2 relative" style={{ height: `${HOUR_HEIGHT}px` }}>
                                    <span className="relative -top-2">{h}:00</span>
                                </div>
                            ))}
                        </div>

                        {/* Grid Lines & Events */}
                        <div className="flex-1 relative">
                            {hours.map(h => (
                                <div 
                                    key={h} 
                                    onClick={() => openAddModal(h)}
                                    className="border-b border-gray-700 w-full absolute box-border hover:bg-[#3c4043] transition-colors cursor-pointer group" 
                                    style={{ top: `${(h - START_HOUR) * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                                >
                                     {/* Hover hint */}
                                    <span className="hidden group-hover:block ml-2 mt-1 text-xs text-gray-500">+ Thêm việc</span>
                                </div>
                            ))}

                            {/* Render Tasks */}
                            {todaysTasks.map(task => {
                                const style = getTaskStyle(task);
                                return (
                                    <div 
                                        key={task.id} 
                                        style={style} 
                                        className={style.className}
                                        onClick={(e) => { e.stopPropagation(); openEditModal(task); }}
                                    >
                                        <div className="text-xs font-semibold">{task.title}</div>
                                        <div className="text-[10px] opacity-90">{task.startTime} - {task.duration}p</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div 
                        className="bg-[#28292c] w-full max-w-md rounded-2xl shadow-2xl border border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 bg-[#3c4043] flex justify-between items-center border-b border-gray-600">
                            <h3 className="text-lg font-normal text-white">{editingTask ? 'Chỉnh sửa' : 'Thêm công việc'}</h3>
                            <div className="flex gap-2">
                                {editingTask && (
                                    <button onClick={handleDelete} className="p-2 hover:bg-red-500/20 rounded-full text-gray-400 hover:text-red-400 transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-600 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div>
                                <input 
                                    type="text" 
                                    placeholder="Tiêu đề (VD: Học Toán)" 
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-transparent text-2xl text-white placeholder-gray-500 border-b border-gray-600 focus:border-blue-500 outline-none pb-2 transition-colors"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                        <Clock className="w-4 h-4" /> Bắt đầu
                                    </div>
                                    <input 
                                        type="time" 
                                        value={formData.startTime}
                                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                                        className="w-full bg-[#3c4043] rounded px-3 py-2 text-white border border-transparent focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                                        <Clock className="w-4 h-4" /> Thời lượng (phút)
                                    </div>
                                    <input 
                                        type="number" 
                                        value={formData.duration}
                                        onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                                        className="w-full bg-[#3c4043] rounded px-3 py-2 text-white border border-transparent focus:border-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Auto Split Checkbox */}
                            {!editingTask && formData.category === 'study' && formData.duration >= 30 && (
                                <div className="flex items-center gap-3 p-3 bg-indigo-900/30 rounded-lg border border-indigo-700/50">
                                    <Split className="w-5 h-5 text-indigo-400" />
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-indigo-200 block">Chia nhỏ thành Pomodoro?</span>
                                        <span className="text-xs text-indigo-300/70 block">Tự động chia thành: Học 25p - Nghỉ 5p</span>
                                    </div>
                                    <div 
                                        onClick={() => setFormData(prev => ({...prev, autoSplitPomodoro: !prev.autoSplitPomodoro}))}
                                        className={`w-10 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${formData.autoSplitPomodoro ? 'bg-indigo-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${formData.autoSplitPomodoro ? 'translate-x-4' : 'translate-x-0'}`}></div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Loại công việc</label>
                                <div className="flex gap-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setFormData({...formData, category: cat.id as any})}
                                            className={`flex-1 py-2 rounded text-xs font-medium transition-all ${
                                                formData.category === cat.id 
                                                ? `${cat.color} text-white shadow-lg scale-105` 
                                                : 'bg-[#3c4043] text-gray-400 hover:bg-[#4a4e51]'
                                            }`}
                                        >
                                            {cat.label.split('(')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                    <AlignLeft className="w-4 h-4" /> Mô tả
                                </div>
                                <textarea 
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    placeholder="Thêm chi tiết..."
                                    className="w-full bg-[#3c4043] rounded px-3 py-2 text-white border border-transparent focus:border-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 flex justify-end">
                            <button 
                                onClick={handleSave}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};