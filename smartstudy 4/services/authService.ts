import { User, Task, Project, StudentProfile, Note } from '../types';

const STORAGE_KEY = 'smartstudy_users';
const CURRENT_USER_KEY = 'smartstudy_current_user';

export const authService = {
    // Get all users
    getUsers: (): Record<string, User> => {
        const users = localStorage.getItem(STORAGE_KEY);
        return users ? JSON.parse(users) : {};
    },

    // Save users map
    saveUsers: (users: Record<string, User>) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    },

    // Register
    register: (username: string, password: string): boolean => {
        const users = authService.getUsers();
        if (users[username]) return false; // User exists

        users[username] = {
            username,
            password,
            avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${username}`, // Default avatar
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
        authService.saveUsers(users);
        return true;
    },

    // Login
    login: (username: string, password: string): User | null => {
        const users = authService.getUsers();
        const user = users[username];
        if (user && user.password === password) {
            localStorage.setItem(CURRENT_USER_KEY, username);
            return user;
        }
        return null;
    },

    // Logout
    logout: () => {
        localStorage.removeItem(CURRENT_USER_KEY);
    },

    // Get current logged in user
    getCurrentUser: (): User | null => {
        const username = localStorage.getItem(CURRENT_USER_KEY);
        if (!username) return null;
        const users = authService.getUsers();
        return users[username] || null;
    },

    // Update current user data
    updateUserData: (
        tasks?: Task[], 
        projects?: Project[], 
        profile?: StudentProfile | null,
        notes?: Note[],
        settings?: User['settings'],
        avatar?: string
    ) => {
        const username = localStorage.getItem(CURRENT_USER_KEY);
        if (!username) return;

        const users = authService.getUsers();
        if (users[username]) {
            if (tasks !== undefined) users[username].data.tasks = tasks;
            if (projects !== undefined) users[username].data.projects = projects;
            if (profile !== undefined) users[username].data.profile = profile;
            if (notes !== undefined) users[username].data.notes = notes;
            if (settings !== undefined) users[username].settings = settings;
            if (avatar !== undefined) users[username].avatar = avatar;
            
            authService.saveUsers(users);
        }
    }
};