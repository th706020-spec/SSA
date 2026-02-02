import { GoogleGenAI, Type } from "@google/genai";
import { RemediationPlan, Task, PhoneUsageSurvey, SSRAnalysis } from "../types";

// Initialize Gemini Client
// WARNING: In a real production app, never expose API keys on the client side.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Generates a study schedule based on user's focus areas and available hours.
 */
export const generateSmartSchedule = async (
    focusList: string[],
    date: string,
    availableHours: number
): Promise<Task[]> => {
    try {
        const prompt = `
        I am a student needing a schedule for ${date}. 
        I have ${availableHours} hours available to study.
        My focus tasks/subjects are: ${focusList.join(', ')}.
        
        IMPORTANT: Create a "Pomodoro" style schedule.
        1. Break the study time into intervals of 25 minutes for "study" and 5 minutes for "break".
        2. Every 4 Pomodoros (approx 2 hours), schedule a longer break (15-20 mins).
        3. Assign specific subjects from my focus list to the study blocks.
        4. Return a JSON array of tasks.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            startTime: { type: Type.STRING, description: "Format HH:mm" },
                            duration: { type: Type.NUMBER, description: "Duration in minutes" },
                            category: { type: Type.STRING, enum: ["study", "project", "break", "review"] }
                        },
                        required: ["title", "startTime", "duration", "category"]
                    }
                }
            }
        });

        const rawData = response.text;
        if (!rawData) return [];

        const tasks: any[] = JSON.parse(rawData);
        
        return tasks.map((t, index) => ({
            id: `auto-${Date.now()}-${index}`,
            title: t.title,
            startTime: t.startTime,
            duration: t.duration,
            category: t.category,
            date: date,
            completed: false
        }));

    } catch (error) {
        console.error("Error generating schedule:", error);
        return [];
    }
};

/**
 * Analyzes a weakness/topic and provides a remediation plan.
 */
export const generateRemediationPlan = async (
    subject: string,
    weaknessDescription: string
): Promise<RemediationPlan | null> => {
    try {
        const prompt = `
        Tôi là sinh viên đang gặp khó khăn môn: ${subject}.
        Vấn đề cụ thể: ${weaknessDescription}.
        Hãy đóng vai gia sư giỏi, giải thích ngắn gọn khái niệm này bằng tiếng Việt.
        Sau đó đưa ra lộ trình 3-5 bước để khắc phục điểm yếu này.
        Cuối cùng, đưa ra 1 câu hỏi trắc nghiệm để kiểm tra.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        explanation: { type: Type.STRING },
                        steps: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    step: { type: Type.INTEGER },
                                    action: { type: Type.STRING },
                                    resource: { type: Type.STRING }
                                }
                            }
                        },
                        quizQuestion: { type: Type.STRING }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text) as RemediationPlan;

    } catch (error) {
        console.error("Error creating remedial plan:", error);
        return null;
    }
};

/**
 * SSR: Analyzes student phone usage to classify and recommend improvements.
 */
export const analyzeStudentProfile = async (
    survey: PhoneUsageSurvey
): Promise<SSRAnalysis | null> => {
    try {
        const prompt = `
        Bạn là SSR (Smart Study Rhythm). Hãy phân tích dữ liệu sử dụng điện thoại của sinh viên:
        ${JSON.stringify(survey)}

        Quy tắc phân loại (Classification Rules):
        1. Nếu dailyHours là "<2 giờ" hoặc "2–4 giờ" -> Mức độ: REASONABLE (Hợp lý).
        2. Nếu dailyHours là "4–6 giờ" -> Mức độ: AT_RISK (Có nguy cơ).
        3. Nếu dailyHours là "Trên 6 giờ" -> Mức độ: EXCESSIVE (Dư thừa).

        Dựa trên mức độ đó, hãy tạo ra một bản báo cáo JSON.
        - usageSummary: Tổng quan ngắn gọn về thói quen.
        - adviceList: Các lời khuyên cụ thể dựa trên quy tắc đã cho (ví dụ: Tắt thông báo, dùng Pomodoro, không dùng trước khi ngủ).
        - studyMethodRecommendation: Đề xuất một phương pháp học tập phù hợp để khắc phục sự xao nhãng (ví dụ: Deep Work nếu bị xao nhãng nhiều, Flowtime nếu kiểm soát tốt).
        - roadmap: Lộ trình 3 giai đoạn để cải thiện bản thân và học tập tốt hơn.
        `;

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        usageLevel: { type: Type.STRING, enum: ['REASONABLE', 'AT_RISK', 'EXCESSIVE'] },
                        usageLevelLabel: { type: Type.STRING },
                        usageSummary: { type: Type.STRING },
                        adviceList: { type: Type.ARRAY, items: { type: Type.STRING } },
                        studyMethodRecommendation: {
                            type: Type.OBJECT,
                            properties: {
                                methodName: { type: Type.STRING },
                                description: { type: Type.STRING },
                                reason: { type: Type.STRING }
                            }
                        },
                        roadmap: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    phase: { type: Type.STRING },
                                    focus: { type: Type.STRING },
                                    duration: { type: Type.STRING }
                                }
                            }
                        }
                    }
                }
            }
        });

        const text = response.text;
        if (!text) return null;
        return JSON.parse(text) as SSRAnalysis;
    } catch (error) {
        console.error("Error analyzing profile:", error);
        return null;
    }
};