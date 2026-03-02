import React, { useState, useEffect } from 'react';
import { ForumPost, ForumComment } from '../types';
import { forumService } from '../services/forumService';
import { User } from '../types';
import { MessageSquare, Heart, Send, Plus, Tag, Search, User as UserIcon, X, Hash, Filter, CheckCircle2, Trash2 } from 'lucide-react';

interface CommunityForumProps {
    currentUser: User;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({ currentUser }) => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' });
    const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
    const [commentText, setCommentText] = useState('');
    
    // State for filtering
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            const data = await forumService.getPosts();
            setPosts(data);
        };
        fetchPosts();
    }, []);

    const tagCounts = posts.flatMap(p => p.tags).reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);

    const filteredPosts = selectedTag 
        ? posts.filter(p => p.tags.includes(selectedTag)) 
        : posts;

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) return;
        
        const post: ForumPost = {
            id: '', 
            author: currentUser.username,
            authorAvatar: currentUser.avatar || '',
            title: newPost.title,
            content: newPost.content,
            tags: newPost.tags.split(',').map(t => t.trim()).filter(t => t),
            likes: [],
            comments: [],
            createdAt: new Date().toISOString()
        };
        
        setIsCreateModalOpen(false);
        setNewPost({ title: '', content: '', tags: '' });

        const createdPost = await forumService.createPost(post);
        setPosts(prevPosts => [createdPost, ...prevPosts]);
    };

    const handleDeletePost = async (postId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
            setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
            await forumService.deletePost(postId);
        }
    };

    const handleLike = async (postId: string) => {
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                const currentLikes = p.likes || [];
                const isLiked = currentLikes.includes(currentUser.username);
                return {
                    ...p,
                    likes: isLiked 
                        ? currentLikes.filter(u => u !== currentUser.username) 
                        : [...currentLikes, currentUser.username]
                };
            }
            return p;
        }));

        await forumService.toggleLike(postId, currentUser.username);
    };

    const handleComment = async (postId: string) => {
        if (!commentText.trim()) return;
        
        const newCommentObj: ForumComment = {
            id: Date.now().toString(),
            author: currentUser.username,
            authorAvatar: currentUser.avatar || '',
            content: commentText,
            createdAt: new Date().toISOString()
        };

        setCommentText('');
        setPosts(prevPosts => prevPosts.map(p => {
            if (p.id === postId) {
                return { ...p, comments: [...(p.comments || []), newCommentObj] };
            }
            return p;
        }));

        await forumService.addComment(postId, newCommentObj);
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <header className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cộng đồng Học tập</h2>
                        <p className="text-gray-500 dark:text-gray-400">Trao đổi dành riêng cho thành viên đã đăng ký</p>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                    >
                        <Plus className="w-5 h-5" /> Bài viết mới
                    </button>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                        <Filter className="w-4 h-4" /> Chủ đề:
                    </div>
                    <button 
                        onClick={() => setSelectedTag(null)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                            selectedTag === null 
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-[#1e1e2d] dark:border-gray-700 dark:text-gray-300'
                        }`}
                    >
                        Tất cả
                    </button>
                    {sortedTags.map(tag => (
                        <button 
                            key={tag}
                            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                                selectedTag === tag 
                                ? 'bg-indigo-600 text-white border border-indigo-600' 
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600 dark:bg-[#1e1e2d] dark:border-gray-700 dark:text-gray-300 dark:hover:border-indigo-500'
                            }`}
                        >
                            <Hash className="w-3 h-3 opacity-60" /> {tag}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pb-10">
                {filteredPosts.length === 0 ? (
                    <div className="text-center py-20">
                         <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-10 h-10 text-gray-400" />
                         </div>
                         <h3 className="text-lg font-medium text-gray-900 dark:text-white">Không tìm thấy bài viết nào</h3>
                         <p className="text-gray-500 dark:text-gray-400">Hãy thử chọn chủ đề khác hoặc tạo bài viết mới.</p>
                         <button onClick={() => setSelectedTag(null)} className="mt-4 text-indigo-600 font-medium hover:underline">Xem tất cả</button>
                    </div>
                ) : (
                    filteredPosts.map(post => (
                        <div key={post.id} className="bg-white dark:bg-[#1e1e2d] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <img 
                                            src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.author}`} 
                                            alt="avatar" 
                                            className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200"
                                        />
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{post.author}</h3>
                                                {/* Đã sửa thẻ CheckCircle2 bằng cách bọc span */}
                                                <span title="Thành viên đã xác thực" className="flex items-center">
                                                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    
                                    {post.author === currentUser.username && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            title="Xóa bài viết của bạn"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                
                                <h2 
                                    onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                    className="text-xl font-bold text-gray-800 dark:text-white mb-2 cursor-pointer hover:text-indigo-600 transition-colors"
                                >
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 whitespace-pre-wrap">
                                    {expandedPostId === post.id ? post.content : (post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content)}
                                </p>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map(tag => (
                                        <button 
                                            key={tag} 
                                            onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                                            className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-colors ${
                                                selectedTag === tag 
                                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            <Tag className="w-3 h-3" /> {tag}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex items-center gap-6 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <button 
                                        onClick={() => handleLike(post.id)}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${(post.likes || []).includes(currentUser.username) ? 'text-pink-500' : 'text-gray-500 hover:text-pink-500'}`}
                                    >
                                        <Heart className={`w-5 h-5 ${(post.likes || []).includes(currentUser.username) ? 'fill-current' : ''}`} />
                                        {(post.likes || []).length}
                                    </button>
                                    <button 
                                        onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
                                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        {post.comments?.length || 0} Bình luận
                                    </button>
                                </div>
                            </div>

                            {/* Comments Section */}
                            {expandedPostId === post.id && (
                                <div className="bg-gray-50 dark:bg-[#252536] p-6 border-t border-gray-200 dark:border-gray-700">
                                    <div className="space-y-4 mb-6">
                                        {(!post.comments || post.comments.length === 0) && (
                                            <p className="text-center text-gray-400 text-sm italic">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                                        )}
                                        {(post.comments || []).map(comment => (
                                            <div key={comment.id} className="flex gap-3">
                                                <img src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.author}`} className="w-8 h-8 rounded-full border border-gray-200" alt="avt" />
                                                <div className="flex-1 bg-white dark:bg-[#1e1e2d] p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-bold text-xs dark:text-white">{comment.author}</span>
                                                            {/* Đã sửa thẻ CheckCircle2 bằng cách bọc span */}
                                                            <span title="Thành viên đã xác thực" className="flex items-center">
                                                                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Viết bình luận..." 
                                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1e1e2d] focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white shadow-sm"
                                            onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                                        />
                                        <button 
                                            onClick={() => handleComment(post.id)}
                                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 shadow-sm"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Create Post Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
                    <div className="bg-white dark:bg-[#28292c] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsCreateModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                             <X className="w-6 h-6" />
                        </button>
                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tạo bài viết mới</h3>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="Tiêu đề bài viết" 
                                value={newPost.title}
                                onChange={e => setNewPost({...newPost, title: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3c4043] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <textarea 
                                placeholder="Nội dung chia sẻ..." 
                                rows={5}
                                value={newPost.content}
                                onChange={e => setNewPost({...newPost, content: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3c4043] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                            <input 
                                type="text" 
                                placeholder="Tags (cách nhau bởi dấu phẩy): Hỏi đáp, Tips..." 
                                value={newPost.tags}
                                onChange={e => setNewPost({...newPost, tags: e.target.value})}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#3c4043] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <div className="flex justify-end gap-2 pt-2">
                                <button onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium">Hủy</button>
                                <button onClick={handleCreatePost} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Đăng bài</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};