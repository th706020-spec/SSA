import React, { useState } from 'react';
import { StudentProfile, AnalysisResultGroup, RoadmapPhase } from '../types';
import { UserCheck, Smartphone, Moon, Lightbulb, Map, X, Info } from 'lucide-react';

interface SSRProfileProps {
    profile: StudentProfile;
}

export const SSRProfile: React.FC<SSRProfileProps> = ({ profile }) => {
    const analysis = profile.analysis;
    const [selectedPhase, setSelectedPhase] = useState<RoadmapPhase | null>(null);

    if (!analysis) return <div className="p-8 text-center text-gray-500">Chưa có dữ liệu phân tích.</div>;

    const renderCard = (icon: any, title: string, result: AnalysisResultGroup) => (
        <div className={`rounded-xl border shadow-sm overflow-hidden bg-white dark:bg-[#1e1e2d] dark:border-gray-700`}>
            <div className={`p-4 border-b dark:border-gray-700 flex items-center gap-3 ${result.color} dark:bg-opacity-10`}>
                <div className="bg-white/20 p-2 rounded-full">{icon}</div>
                <div>
                    <h3 className="font-bold text-lg dark:text-white">{title}</h3>
                    <div className="text-xs font-bold uppercase tracking-wide opacity-90">{result.groupName}: {result.title}</div>
                </div>
            </div>
            <div className="p-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">{result.description}</p>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Lời khuyên
                </h4>
                <ul className="space-y-2">
                    {result.advice.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                            <span className="text-indigo-500 font-bold">•</span> {item}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                    <UserCheck className="w-48 h-48 -mr-10 -mt-10" />
                </div>
                <h2 className="text-3xl font-bold mb-2">Hồ sơ SmartStudy</h2>
                <p className="text-indigo-100 max-w-2xl">
                    Kết quả phân tích của <b>{profile.name}</b>.
                </p>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderCard(<Smartphone className="w-6 h-6"/>, "Thói quen Điện thoại", analysis.phone)}
                {renderCard(<Moon className="w-6 h-6"/>, "Vệ sinh Giấc ngủ", analysis.sleep)}
            </div>

             {/* Roadmap */}
             <div className="bg-white dark:bg-[#1e1e2d] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white mb-6">
                    <Map className="w-6 h-6 text-indigo-600" /> Lộ trình cải thiện chung
                </h3>
                <div className="relative border-l-2 border-indigo-100 dark:border-gray-700 ml-3 space-y-8 pb-4">
                    {analysis.roadmap.map((step, idx) => (
                        <div key={idx} className="relative pl-8 group">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-gray-800 border-4 border-indigo-600"></div>
                            <div 
                                onClick={() => setSelectedPhase(step)}
                                className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded mb-2 inline-block">
                                    {step.phase}
                                </span>
                                <div className="flex justify-between items-start gap-4">
                                    <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        {step.focus}
                                        <Info className="w-4 h-4 text-gray-400" />
                                    </h4>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                                        {step.duration}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 👇 ĐÃ FIX: DETAIL MODAL PHỦ KÍN MÀN HÌNH 👇 */}
            {selectedPhase && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Lớp nền đen phủ toàn bộ trình duyệt */}
                    <div 
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
                        onClick={() => setSelectedPhase(null)}
                    ></div>
                    
                    {/* Nội dung Modal */}
                    <div className="bg-white dark:bg-[#28292c] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative z-[101] animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1 block">
                                    {selectedPhase.phase} ({selectedPhase.duration})
                                </span>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPhase.focus}</h3>
                            </div>
                            <button onClick={() => setSelectedPhase(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="prose dark:prose-invert">
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                                {selectedPhase.details || "Thực hiện các thói quen nhỏ hàng ngày như Pomodoro, tắt thiết bị trước khi ngủ 30 phút và đặt mục tiêu rõ ràng cho từng buổi học."}
                            </p>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
                                <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">Hành động ngay:</h4>
                                <ul className="list-disc pl-5 text-indigo-800 dark:text-indigo-200 space-y-1">
                                    <li>Lên lịch học vào khung giờ vàng.</li>
                                    <li>Tránh xa điện thoại khi học.</li>
                                    <li>Ngủ trước 23h.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};