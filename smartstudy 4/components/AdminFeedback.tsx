import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { Lightbulb, Bug, MessageSquare, Send, User as UserIcon, Clock } from 'lucide-react';

interface AdminFeedbackProps {
    currentUser: User;
}

interface Feedback {
    id: string;
    author: string;
    type: 'feature' | 'bug' | 'other';
    content: string;
    createdAt: string;
}

export const AdminFeedback: React.FC<AdminFeedbackProps> = ({ currentUser }) => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [content, setContent] = useState('');
    const [type, setType] = useState<'feature' | 'bug' | 'other'>('feature');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Kéo toàn bộ góp ý từ Firebase xuống
    const fetchFeedbacks = async () => {
        try {
            const q = query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Feedback));
            setFeedbacks(data);
        } catch (error) {
            console.error("Lỗi tải danh sách góp ý:", error);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Gửi góp ý mới lên mây
    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);
        
        try {
            const newFeedback = {
                author: currentUser.username,
                type,
                content,
                createdAt: new Date().toISOString()
            };
            await addDoc(collection(db, 'feedbacks'), newFeedback);
            setContent(''); // Xóa trắng khung nhập
            fetchFeedbacks(); // Tải lại danh sách ngay lập tức
        } catch (error) {
            console.error("Lỗi gửi góp ý:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeLabel = (t: string) => {
        switch(t) {
            case 'feature': return { text: 'Tính năng mới', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Lightbulb };
            case 'bug': return { text: 'Báo lỗi', color: 'text-red-600 bg-red-50 border-red-200', icon: Bug };
            default: return { text: 'Khác', color: 'text-gray-600 bg-gray-50 border-gray-200', icon: MessageSquare };
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Góp ý cho Quản trị viên</h2>
                <p className="text-gray-500 dark:text-gray-400">Giúp chúng tôi cải thiện ứng dụng tốt hơn</p>
            </div>

            {/* Khung gửi góp ý */}
            <div className="bg-white dark:bg-[#1e1e2d] rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại góp ý</label>
                    <div className="flex flex-wrap gap-3">
                        <button 
                            onClick={() => setType('feature')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'feature' ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700 dark:text-gray-400'}`}
                        >
                            <Lightbulb className="w-4 h-4" /> Tính năng mới
                        </button>
                        <button 
                            onClick={() => setType('bug')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'bug' ? 'bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700 dark:text-gray-400'}`}
                        >
                            <Bug className="w-4 h-4" /> Báo lỗi
                        </button>
                        <button 
                            onClick={() => setType('other')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'other' ? 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-transparent dark:border-gray-700 dark:text-gray-400'}`}
                        >
                            <MessageSquare className="w-4 h-4" /> Khác
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nội dung chi tiết</label>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Mô tả chi tiết tính năng bạn muốn thêm hoặc lỗi bạn gặp phải..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#151521] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-y"
                    />
                </div>

                <div className="flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all ${isSubmitting || !content.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
                    >
                        {isSubmitting ? 'Đang gửi...' : <><Send className="w-4 h-4" /> Gửi góp ý</>}
                    </button>
                </div>
            </div>

            {/* Danh sách góp ý công khai */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Danh sách góp ý từ cộng đồng</h3>
                <div className="space-y-4">
                    {feedbacks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 italic bg-white dark:bg-[#1e1e2d] p-6 rounded-2xl text-center border border-gray-100 dark:border-gray-800">Chưa có góp ý nào. Hãy là người đầu tiên!</p>
                    ) : (
                        feedbacks.map(fb => {
                            const typeConfig = getTypeLabel(fb.type);
                            const Icon = typeConfig.icon;
                            return (
                                <div key={fb.id} className="bg-white dark:bg-[#1e1e2d] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex gap-4">
                                    <div className="hidden sm:block">
                                        <div className={`p-3 rounded-full border ${typeConfig.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                                    <UserIcon className="w-4 h-4 text-gray-400" /> {fb.author}
                                                </span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${typeConfig.color} hidden sm:inline-block`}>
                                                    {typeConfig.text}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(fb.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit'})}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{fb.content}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};