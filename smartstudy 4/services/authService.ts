import { User, Task, Project, StudentProfile, Note } from '../types';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const CURRENT_USER_KEY = 'smartstudy_current_user';
const LOCAL_USER_DATA = 'smartstudy_local_data';

export const authService = {
    // 1. Đăng ký (Đẩy thẳng lên Firebase)
    register: async (username: string, password: string): Promise<boolean> => {
        try {
            const userRef = doc(db, 'users', username);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) return false; // Tài khoản đã tồn tại

            const newUser: User = {
                username,
                password,
                avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`,
                settings: {
                    notifications: true,
                    soundEnabled: true
                },
                data: {
                    tasks: [],
                    projects: [],
                    profile: null,
                    notes: []
                }
            };

            // Lưu lên Firebase
            await setDoc(userRef, newUser);
            return true;
        } catch (error) {
            console.error("Lỗi đăng ký Firebase:", error);
            return false;
        }
    },

    // 2. Đăng nhập (Kiểm tra dữ liệu từ Firebase)
    login: async (username: string, password: string): Promise<User | null> => {
        try {
            const userRef = doc(db, 'users', username);
            const docSnap = await getDoc(userRef);

            if (docSnap.exists()) {
                const user = docSnap.data() as User;
                if (user.password === password) {
                    // Lưu cắm chốt ở máy để lần sau load cho nhanh
                    localStorage.setItem(CURRENT_USER_KEY, username);
                    localStorage.setItem(LOCAL_USER_DATA, JSON.stringify(user));
                    return user;
                }
            }
            return null;
        } catch (error) {
            console.error("Lỗi đăng nhập Firebase:", error);
            return null;
        }
    },

    // 3. Đăng xuất
    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(LOCAL_USER_DATA);
    },

    // 4. Lấy dữ liệu người dùng ngay lập tức (Để giao diện không bị giật)
    getCurrentUser: (): User | null => {
        const username = localStorage.getItem(CURRENT_USER_KEY);
        const userDataString = localStorage.getItem(LOCAL_USER_DATA);
        
        if (!username || !userDataString) return null;
        return JSON.parse(userDataString) as User;
    },

    // 5. Cập nhật dữ liệu (Lưu ở máy trước, đẩy lên mây chạy ngầm)
    updateUserData: (
        tasks?: Task[], 
        projects?: Project[], 
        profile?: StudentProfile | null,
        notes?: Note[],
        settings?: User['settings'],
        avatar?: string
    ) => {
        const username = localStorage.getItem(CURRENT_USER_KEY);
        const userDataString = localStorage.getItem(LOCAL_USER_DATA);
        
        if (!username || !userDataString) return;

        const currentUser = JSON.parse(userDataString) as User;

        // Cập nhật vào bản nháp local
        if (tasks !== undefined) currentUser.data.tasks = tasks;
        if (projects !== undefined) currentUser.data.projects = projects;
        if (profile !== undefined) currentUser.data.profile = profile;
        if (notes !== undefined) currentUser.data.notes = notes;
        if (settings !== undefined) currentUser.settings = settings;
        if (avatar !== undefined) currentUser.avatar = avatar;

        localStorage.setItem(LOCAL_USER_DATA, JSON.stringify(currentUser));

        // CHẠY NGẦM: Bắn dữ liệu lên Firebase
        setDoc(doc(db, 'users', username), currentUser, { merge: true })
            .catch(err => console.error("Lỗi đồng bộ ngầm lên Firebase:", err));
    }
};