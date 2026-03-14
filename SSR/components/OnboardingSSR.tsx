import React, { useState, useRef, useEffect } from 'react';
import { PhoneUsageSurvey, SleepSurvey, SSRAnalysis, AnalysisResultGroup } from '../types';
import { BrainCircuit, ArrowRight, CheckCircle2, Moon, Smartphone, ArrowLeft, Terminal } from 'lucide-react';

interface OnboardingSSRProps {
    onComplete: (phoneSurvey: PhoneUsageSurvey, sleepSurvey: SleepSurvey, analysis: SSRAnalysis) => void;
}

const STEPS = ['Giới thiệu', 'Điện thoại', 'Giấc ngủ'];

// Helper Component for consistent selection UI
interface OptionItemProps {
    label: string;
    selected: boolean;
    onClick: () => void;
}

const OptionItem: React.FC<OptionItemProps> = ({ label, selected, onClick }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
            selected 
            ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
            : 'bg-white border-gray-200 hover:bg-gray-50'
        }`}
    >
        <div className={`w-5 h-5 flex-shrink-0 rounded-full border flex items-center justify-center transition-colors ${
            selected 
            ? 'bg-indigo-600 border-indigo-600' 
            : 'border-gray-400 bg-white'
        }`}>
            {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className={`text-sm font-medium ${selected ? 'text-indigo-900' : 'text-gray-700'}`}>{label}</span>
    </div>
);

export const OnboardingSSR: React.FC<OnboardingSSRProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    // Auto scroll to top when step changes
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [currentStep]);

    // --- STATE: PHONE SURVEY ---
    const [phoneSurvey, setPhoneSurvey] = useState<PhoneUsageSurvey>({
        dailyHours: '', peakTime: '', purposes: [], usageDuringStudy: '', overuseIntention: '', hasLimits: '', impact: ''
    });

    // --- STATE: SLEEP SURVEY ---
    const [sleepSurvey, setSleepSurvey] = useState<SleepSurvey>({
        sleepDuration: '', bedTime: '', fallAsleepTime: '', sleepQuality: '', preSleepDevice: '', wakeUpState: '', impact: ''
    });

    const togglePurpose = (value: string) => {
        setPhoneSurvey(prev => {
            const current = prev.purposes;
            return current.includes(value) ? { ...prev, purposes: current.filter(i => i !== value) } : { ...prev, purposes: [...current, value] };
        });
    };

    // --- TEST MODE BYPASS ---
    const handleTestMode = () => {
        const dummyPhone: PhoneUsageSurvey = {
            dailyHours: '2–4 giờ',
            peakTime: 'Buổi tối',
            purposes: ['Học tập / tra cứu', 'Liên lạc (nhắn tin, gọi điện)'],
            usageDuringStudy: 'Thỉnh thoảng',
            overuseIntention: 'Không',
            hasLimits: 'Có và luôn tuân thủ',
            impact: 'Không'
        };
        
        const dummySleep: SleepSurvey = {
            sleepDuration: '7–9 giờ',
            bedTime: '22h–23h',
            fallAsleepTime: '15–30 phút',
            sleepQuality: 'Ngủ sâu, ít tỉnh giấc',
            preSleepDevice: 'Không',
            wakeUpState: 'Tỉnh táo, tràn đầy năng lượng',
            impact: 'Không'
        };

        const dummyAnalysis: SSRAnalysis = {
            phone: {
                groupName: 'Nhóm 1',
                title: 'Sử dụng Hợp lý (Test Mode)',
                description: 'Đây là dữ liệu giả lập cho chế độ kiểm thử.',
                color: 'text-green-600 bg-green-50 border-green-200',
                advice: ['Tiếp tục duy trì phong độ', 'Test tính năng Pomodoro']
            },
            sleep: {
                groupName: 'Nhóm 1',
                title: 'Giấc ngủ Lành mạnh (Test Mode)',
                description: 'Đây là dữ liệu giả lập cho chế độ kiểm thử.',
                color: 'text-green-600 bg-green-50 border-green-200',
                advice: ['Ngủ đủ giấc', 'Tắt thiết bị điện tử sớm']
            },
            studyMethodRecommendation: {
                methodName: 'Flowtime Technique',
                description: 'Phương pháp tập trung tự nhiên, nghỉ ngơi khi cảm thấy mệt.',
                reason: 'Được đề xuất ngẫu nhiên trong chế độ Test.'
            },
            roadmap: [
                { phase: 'Tuần 1', focus: 'Làm quen hệ thống', duration: '7 ngày' },
                { phase: 'Tuần 2', focus: 'Tối ưu hóa', duration: '14 ngày' }
            ]
        };

        onComplete(dummyPhone, dummySleep, dummyAnalysis);
    };

    // --- LOGIC: PHONE ANALYSIS (Giữ nguyên logic cũ) ---
    const analyzePhoneUsage = (survey: PhoneUsageSurvey): AnalysisResultGroup => {
        let riskScore = 0;
        let positiveScore = 0;
        let controlScore = 0;

        // Axis 1: Duration
        if (survey.dailyHours === '2–4 giờ') riskScore += 1;
        else if (survey.dailyHours === '4–6 giờ') riskScore += 2;
        else if (survey.dailyHours === 'Trên 6 giờ') riskScore += 3;

        // Axis 2: Peak Time
        if (survey.peakTime === 'Buổi chiều') riskScore += 1;
        else if (survey.peakTime === 'Buổi tối') riskScore += 2;
        else if (survey.peakTime === 'Trước khi ngủ') riskScore += 3;

        // Axis 3: Purpose
        let riskPurposePoints = 0;
        let positivePurposePoints = 0;
        if (survey.purposes.includes('Học tập / tra cứu')) positivePurposePoints += 2;
        if (survey.purposes.includes('Liên lạc (nhắn tin, gọi điện)')) positivePurposePoints += 1;
        if (survey.purposes.includes('Mạng xã hội')) { riskScore += 2; riskPurposePoints += 2; }
        if (survey.purposes.includes('Giải trí (xem phim, chơi game)')) { riskScore += 3; riskPurposePoints += 3; }

        // Axis 4: Control
        if (survey.usageDuringStudy === 'Thỉnh thoảng') { riskScore += 1; controlScore += 1; }
        else if (survey.usageDuringStudy === 'Thường xuyên') { riskScore += 2; controlScore += 2; }
        
        if (survey.overuseIntention === 'Thỉnh thoảng') { riskScore += 1; controlScore += 1; }
        else if (survey.overuseIntention === 'Thường xuyên') { riskScore += 2; controlScore += 2; }
        
        if (survey.hasLimits === 'Có nhưng ít khi tuân thủ') { riskScore += 1; controlScore += 1; }
        else if (survey.hasLimits === 'Không đặt giới hạn') { riskScore += 2; controlScore += 2; }

        // Axis 5: Impact
        if (survey.impact === 'Có nhưng không đáng kể') riskScore += 1;
        else if (survey.impact === 'Có và ảnh hưởng rõ rệt') riskScore += 3;

        // Classification
        const totalPurposePoints = riskPurposePoints + positivePurposePoints;
        const isHighUsage = survey.dailyHours === '4–6 giờ' || survey.dailyHours === 'Trên 6 giờ';
        
        if (isHighUsage && totalPurposePoints > 0 && (positivePurposePoints / totalPurposePoints >= 0.6) && controlScore <= 4) {
             return {
                groupName: 'Nhóm 5',
                title: 'Dùng nhiều vì mục đích tốt',
                description: 'Bạn sử dụng điện thoại nhiều nhưng chủ yếu phục vụ học tập/công việc và vẫn giữ được kiểm soát.',
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                advice: ['Duy trì thói quen hiện tại', 'Chú ý nghỉ ngơi mắt mỗi 20 phút (Quy tắc 20-20-20)']
            };
        }

        if (riskScore >= 12) return {
            groupName: 'Nhóm 4', title: 'Dư thừa / Không hợp lý', description: 'Mức độ sử dụng báo động, ảnh hưởng tiêu cực đến cuộc sống.', color: 'text-red-600 bg-red-50 border-red-200',
            advice: ['Cần cai nghiện Dopamine ngay lập tức', 'Xóa app MXH khỏi điện thoại', 'Nhờ người thân giám sát']
        };
        if (riskScore >= 8) return {
            groupName: 'Nhóm 3', title: 'Mức độ sử dụng có nguy cơ', description: 'Bạn đang dành quá nhiều thời gian cho giải trí, cần điều chỉnh.', color: 'text-orange-600 bg-orange-50 border-orange-200',
            advice: ['Đặt giới hạn thời gian ứng dụng', 'Không mang điện thoại lên giường ngủ']
        };
        if (riskScore >= 5) return {
            groupName: 'Nhóm 2', title: 'Hơi dư thừa', description: 'Thỉnh thoảng bạn vẫn bị cuốn vào điện thoại nhưng chưa quá nghiêm trọng.', color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            advice: ['Tắt thông báo không cần thiết', 'Ưu tiên học xong mới giải trí']
        };
        
        return {
            groupName: 'Nhóm 1', title: 'Sử dụng Hợp lý', description: 'Bạn kiểm soát rất tốt công nghệ. Xin chúc mừng!', color: 'text-green-600 bg-green-50 border-green-200',
            advice: ['Tiếp tục duy trì', 'Dùng thời gian rảnh để phát triển kỹ năng mềm']
        };
    };

    // --- LOGIC: SLEEP ANALYSIS (Giữ nguyên logic cũ) ---
    const analyzeSleep = (survey: SleepSurvey): AnalysisResultGroup => {
        let score = 0;
        if (survey.sleepDuration === '5–6 giờ') score += 2;
        else if (survey.sleepDuration === 'Dưới 5 giờ' || survey.sleepDuration === 'Trên 9 giờ') score += 3;
        else if (survey.sleepDuration === '6–7 giờ') score += 1;

        if (survey.bedTime === '22h–23h') score += 1;
        else if (survey.bedTime === '23h–0h') score += 2;
        else if (survey.bedTime === 'Sau 0h') score += 3;

        if (survey.fallAsleepTime === '15–30 phút') score += 1;
        else if (survey.fallAsleepTime === '30–60 phút') score += 2;
        else if (survey.fallAsleepTime === 'Trên 60 phút') score += 3;

        if (survey.sleepQuality.includes('Thỉnh thoảng')) score += 1;
        else if (survey.sleepQuality.includes('Hay tỉnh')) score += 2;
        else if (survey.sleepQuality.includes('Rất khó')) score += 3;

        if (survey.preSleepDevice.includes('dưới 30 phút')) score += 1;
        else if (survey.preSleepDevice.includes('30–60 phút')) score += 2;
        else if (survey.preSleepDevice.includes('trên 60 phút')) score += 3;

        if (survey.wakeUpState.includes('Bình thường')) score += 1;
        else if (survey.wakeUpState.includes('Mệt mỏi')) score += 2;
        else if (survey.wakeUpState.includes('Rất mệt')) score += 3;

        if (survey.impact.includes('nhẹ')) score += 1;
        else if (survey.impact.includes('rõ rệt')) score += 3;

        // Group 5 Logic
        let q1Points = (survey.sleepDuration === '6–7 giờ') ? 1 : (survey.sleepDuration === '5–6 giờ' ? 2 : (survey.sleepDuration === 'Dưới 5 giờ' ? 3 : 0));
        let q4Points = (survey.sleepQuality.includes('Thỉnh thoảng')) ? 1 : (survey.sleepQuality.includes('Hay tỉnh') ? 2 : (survey.sleepQuality.includes('Rất khó') ? 3 : 0));
        let q7Points = (survey.impact.includes('nhẹ')) ? 1 : (survey.impact.includes('rõ rệt') ? 3 : 0);

        if (q1Points >= 1 && q4Points <= 1 && q7Points <= 1) {
             return {
                groupName: 'Nhóm 5', title: 'Ngủ ít do Học tập/Công việc', description: 'Bạn ngủ ít nhưng chất lượng vẫn ổn. Đây là sự đánh đổi tạm thời.', color: 'text-blue-600 bg-blue-50 border-blue-200',
                advice: ['Tranh thủ ngủ trưa 20-30 phút', 'Ngủ bù vào cuối tuần nhưng không quá đà', 'Đừng kéo dài tình trạng này quá lâu']
            };
        }

        if (score >= 12) return {
            groupName: 'Nhóm 4', title: 'Rối loạn giấc ngủ', description: 'Chất lượng giấc ngủ rất kém, ảnh hưởng nghiêm trọng đến sức khỏe.', color: 'text-red-600 bg-red-50 border-red-200',
            advice: ['Không dùng cafein sau 2h chiều', 'Cân nhắc gặp bác sĩ nếu kéo dài', 'Thiết lập giờ ngủ cố định tuyệt đối']
        };
        if (score >= 8) return {
            groupName: 'Nhóm 3', title: 'Giấc ngủ kém', description: 'Bạn thường xuyên ngủ không sâu và mệt mỏi.', color: 'text-orange-600 bg-orange-50 border-orange-200',
            advice: ['Thư giãn 30p trước khi ngủ (đọc sách, nghe nhạc)', 'Không dùng điện thoại trước khi ngủ 1 tiếng']
        };
        if (score >= 5) return {
            groupName: 'Nhóm 2', title: 'Tương đối ổn', description: 'Đôi khi bạn ngủ muộn hoặc hơi mệt, nhưng vẫn trong tầm kiểm soát.', color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
            advice: ['Cố gắng ngủ sớm hơn 30 phút', 'Tạo không gian ngủ tối và yên tĩnh']
        };

        return {
            groupName: 'Nhóm 1', title: 'Giấc ngủ Lành mạnh', description: 'Bạn có thói quen ngủ tuyệt vời. Cơ thể bạn đang được phục hồi rất tốt.', color: 'text-green-600 bg-green-50 border-green-200',
            advice: ['Tiếp tục duy trì lịch sinh hoạt này', 'Tập thể dục đều đặn để giữ vững phong độ']
        };
    };

    const handleFinish = () => {
        const phoneResult = analyzePhoneUsage(phoneSurvey);
        const sleepResult = analyzeSleep(sleepSurvey);

        const analysis: SSRAnalysis = {
            phone: phoneResult,
            sleep: sleepResult,
            studyMethodRecommendation: {
                methodName: phoneResult.groupName === 'Nhóm 4' ? 'Dopamine Detox' : 'Pomodoro',
                description: 'Phương pháp tập trung dựa trên mức độ xao nhãng của bạn.',
                reason: 'Được đề xuất dựa trên kết quả khảo sát.'
            },
            roadmap: [
                { phase: 'Tuần 1', focus: 'Thiết lập giới hạn', duration: '7 ngày' },
                { phase: 'Tuần 2', focus: 'Xây dựng thói quen mới', duration: '7 ngày' },
                { phase: 'Tuần 3', focus: 'Tối ưu hóa hiệu suất', duration: 'Dài hạn' }
            ]
        };

        onComplete(phoneSurvey, sleepSurvey, analysis);
    };

    const isPhoneComplete = phoneSurvey.dailyHours && phoneSurvey.peakTime && phoneSurvey.purposes.length > 0 && phoneSurvey.usageDuringStudy && phoneSurvey.overuseIntention && phoneSurvey.hasLimits && phoneSurvey.impact;
    const isSleepComplete = sleepSurvey.sleepDuration && sleepSurvey.bedTime && sleepSurvey.fallAsleepTime && sleepSurvey.sleepQuality && sleepSurvey.preSleepDevice && sleepSurvey.wakeUpState && sleepSurvey.impact;

    const renderSurveyStep = () => {
        if (currentStep === 1) { // Phone Survey
            return (
                <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-10">
                    <h3 className="font-bold text-xl text-indigo-900 flex items-center gap-2 border-b border-indigo-100 pb-4 mb-6">
                        <Smartphone className="w-6 h-6"/> Thói quen sử dụng điện thoại
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">1. Bạn sử dụng điện thoại trung bình bao nhiêu giờ mỗi ngày?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['Dưới 2 giờ', '2–4 giờ', '4–6 giờ', 'Trên 6 giờ'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={phoneSurvey.dailyHours === opt} onClick={() => setPhoneSurvey({...phoneSurvey, dailyHours: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">2. Bạn thường dùng điện thoại nhiều nhất vào thời điểm nào?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['Buổi sáng', 'Buổi chiều', 'Buổi tối', 'Trước khi ngủ'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={phoneSurvey.peakTime === opt} onClick={() => setPhoneSurvey({...phoneSurvey, peakTime: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">3. Mục đích sử dụng chính? (Có thể chọn nhiều)</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Học tập / tra cứu', 'Liên lạc (nhắn tin, gọi điện)', 'Mạng xã hội', 'Giải trí (xem phim, chơi game)'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={phoneSurvey.purposes.includes(opt)} onClick={() => togglePurpose(opt)} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">4. Bạn có dùng điện thoại trong giờ học / giờ làm việc không?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['Không', 'Thỉnh thoảng', 'Thường xuyên'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={phoneSurvey.usageDuringStudy === opt} onClick={() => setPhoneSurvey({...phoneSurvey, usageDuringStudy: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">5. Khi đã cầm điện thoại, bạn có thường dùng lâu hơn dự định không?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['Không', 'Thỉnh thoảng', 'Thường xuyên'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={phoneSurvey.overuseIntention === opt} onClick={() => setPhoneSurvey({...phoneSurvey, overuseIntention: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">6. Bạn có đặt giới hạn thời gian sử dụng điện thoại mỗi ngày không?</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Có và luôn tuân thủ', 'Có nhưng ít khi tuân thủ', 'Không đặt giới hạn'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={phoneSurvey.hasLimits === opt} onClick={() => setPhoneSurvey({...phoneSurvey, hasLimits: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">7. Việc dùng điện thoại có ảnh hưởng đến học tập, giấc ngủ hoặc sức khỏe không?</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Không', 'Có nhưng không đáng kể', 'Có và ảnh hưởng rõ rệt'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={phoneSurvey.impact === opt} onClick={() => setPhoneSurvey({...phoneSurvey, impact: opt})} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (currentStep === 2) { // Sleep Survey
            return (
                 <div className="space-y-8 animate-in slide-in-from-right duration-300 pb-10">
                    <h3 className="font-bold text-xl text-indigo-900 flex items-center gap-2 border-b border-indigo-100 pb-4 mb-6">
                        <Moon className="w-6 h-6"/> Thói quen giấc ngủ
                    </h3>
                    
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">1. Thời gian ngủ trung bình mỗi đêm?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['Dưới 5 giờ', '5–6 giờ', '6–7 giờ', '7–9 giờ', 'Trên 9 giờ'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={sleepSurvey.sleepDuration === opt} onClick={() => setSleepSurvey({...sleepSurvey, sleepDuration: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">2. Bạn thường đi ngủ vào thời điểm nào?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['Trước 22h', '22h–23h', '23h–0h', 'Sau 0h'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={sleepSurvey.bedTime === opt} onClick={() => setSleepSurvey({...sleepSurvey, bedTime: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">3. Thời gian bạn mất để vào giấc ngủ?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['Dưới 15 phút', '15–30 phút', '30–60 phút', 'Trên 60 phút'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={sleepSurvey.fallAsleepTime === opt} onClick={() => setSleepSurvey({...sleepSurvey, fallAsleepTime: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">4. Chất lượng giấc ngủ của bạn?</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Ngủ sâu, ít tỉnh giấc', 'Thỉnh thoảng tỉnh giấc', 'Hay tỉnh giấc, ngủ không sâu', 'Rất khó ngủ / thường xuyên mất ngủ'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={sleepSurvey.sleepQuality === opt} onClick={() => setSleepSurvey({...sleepSurvey, sleepQuality: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">5. Bạn có sử dụng điện thoại trước khi ngủ không?</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Không', 'Có, dưới 30 phút', 'Có, 30–60 phút', 'Có, trên 60 phút'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={sleepSurvey.preSleepDevice === opt} onClick={() => setSleepSurvey({...sleepSurvey, preSleepDevice: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">6. Khi thức dậy, bạn cảm thấy thế nào?</label>
                            <div className="grid grid-cols-1 gap-3">
                                {['Tỉnh táo, tràn đầy năng lượng', 'Bình thường', 'Mệt mỏi, buồn ngủ', 'Rất mệt, khó tập trung'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={sleepSurvey.wakeUpState === opt} onClick={() => setSleepSurvey({...sleepSurvey, wakeUpState: opt})} />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-base font-bold text-gray-800">7. Giấc ngủ có ảnh hưởng đến học tập không?</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {['Không', 'Ảnh hưởng nhẹ', 'Ảnh hưởng rõ rệt'].map(opt => (
                                    <OptionItem key={opt} label={opt} selected={sleepSurvey.impact === opt} onClick={() => setSleepSurvey({...sleepSurvey, impact: opt})} />
                                ))}
                            </div>
                        </div>
                    </div>
                 </div>
            );
        }

        return (
            <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                    <BrainCircuit className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Chào mừng đến với SmartStudy</h2>
                <h3 className="text-xl text-indigo-600 font-medium">SSR - Smart Study Rhythm</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                    Chúng tôi sẽ giúp bạn cân bằng cuộc sống số và giấc ngủ để đạt hiệu suất học tập cao nhất.
                </p>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative">
             {/* Test Mode Button */}
             <button 
                onClick={handleTestMode}
                className="absolute top-4 right-4 bg-gray-200 hover:bg-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 z-50 shadow-sm"
            >
                <Terminal className="w-4 h-4" />
                Test Mode: Bỏ qua
            </button>

            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col h-[90vh]">
                <div className="bg-white border-b border-gray-100 px-8 py-4">
                    <div className="flex justify-between items-center max-w-xl mx-auto">
                        {STEPS.map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${idx <= currentStep ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    {idx + 1}
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-wider ${idx <= currentStep ? 'text-indigo-600' : 'text-gray-300'}`}>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div 
                    ref={contentRef}
                    className="p-8 flex-1 overflow-y-auto custom-scrollbar scroll-smooth"
                >
                    {renderSurveyStep()}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between gap-3">
                    {currentStep > 0 ? (
                        <button onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-3 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                             <ArrowLeft className="w-5 h-5" /> Quay lại
                        </button>
                    ) : <div></div>}
                    
                    <button
                        onClick={() => {
                            if (currentStep === 2) handleFinish();
                            else setCurrentStep(prev => prev + 1);
                        }}
                        disabled={(currentStep === 1 && !isPhoneComplete) || (currentStep === 2 && !isSleepComplete)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        {currentStep === 2 ? 'Hoàn thành' : 'Tiếp tục'}
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};