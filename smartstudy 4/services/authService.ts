import { User, Task, Project, StudentProfile, Note } from '../types';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const CURRENT_USER_KEY = 'smartstudy_current_user';
const COLLECTION_NAME = 'users';

export const authService = {
    // 1. TẠO TÀI KHOẢN MỚI
    register: async (username: string, password: string): Promise<boolean> => {
        try {
            const userRef = doc(db, COLLECTION_NAME, username);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                return false; 
            }

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

            await setDoc(userRef, newUser);
            return true;
        } catch (error) {
            console.error("Lỗi tạo tài khoản hệ thống:", error);
            return false;
        }
    },

    // 2. ĐĂNG NHẬP
    login: async (username: string, password: string): Promise<User | null> => {
        try {
            const userRef = doc(db, COLLECTION_NAME, username);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                if (userData.password === password) {
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userData));
                    return userData;
                }
            }
            return null;
        } catch (error) {
            console.error("Lỗi xác thực đăng nhập:", error);
            return null;
        }
    },

    // 3. ĐĂNG XUẤT
    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    // 4. LẤY THÔNG TIN USER (Local)
    getCurrentUser: (): User | null => {
        const data = localStorage.getItem(CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    // 5. ĐỒNG BỘ DỮ LIỆU
    updateUserData: async (
        tasks?: Task[], 
        projects?: Project[], 
        profile?: StudentProfile | null,
        notes?: Note[],
        settings?: User['settings'],
        avatar?: string
    ) => {
        try {
            const currentUserString = localStorage.getItem(CURRENT_USER_KEY);
            if (!currentUserString) return;

            const currentUser: User = JSON.parse(currentUserString);

            if (tasks !== undefined) currentUser.data.tasks = tasks;
            if (projects !== undefined) currentUser.data.projects = projects;
            if (profile !== undefined) currentUser.data.profile = profile;
            if (notes !== undefined) currentUser.data.notes = notes;
            if (settings !== undefined) currentUser.settings = settings;
            if (avatar !== undefined) currentUser.avatar = avatar;

            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));

            const userRef = doc(db, COLLECTION_NAME, currentUser.username);
            await updateDoc(userRef, {
                avatar: currentUser.avatar,
                settings: currentUser.settings,
                data: currentUser.data
            });

        } catch (error) {
            console.error("Lỗi đồng bộ dữ liệu người dùng:", error);
        }
    }
};