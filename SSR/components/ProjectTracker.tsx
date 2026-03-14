import React, { useState } from 'react';
import { Project } from '../types';
import { Target, Plus, Pencil, Trash2, X } from 'lucide-react';

interface ProjectTrackerProps {
    projects: Project[];
    setProjects: (projects: Project[]) => void;
}

export const ProjectTracker: React.FC<ProjectTrackerProps> = ({ projects, setProjects }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        deadline: '',
        progress: 0,
        description: ''
    });

    const openAddModal = () => {
        setEditingProject(null);
        setFormData({ name: '', deadline: '', progress: 0, description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            deadline: project.deadline,
            progress: project.progress,
            description: project.description
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name) return;

        if (editingProject) {
            const updated = projects.map(p => p.id === editingProject.id ? { ...p, ...formData } : p);
            setProjects(updated);
        } else {
            const newProject: Project = {
                id: Date.now().toString(),
                ...formData
            };
            setProjects([...projects, newProject]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (editingProject) {
            setProjects(projects.filter(p => p.id !== editingProject.id));
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dự án tự học</h2>
                    <p className="text-gray-500 dark:text-gray-400">Theo dõi tiến độ các dự án dài hạn</p>
                </div>
                <button 
                    onClick={openAddModal}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" /> Thêm dự án mới
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white dark:bg-[#1e1e2d] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all group relative">
                        {/* Edit Button */}
                        <button 
                            onClick={() => openEditModal(project)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 dark:bg-gray-700 rounded-full"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>

                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg">
                                <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">
                                Deadline: {project.deadline}
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pr-8">{project.name}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 h-10">{project.description}</p>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Tiến độ</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{project.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-500"
                                    style={{ width: `${project.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
                
                {/* Empty State / Add New Placeholder */}
                {projects.length === 0 && (
                     <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white dark:bg-[#1e1e2d] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400">
                        <Target className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Chưa có dự án nào</p>
                        <p className="text-sm mb-4">Hãy tạo dự án đầu tiên của bạn để bắt đầu theo dõi.</p>
                        <button onClick={openAddModal} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                            + Tạo ngay
                        </button>
                     </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                    <div 
                        className="bg-white dark:bg-[#28292c] w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#3c4043]">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingProject ? 'Sửa dự án' : 'Tạo dự án mới'}
                            </h3>
                            <div className="flex gap-2">
                                {editingProject && (
                                    <button onClick={handleDelete} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-400">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên dự án</label>
                                <input 
                                    type="text" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 dark:bg-[#3c4043] dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    placeholder="VD: Học IELTS..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label>
                                    <input 
                                        type="date" 
                                        value={formData.deadline}
                                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 dark:bg-[#3c4043] dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                                <div className="w-24">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tiến độ (%)</label>
                                    <input 
                                        type="number" 
                                        min="0" max="100"
                                        value={formData.progress}
                                        onChange={e => setFormData({...formData, progress: Number(e.target.value)})}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 dark:bg-[#3c4043] dark:border-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 dark:bg-[#3c4043] dark:border-gray-600 dark:text-white resize-none h-24 dark:placeholder-gray-400"
                                    placeholder="Mô tả mục tiêu..."
                                />
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 dark:bg-[#3c4043] flex justify-end">
                            <button 
                                onClick={handleSave}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                            >
                                Lưu dự án
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};