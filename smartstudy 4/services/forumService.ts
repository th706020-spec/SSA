import { ForumPost, ForumComment } from '../types';
import { db } from '../firebaseConfig'; 
import { collection, getDocs, addDoc, doc, updateDoc, arrayUnion, arrayRemove, query, orderBy, getDoc } from 'firebase/firestore';

export const forumService = {
    // 1. Lấy danh sách bài đăng từ Firebase
    getPosts: async (): Promise<ForumPost[]> => {
        try {
            // Sắp xếp bài đăng theo thời gian mới nhất
            const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const posts: ForumPost[] = [];
            querySnapshot.forEach((document) => {
                posts.push({ id: document.id, ...document.data() } as ForumPost);
            });
            return posts;
        } catch (error) {
            console.error("Lỗi tải bài đăng từ Firebase:", error);
            return [];
        }
    },

    // 2. Tạo bài đăng mới lên Firebase
    createPost: async (post: ForumPost) => {
        try {
            // Loại bỏ id tạm thời vì Firebase sẽ tự sinh ra ID chuẩn
            const { id, ...postData } = post; 
            const docRef = await addDoc(collection(db, 'posts'), postData);
            return { ...post, id: docRef.id };
        } catch (error) {
            console.error("Lỗi tạo bài đăng:", error);
            return post;
        }
    },

    // 3. Thêm bình luận vào Firebase
    addComment: async (postId: string, comment: ForumComment) => {
        try {
            const postRef = doc(db, 'posts', postId);
            await updateDoc(postRef, {
                comments: arrayUnion(comment) // Hàm arrayUnion tự động đẩy data vào mảng
            });
        } catch (error) {
            console.error("Lỗi thêm bình luận:", error);
        }
    },

    // 4. Thả tim (Like) trên Firebase
    toggleLike: async (postId: string, username: string) => {
        try {
            const postRef = doc(db, 'posts', postId);
            const postSnap = await getDoc(postRef);
            
            if (postSnap.exists()) {
                const currentLikes = postSnap.data().likes || [];
                // Kiểm tra xem đã like chưa để thêm hoặc bỏ like
                if (currentLikes.includes(username)) {
                    await updateDoc(postRef, { likes: arrayRemove(username) });
                } else {
                    await updateDoc(postRef, { likes: arrayUnion(username) });
                }
            }
        } catch (error) {
            console.error("Lỗi thả tim:", error);
        }
    }
};