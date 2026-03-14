import { collection, addDoc, getDocs, doc, updateDoc, getDoc, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig"; 
import { ForumPost, ForumComment } from '../types';

// Trỏ thẳng vào bảng 'posts' trên cơ sở dữ liệu Firebase
const forumCollection = collection(db, "posts");

export const forumService = {
    // 1. LẤY TOÀN BỘ BÀI VIẾT TỪ FIREBASE
    getPosts: async (): Promise<ForumPost[]> => {
        try {
            // Sắp xếp bài mới nhất lên đầu (Giả định trong ForumPost của bạn có thuộc tính createdAt)
            const q = query(forumCollection, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            const posts: ForumPost[] = [];
            querySnapshot.forEach((document) => {
                // Lấy ID thật của Firebase gán vào bài viết
                posts.push({ id: document.id, ...document.data() } as ForumPost);
            });
            return posts;
        } catch (error) {
            console.error("Lỗi khi tải bài viết từ Firebase:", error);
            return []; // Lỗi thì trả về mảng rỗng để không sập web
        }
    },

    // 2. TẠO BÀI VIẾT MỚI
    createPost: async (post: Omit<ForumPost, "id">): Promise<boolean> => {
        try {
            await addDoc(forumCollection, post);
            return true; // Đăng thành công
        } catch (error) {
            console.error("Lỗi khi đăng bài:", error);
            return false;
        }
    },

    // 3. THÊM BÌNH LUẬN VÀO BÀI VIẾT
    addComment: async (postId: string, comment: ForumComment): Promise<boolean> => {
        try {
            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef); // Kéo dữ liệu bài viết hiện tại về trước

            if (postSnap.exists()) {
                const postData = postSnap.data() as ForumPost;
                const currentComments = postData.comments || [];
                
                // Nhét bình luận mới vào cuối mảng
                const updatedComments = [...currentComments, comment];

                // Cập nhật lại lên Firebase
                await updateDoc(postRef, { comments: updatedComments });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Lỗi khi bình luận:", error);
            return false;
        }
    },

    // 4. THẢ TIM / BỎ TIM BÀI VIẾT
    toggleLike: async (postId: string, username: string): Promise<boolean> => {
        try {
            const postRef = doc(db, "posts", postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data() as ForumPost;
                const currentLikes = postData.likes || [];

                const hasLiked = currentLikes.includes(username);
                // Nếu có tên rồi thì lọc bỏ đi (bỏ tim), chưa có thì nhét thêm vào (thả tim)
                const newLikes = hasLiked 
                    ? currentLikes.filter(u => u !== username) 
                    : [...currentLikes, username];

                await updateDoc(postRef, { likes: newLikes });
                return true;
            }
            return false;
        } catch (error) {
            console.error("Lỗi khi thả tim:", error);
            return false;
        }
    }
};