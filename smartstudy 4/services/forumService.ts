import { ForumPost, ForumComment } from '../types';

const FORUM_KEY = 'smartstudy_forum_posts';

// Dummy initial data - User posts only
const INITIAL_POSTS: ForumPost[] = [
    {
        id: 'post-2',
        author: 'hacker_lor',
        authorAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=hacker',
        title: 'Làm sao để tập trung khi học Coding?',
        content: 'Mình thường xuyên bị xao nhãng bởi Facebook khi đang code. Có ai dùng phương pháp Pomodoro kết hợp với chặn web không? Cho mình xin review với.',
        likes: [],
        tags: ['Hỏi đáp', 'Kỹ năng mềm'],
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        comments: [
            {
                id: 'c-1',
                author: 'study_mate',
                authorAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=study',
                content: 'Mình đang dùng extension Forest, khá hiệu quả đó bạn.',
                createdAt: new Date().toISOString()
            }
        ]
    },
    {
        id: 'post-3',
        author: 'design_pro',
        authorAvatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=design',
        title: 'Chia sẻ tài liệu học UX/UI cơ bản',
        content: 'Chào mọi người, mình mới tìm được bộ tài liệu Google UX Design Certificate miễn phí. Ai cần thì comment email mình gửi nhé!',
        likes: ['user1', 'hacker_lor'],
        tags: ['Chia sẻ', 'Tài liệu'],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        comments: []
    }
];

export const forumService = {
    getPosts: (): ForumPost[] => {
        const data = localStorage.getItem(FORUM_KEY);
        if (!data) {
            localStorage.setItem(FORUM_KEY, JSON.stringify(INITIAL_POSTS));
            return INITIAL_POSTS;
        }
        return JSON.parse(data);
    },

    createPost: (post: ForumPost) => {
        const posts = forumService.getPosts();
        const newPosts = [post, ...posts];
        localStorage.setItem(FORUM_KEY, JSON.stringify(newPosts));
        return newPosts;
    },

    addComment: (postId: string, comment: ForumComment) => {
        const posts = forumService.getPosts();
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                return { ...p, comments: [...p.comments, comment] };
            }
            return p;
        });
        localStorage.setItem(FORUM_KEY, JSON.stringify(updatedPosts));
        return updatedPosts;
    },

    toggleLike: (postId: string, username: string) => {
        const posts = forumService.getPosts();
        const updatedPosts = posts.map(p => {
            if (p.id === postId) {
                const hasLiked = p.likes.includes(username);
                const newLikes = hasLiked 
                    ? p.likes.filter(u => u !== username) 
                    : [...p.likes, username];
                return { ...p, likes: newLikes };
            }
            return p;
        });
        localStorage.setItem(FORUM_KEY, JSON.stringify(updatedPosts));
        return updatedPosts;
    }
};