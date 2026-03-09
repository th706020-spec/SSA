import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { GraduationCap, UserPlus, LogIn, Users, Loader2 } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, getCountFromServer } from 'firebase/firestore';

interface AuthProps {
    onLogin: (user: User, isRegister?: boolean) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [userCount, setUserCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false); // Trạng thái chờ xử lý

    // Đếm số lượng sinh viên từ cơ sở dữ liệu đám mây
    useEffect(() => {
        const fetchUserCount = async () => {
            try {
                const coll = collection(db, 'users');
                const snapshot = await getCountFromServer(coll);
                setUserCount(snapshot.data().count);
            } catch (err) {
                console.error("Lỗi đếm số lượng tài khoản hệ thống:", err);
            }
        };

        fetchUserCount();
    }, []);

    // THÊM ASYNC VÀO ĐÂY ĐỂ CHỜ HỆ THỐNG PHẢN HỒI
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const cleanUsername = username.trim();
        const cleanPassword = password.trim();

        if (!cleanUsername || !cleanPassword) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        setIsLoading(true); // Bật hiệu ứng đang tải

        try {
            if (isLogin) {
                // Thêm AWAIT để đợi đăng nhập
                const user = await authService.login(cleanUsername, cleanPassword);
                if (user) {
                    onLogin(user, false);
                } else {
                    setError('Tên đăng nhập hoặc mật khẩu không đúng');
                }
            } else {
                // Thêm AWAIT để đợi đăng ký
                const success = await authService.register(cleanUsername, cleanPassword);
                if (success) {
                    setUserCount(prev => prev + 1); // Cập nhật số lượng liền cho đẹp
                    // Đăng ký xong thì tự động đăng nhập
                    const user = await authService.login(cleanUsername, cleanPassword);
                    if (user) onLogin(user, true);
                } else {
                    setError('Tên đăng nhập đã tồn tại, vui lòng chọn tên khác');
                }
            }
        } catch (err) {
            setError('Có lỗi kết nối đến hệ thống, vui lòng thử lại sau');
            console.error(err);
        } finally {
            setIsLoading(false); // Tắt hiệu ứng tải
        }
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
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                            placeholder="Nhập tên đăng nhập..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                            placeholder="Nhập mật khẩu..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <> <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý... </>
                        ) : isLogin ? (
                            <> <LogIn className="w-5 h-5"/> Đăng nhập </>
                        ) : (
                            <> <UserPlus className="w-5 h-5"/> Đăng ký </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => { setIsLogin(!isLogin); setError(''); setUsername(''); setPassword(''); }}
                        className="text-indigo-600 font-medium hover:underline text-sm disabled:opacity-50 disabled:no-underline"
                    >
                        {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
                    </button>
                </div>
            </div>
        </div>
    );
};