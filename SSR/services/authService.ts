import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
// Gọi biến app từ file cấu hình Firebase của bạn sang (sửa lại đường dẫn '../firebaseConfig' cho đúng với dự án của bạn nếu cần)
import { app } from "../firebaseConfig"; 
import { User, Task, Project, StudentProfile } from '../types';

// Khởi tạo công cụ Auth và Database từ app
const auth = getAuth(app);
const db = getFirestore(app);

const CURRENT_USER_KEY = 'smartstudy_current_user';

// Firebase Auth bắt buộc dùng Email. Hàm này tự động gắn đuôi ảo để bạn vẫn có thể đăng nhập bằng "username" như cũ
const formatEmail = (username: string) => `${username}@smartstudy.local`;

export const authService = {
    // Đăng ký tài khoản thẳng lên Firebase
    register: async (username: string, password: string): Promise<boolean> => {
        try {
            const email = formatEmail(username);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid; // Lấy ID duy nhất từ Firebase

            const newUserInfo: User = {
                username,
                password, 
                avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`,
                settings: { notifications: true, soundEnabled: true },
                data: { tasks: [], projects: [], profile: null }
            };

            // Lưu dữ liệu profile vào Firestore
            await setDoc(doc(db, "users", uid), newUserInfo);
            return true;
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error);
            return false;
        }
    },

    // Đăng nhập và kéo dữ liệu từ Firebase về
    login: async (username: string, password: string): Promise<User | null> => {
        try {
            const email = formatEmail(username);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            // Kéo toàn bộ dữ liệu (tasks, projects...) của user này từ Firestore
            const userDoc = await getDoc(doc(db, "users", uid));
            if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                // Lưu tạm vào localStorage để giao diện load ngay lập tức mà không cần chờ mạng
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ uid, ...userData }));
                return userData;
            }
            return null;
        } catch (error) {
            console.error("Sai tài khoản hoặc mật khẩu:", error);
            return null;
        }
    },

    // Đăng xuất
    logout: async () => {
        try {
            await signOut(auth);
            localStorage.removeItem(CURRENT_USER_KEY); // Xóa bộ nhớ tạm
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
        }
    },

    // Lấy thông tin người dùng đang đăng nhập (vẫn lấy từ cache để UI mượt)
    // Lấy thông tin người dùng đang đăng nhập (vẫn lấy từ cache để UI mượt)
    getCurrentUser: (): User | null => {
        const userStr = localStorage.getItem(CURRENT_USER_KEY);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch (error) {
            console.warn("Dữ liệu trong localStorage không hợp lệ. Đang dọn dẹp...");
            localStorage.removeItem(CURRENT_USER_KEY);
            return null;
        }
    },

    // Cập nhật dữ liệu đồng thời lên Firestore và Local
    updateUserData: async (
        tasks?: Task[], 
        projects?: Project[], 
        profile?: StudentProfile | null,
        settings?: User['settings'],
        avatar?: string
    ) => {
        const currentUserDataStr = localStorage.getItem(CURRENT_USER_KEY);
        if (!currentUserDataStr) return;

        const currentUser = JSON.parse(currentUserDataStr);
        const uid = currentUser.uid;

        // 1. Cập nhật dữ liệu tạm trong máy
        if (tasks !== undefined) currentUser.data.tasks = tasks;
        if (projects !== undefined) currentUser.data.projects = projects;
        if (profile !== undefined) currentUser.data.profile = profile;
        if (settings !== undefined) currentUser.settings = settings;
        if (avatar !== undefined) currentUser.avatar = avatar;

        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

        // 2. Bắn dữ liệu mới lên Firebase
        try {
            const userRef = doc(db, "users", uid);
            await updateDoc(userRef, {
                ...(tasks !== undefined && { "data.tasks": tasks }),
                ...(projects !== undefined && { "data.projects": projects }),
                ...(profile !== undefined && { "data.profile": profile }),
                ...(settings !== undefined && { "settings": settings }),
                ...(avatar !== undefined && { "avatar": avatar })
            });
        } catch (error) {
            console.error("Lỗi lưu lên DB:", error);
        }
    }
};