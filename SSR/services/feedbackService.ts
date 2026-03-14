import { collection, addDoc, getDocs, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { Feedback } from "../types";

const feedbacksCollection = collection(db, "feedbacks");

export const feedbackService = {
    // 1. Gửi phản hồi
    sendFeedback: async (feedbackData: Omit<Feedback, "id">): Promise<boolean> => {
        try {
            await addDoc(feedbacksCollection, feedbackData);
            return true;
        } catch (error) {
            console.error("Lỗi khi gửi phản hồi:", error);
            return false;
        }
    },

    // 2. Lấy danh sách
    getAllFeedbacks: async (): Promise<Feedback[]> => {
        try {
            const q = query(feedbacksCollection, orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            
            const feedbacks: Feedback[] = [];
            querySnapshot.forEach((document) => {
                feedbacks.push({ id: document.id, ...document.data() } as Feedback);
            });
            return feedbacks;
        } catch (error) {
            console.error("Lỗi khi tải phản hồi:", error);
            return [];
        }
    },

    // 3. Xóa phản hồi (THÊM MỚI ĐỂ NÚT THÙNG RÁC HOẠT ĐỘNG)
    deleteFeedback: async (id: string): Promise<boolean> => {
        try {
            await deleteDoc(doc(db, "feedbacks", id));
            return true;
        } catch (error) {
            console.error("Lỗi khi xóa:", error);
            return false;
        }
    }
};  