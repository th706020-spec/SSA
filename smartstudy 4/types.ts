// Enum for View Navigation
export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    SCHEDULE = 'SCHEDULE',
    POMODORO = 'POMODORO',
    PROJECTS = 'PROJECTS',
    SSR_PROFILE = 'SSR_PROFILE',
    NOTES = 'NOTES',
    FORUM = 'FORUM',
    USER_DIRECTORY = 'USER_DIRECTORY', // New view
    SETTINGS = 'SETTINGS'
}

// User Interface
export interface User {
    id: string;
    username: string;
    password?: string;
    avatar?: string; // New: Avatar URL
    settings?: {
        notifications: boolean;
        soundEnabled: boolean;
    };
    data: {
        tasks: Task[];
        projects: Project[];
        profile: StudentProfile | null;
        notes: Note[]; // New: User notes
    }
}

// Interfaces for Notes
// Interfaces for Notes
export interface Note {
    id: string;
    title: string;
    content: string; // HTML or Text
    type: 'text' | 'checklist'; // Dạng văn bản hoặc danh sách
    items?: { text: string; done: boolean }[]; // Các mục trong checklist
    media?: string[]; // Mảng chứa link ảnh
    updatedAt: string;
    color?: string; // Màu nền note
    
    // --- CÁC DÒNG MỚI CẦN THÊM ---
    tags?: string[];      // <--- Thêm dòng này để hết lỗi 'tags'
    createdAt: string;    // <--- Thêm dòng này để tránh lỗi ngày tạo
}

// Interfaces for Forum
export interface ForumPost {
    id: string;
    author: string;
    authorAvatar?: string;
    title: string;
    content: string;
    likes: string[]; // Array of usernames who liked
    comments: ForumComment[];
    createdAt: string;
    tags: string[];
}

export interface ForumComment {
    id: string;
    author: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
}

// Interfaces for Schedule
export interface Task {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    duration: number; // minutes
    category: 'study' | 'project' | 'break' | 'review';
    completed: boolean;
    description?: string;
}

// Interfaces for Projects
export interface Project {
    id: string;
    name: string;
    deadline: string;
    progress: number;
    description: string;
}

// Interfaces for Remediation
export interface RemediationPlan {
    topic: string;
    explanation: string;
    steps: {
        step: number;
        action: string;
        resource?: string;
    }[];
    quizQuestion: string;
}

// SSR: Phone Usage Survey Answers
export interface PhoneUsageSurvey {
    dailyHours: string; 
    peakTime: string;
    purposes: string[];
    usageDuringStudy: string;
    overuseIntention: string;
    hasLimits: string;
    impact: string;
}

// SSR: Sleep Survey Answers
export interface SleepSurvey {
    sleepDuration: string;
    bedTime: string;
    fallAsleepTime: string;
    sleepQuality: string;
    preSleepDevice: string;
    wakeUpState: string;
    impact: string;
}

// SSR: Analysis Result Logic
export interface AnalysisResultGroup {
    groupName: string; // e.g., "Nhóm 1"
    title: string; // e.g., "Lành mạnh"
    description: string;
    color: string; // Tailwind class
    advice: string[];
}

export interface RoadmapPhase {
    phase: string;
    focus: string;
    duration: string;
    details?: string; // Added details for clicking
}

export interface SSRAnalysis {
    phone: AnalysisResultGroup;
    sleep: AnalysisResultGroup;
    studyMethodRecommendation: {
        methodName: string;
        description: string;
        reason: string;
    };
    roadmap: RoadmapPhase[];
}

// SSR: Complete Profile
export interface StudentProfile {
    name: string; // Username
    phoneSurvey: PhoneUsageSurvey;
    sleepSurvey: SleepSurvey;
    analysis: SSRAnalysis | null;
}

export interface AiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}