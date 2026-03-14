// Enum for View Navigation
export enum ViewState {
    DASHBOARD = 'DASHBOARD',
    SCHEDULE = 'SCHEDULE',
    POMODORO = 'POMODORO',
    PROJECTS = 'PROJECTS',
    SSR_PROFILE = 'SSR_PROFILE',
    SETTINGS = 'SETTINGS',
    FORUM = 'FORUM',
    TRENDS = 'TRENDS',
    FEEDBACK = 'FEEDBACK'
}

// User Interface
export interface User {
    username: string;
    password?: string;
    avatar?: string;
    settings?: {
        notifications: boolean;
        soundEnabled: boolean;
    };
    data: {
        tasks: Task[];
        projects: Project[];
        profile: StudentProfile | null;
    }
}

// Interfaces for Schedule
export interface Task {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    duration: number; // minutes
    actualDuration?: number; // minutes spent
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
    groupName: string;
    title: string;
    description: string;
    color: string;
    advice: string[];
}

export interface RoadmapPhase {
    phase: string;
    focus: string;
    duration: string;
    details?: string;
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
    name: string;
    phoneSurvey: PhoneUsageSurvey;
    sleepSurvey: SleepSurvey;
    analysis: SSRAnalysis | null;
}

export interface AiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Interfaces for Forum
export interface ForumComment {
    id: string;
    author: string;
    authorAvatar?: string;
    content: string;
    createdAt: string;
}

export interface ForumPost {
    id?: string; // Firebase sẽ tự cấp ID, nên để dấu ? (có thể trống lúc tạo)
    author: string;
    authorAvatar?: string;
    title: string;
    content: string;
    tags: string[];
    likes: string[];
    comments: ForumComment[];
    createdAt: string;
}

// Interface for Feedback
export interface Feedback {
    id?: string; // Tương tự, Firebase sẽ tự cấp ID
    user: string;
    type: 'bug' | 'feature' | 'other';
    content: string;
    createdAt: string;
}