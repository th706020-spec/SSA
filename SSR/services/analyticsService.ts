import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { User } from "../types";

export const analyticsService = {
    // Hàm quét toàn bộ Firebase để tổng hợp xu hướng
    getGlobalTrends: async () => {
        try {
            // Lấy toàn bộ danh sách người dùng từ bảng 'users'
            const querySnapshot = await getDocs(collection(db, "users"));
            
            let totalUsers = 0;
            let totalTasks = 0;
            let completedTasks = 0;
            let totalStudyMinutes = 0;
            let activityDistribution = { study: 0, project: 0, break: 0, review: 0 };

            // Vòng lặp quét qua từng người dùng một
            querySnapshot.forEach((doc) => {
                const userData = doc.data() as User;
                totalUsers++; // Đếm số người

                const tasks = userData.data?.tasks || [];
                totalTasks += tasks.length; // Cộng dồn tổng nhiệm vụ

                // Quét qua từng nhiệm vụ của người dùng đó
                tasks.forEach(task => {
                    if (task.completed) completedTasks++; // Đếm nhiệm vụ đã xong

                    const duration = task.duration || 0;
                    
                    // Cộng dồn thời gian theo từng loại hoạt động
                    if (task.category === 'study') {
                        totalStudyMinutes += duration;
                        activityDistribution.study += duration;
                    } else if (task.category === 'project') {
                        activityDistribution.project += duration;
                    } else if (task.category === 'break') {
                        activityDistribution.break += duration;
                    } else if (task.category === 'review') {
                        activityDistribution.review += duration;
                    }
                });
            });

            // Tính toán các con số trung bình để hiển thị lên bảng
            const avgTasksPerUser = totalUsers > 0 ? (totalTasks / totalUsers).toFixed(1) : "0.0";
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
            const avgStudyHoursPerUser = totalUsers > 0 ? ((totalStudyMinutes / 60) / totalUsers).toFixed(1) : "0.0";

            return {
                totalUsers,
                avgTasksPerUser,
                completionRate,
                avgStudyHoursPerUser,
                activityDistribution
            };

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu xu hướng:", error);
            return null;
        }
    }
};