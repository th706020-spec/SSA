import React, { useState, useEffect } from 'react';
import { User, Feedback } from '../types';
import { Send, Bug, Lightbulb, MessageSquare, Trash2, CheckCircle } from 'lucide-react';

interface AdminFeedbackProps {
    currentUser: User;
}

export const AdminFeedback: React.FC<AdminFeedbackProps> = ({ currentUser }) => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [type, setType] = useState<'bug' | 'feature' | 'other'>('feature');
    const [content, setContent] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('smartstudy_feedback');
        if (saved) {
            setFeedbacks(JSON.parse(saved));
        }
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const newFeedback: Feedback = {
            id: Date.now().toString(),
            user: currentUser.username,
            type,
            content,
            createdAt: new Date().toISOString()
        };

        const updated = [newFeedback, ...feedbacks];
        setFeedbacks(updated);
        localStorage.setItem('smartstudy_feedback', JSON.stringify(updated));
        
        setContent('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    const handleDelete = (id: string) => {
        const updated = feedbacks.filter(f => f.id !== id);
        setFeedbacks(updated);
        localStorage.setItem('smartstudy_feedback', JSON.stringify(updated));
    };

    const getTypeIcon = (t: string) => {
        switch(t) {
            case 'bug': return <Bug className="w-4 h-4 text-red-500" />;
            case 'feature': return <Lightbulb className="w-4 h-4 text-amber-500" />;
            default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
        }
    };

    const getTypeLabel = (t: string) => {
        switch(t) {
            case 'bug': return 'Báo lỗi (Bug)';
            case 'feature': return 'Đề xuất tính năng';
            default: return 'Góp ý khác';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Góp ý cho Quản trị viên</h2>
                <p className="text-gray-500 dark:text-gray-400">Giúp chúng tôi cải thiện ứng dụng tốt hơn</p>
            </div>

            <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại góp ý</label>
                        <div className="flex gap-4">
                            <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${type === 'feature' ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                <input type="radio" name="type" value="feature" checked={type === 'feature'} onChange={() => setType('feature')} className="hidden" />
                                <Lightbulb className={`w-5 h-5 ${type === 'feature' ? 'text-amber-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${type === 'feature' ? 'text-amber-700 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>Tính năng mới</span>
                            </label>
                            <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${type === 'bug' ? 'border-red-500 bg-red-50 dark:bg-red-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                <input type="radio" name="type" value="bug" checked={type === 'bug'} onChange={() => setType('bug')} className="hidden" />
                                <Bug className={`w-5 h-5 ${type === 'bug' ? 'text-red-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${type === 'bug' ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>Báo lỗi</span>
                            </label>
                            <label className={`flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors ${type === 'other' ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                <input type="radio" name="type" value="other" checked={type === 'other'} onChange={() => setType('other')} className="hidden" />
                                <MessageSquare className={`w-5 h-5 ${type === 'other' ? 'text-blue-500' : 'text-gray-400'}`} />
                                <span className={`font-medium ${type === 'other' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>Khác</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nội dung chi tiết</label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Mô tả chi tiết tính năng bạn muốn thêm hoặc lỗi bạn gặp phải..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#28292c] text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[120px]"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        {submitted ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Gửi góp ý thành công!
                            </span>
                        ) : <span></span>}
                        <button 
                            type="submit"
                            disabled={!content.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors"
                        >
                            <Send className="w-4 h-4" /> Gửi góp ý
                        </button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Lịch sử góp ý của bạn</h3>
                <div className="space-y-3">
                    {feedbacks.filter(f => f.user === currentUser.username).length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm italic">Bạn chưa gửi góp ý nào.</p>
                    ) : (
                        feedbacks.filter(f => f.user === currentUser.username).map(feedback => (
                            <div key={feedback.id} className="bg-white dark:bg-[#1e1e2d] p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex gap-4 items-start">
                                <div className="mt-1">
                                    {getTypeIcon(feedback.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-sm text-gray-900 dark:text-white">{getTypeLabel(feedback.type)}</span>
                                        <span className="text-xs text-gray-500">{new Date(feedback.createdAt).toLocaleDateString('vi-VN')}</span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-wrap">{feedback.content}</p>
                                </div>
                                <button onClick={() => handleDelete(feedback.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
