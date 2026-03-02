import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { GraduationCap, UserPlus, LogIn, Users } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface AuthProps {
    onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [userCount, setUserCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading để UX mượt hơn

    // Real-time update logic (Kéo từ Firebase)
    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                // Quét số lượng documents trong collection 'users'
                const querySnapshot = await getDocs(collection(db, 'users'));
                setUserCount(querySnapshot.size);
            } catch (err) {
                console.error("Lỗi đếm số user từ Firebase:", err);
            }
        };

        fetchUserCount();
        
        // Quét lại mỗi 10 giây để cập nhật số lượng (Thay vì 2s như trước để tránh quá tải Firebase)
        const interval = setInterval(fetchUserCount, 10000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    // Sửa thành hàm async vì authService giờ đã gọi lên mây
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true); // Bật hiệu ứng loading

        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        if (!cleanUsername || !cleanPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            setIsLoading(false);
            return;
        }

        if (isLogin) {
            // Đợi Firebase trả kết quả đăng nhập
            const user = await authService.login(cleanUsername, cleanPassword);
            if (user) {
                onLogin(user);
            } else {
                setError('Tên đăng nhập hoặc mật khẩu không đúng');
            }
        } else {
            // Đợi Firebase trả kết quả đăng ký
            const success = await authService.register(cleanUsername, cleanPassword);
            if (success) {
                setUserCount(prev => prev + 1);
                // Auto login after register
                const user = await authService.login(cleanUsername, cleanPassword);
                if (user) onLogin(user);
            } else {
                setError('Tên đăng nhập đã tồn tại');
            }
        }
        
        setIsLoading(false); // Tắt hiệu ứng loading
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

            <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 border border-gray-100 relative z-10">
                <div className="text-center mb-8">
                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
                        <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">SmartStudy Rhythm</h1>
                    <p className="text-gray-500 mt-2">Đăng nhập để bắt đầu hành trình học tập.</p>
                    
                    {/* Live User Count Badge */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold animate-in fade-in duration-700">
                        <Users className="w-3.5 h-3.5" />
                        <span>{userCount} sinh viên đang sử dụng</span>
                        <span className="relative flex h-2 w-2 ml-1">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center animate-in shake">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nhập tên đăng nhập..."
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                            placeholder="Nhập mật khẩu..."
                            disabled={isLoading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? (
                            <span className="animate-pulse">Đang xử lý...</span>
                        ) : isLogin ? (
                            <> <LogIn className="w-5 h-5"/> Đăng nhập </>
                        ) : (
                            <> <UserPlus className="w-5 h-5"/> Đăng ký </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => { setIsLogin(!isLogin); setError(''); setUsername(''); setPassword(''); }}
                        className="text-indigo-600 font-medium hover:underline text-sm"
                        disabled={isLoading}
                    >
                        {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                </div>
            </div>
        </div>
    );
};