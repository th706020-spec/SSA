import { ForumPost, ForumComment } from '../types';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, doc, query, orderBy, getDoc } from 'firebase/firestore';

// Tên của bảng dữ liệu trên Firebase (bạn có thể đổi tên nếu muốn)
const COLLECTION_NAME = 'forum_posts';

export const forumService = {
    // 1. LẤY DANH SÁCH BÀI VIẾT TỪ FIREBASE
    getPosts: async (): Promise<ForumPost[]> => {
        try {
            // Lấy tất cả bài viết, sắp xếp theo thời gian mới nhất lên đầu
            const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            
            // Chuyển đổi dữ liệu từ Firebase thành mảng ForumPost
            const posts = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            } as ForumPost));
            
            return posts;
        } catch (error) {
            console.error("Lỗi khi tải bài viết:", error);
            return [];
        }
    },

    // 2. TẠO BÀI VIẾT MỚI LÊN FIREBASE
    createPost: async (post: ForumPost): Promise<ForumPost> => {
        try {
            // Xóa id tạm thời vì Firebase sẽ tự động tạo một ID độc nhất
            const { id, ...postDataToSave } = post;
            
            const docRef = await addDoc(collection(db, COLLECTION_NAME), postDataToSave);
            
            // Trả về bài viết kèm theo ID thật mà Firebase vừa cấp
            return { ...post, id: docRef.id };
        } catch (error) {
            console.error("Lỗi khi tạo bài viết mới:", error);
            throw error;
        }
    },

    // 3. THÊM BÌNH LUẬN VÀO BÀI VIẾT
    addComment: async (postId: string, comment: ForumComment): Promise<void> => {
        try {
            const postRef = doc(db, COLLECTION_NAME, postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data() as ForumPost;
                const currentComments = postData.comments || [];
                
                // Cập nhật lại mảng comments trên Firebase
                await updateDoc(postRef, {
                    comments: [...currentComments, comment]
                });
            }
        } catch (error) {
            console.error("Lỗi khi thêm bình luận:", error);
            throw error;
        }
    },

    // 4. THẢ TIM / BỎ THẢ TIM (LIKE)
    toggleLike: async (postId: string, username: string): Promise<void> => {
        try {
            const postRef = doc(db, COLLECTION_NAME, postId);
            const postSnap = await getDoc(postRef);

            if (postSnap.exists()) {
                const postData = postSnap.data() as ForumPost;
                const currentLikes = postData.likes || [];
                
                // Kiểm tra xem user này đã like chưa
                const hasLiked = currentLikes.includes(username);
                
                // Nếu like rồi thì lọc ra (bỏ like), nếu chưa thì thêm vào
                const newLikes = hasLiked 
                    ? currentLikes.filter(u => u !== username) 
                    : [...currentLikes, username];
                
                // Cập nhật mảng likes mới lên Firebase
                await updateDoc(postRef, {
                    likes: newLikes
                });
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật lượt thích:", error);
            throw error;
        }
    }
};