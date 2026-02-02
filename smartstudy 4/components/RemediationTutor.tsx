import React, { useState } from 'react';
import { generateRemediationPlan } from '../services/geminiService';
import { RemediationPlan } from '../types';
import { BookOpen, BrainCircuit, ArrowRight, Lightbulb, Check, HelpCircle } from 'lucide-react';

export const RemediationTutor: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [problem, setProblem] = useState('');
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState<RemediationPlan | null>(null);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !problem) return;

        setLoading(true);
        const result = await generateRemediationPlan(subject, problem);
        setPlan(result);
        setLoading(false);
    };

    return (
        <div className="h-full flex flex-col max-w-5xl mx-auto">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BrainCircuit className="text-indigo-600" />
                    Khắc phục điểm yếu kiến thức
                </h2>
                <p className="text-gray-500">Mô tả vấn đề của bạn, AI sẽ xây dựng lộ trình ôn tập cấp tốc.</p>
            </header>

            {!plan ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 w-full max-w-xl">
                        <form onSubmit={handleAnalyze} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Môn học / Chủ đề</label>
                                <div className="relative">
                                    <BookOpen className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Ví dụ: Toán cao cấp, Lập trình Java..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vấn đề bạn đang gặp phải</label>
                                <textarea
                                    value={problem}
                                    onChange={(e) => setProblem(e.target.value)}
                                    rows={4}
                                    placeholder="Ví dụ: Tôi không hiểu cách tính tích phân từng phần, hay bị nhầm lẫn công thức..."
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !subject || !problem}
                                className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex justify-center items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        Đang phân tích...
                                    </>
                                ) : (
                                    <>
                                        Phân tích & Lên lộ trình <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pb-10 animate-in fade-in duration-500 slide-in-from-bottom-4">
                    <button 
                        onClick={() => setPlan(null)}
                        className="text-sm text-gray-500 hover:text-indigo-600 mb-4 flex items-center gap-1"
                    >
                        ← Quay lại tìm kiếm khác
                    </button>

                    <div className="grid gap-6">
                        {/* Concept Explanation Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 rounded-lg">
                                    <Lightbulb className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Giải thích khái niệm: {plan.topic}</h3>
                                    <p className="text-gray-700 leading-relaxed">{plan.explanation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Plan */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Check className="w-5 h-5 text-green-500" />
                                Lộ trình khắc phục
                            </h3>
                            <div className="space-y-6">
                                {plan.steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {step.step}
                                            </div>
                                            {idx !== plan.steps.length - 1 && <div className="w-0.5 h-full bg-gray-100 mt-2"></div>}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="text-gray-800 font-medium mb-1">{step.action}</p>
                                            {step.resource && (
                                                <p className="text-sm text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">
                                                    Tài liệu gợi ý: {step.resource}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quiz Section */}
                        {plan.quizQuestion && (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-6 h-6 text-purple-600 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-purple-900 mb-2">Câu hỏi tự kiểm tra</h3>
                                        <p className="text-purple-800 italic">"{plan.quizQuestion}"</p>
                                        <div className="mt-4">
                                            <button className="text-sm text-purple-700 font-semibold hover:underline">
                                                Xem đáp án (Tự suy nghĩ trước nhé!)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};