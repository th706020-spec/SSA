import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../types';
import { Plus, Search, Trash2, Type, LayoutGrid, X, CheckSquare, PenLine } from 'lucide-react';

interface SmartNotesProps {
    notes: Note[];
    setNotes: (notes: Note[]) => void;
}

const QUOTES = [
    "Viết xuống suy nghĩ là bước đầu tiên để hiện thực hóa chúng.",
    "Trí nhớ tốt không bằng một nét mực mờ.",
    "Ghi chú hôm nay, kiến thức ngày mai.",
    "Sắp xếp suy nghĩ, sắp xếp cuộc đời."
];

export const SmartNotes: React.FC<SmartNotesProps> = ({ notes, setNotes }) => {
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    
    // Dùng ref để giữ timer, tránh việc render lại làm mất timer cũ
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

    // LOGIC AUTO-SAVE (CỐT LÕI ĐỂ LƯU FIREBASE)
    useEffect(() => {
        // Chỉ chạy khi có note đang chọn
        if (!selectedNote) return;

        // Bật trạng thái "Đang lưu..."
        setIsAutoSaving(true);

        // Xóa timer cũ nếu người dùng gõ tiếp
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Tạo timer mới
        autoSaveTimerRef.current = setTimeout(() => {
            // Logic tìm và thay thế note cũ bằng note mới
            const updatedNotes = notes.map(n => n.id === selectedNote.id ? selectedNote : n);
            
            // GỌI HÀM CỦA APP.TSX -> KÍCH HOẠT LƯU FIREBASE
            setNotes(updatedNotes);
            
            setIsAutoSaving(false);
        }, 1000); // Lưu sau 1 giây ngừng gõ

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNote]); // Chạy lại mỗi khi nội dung selectedNote thay đổi

    const handleCreateNote = (type: 'text' | 'checklist') => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: '',
            content: '',
            type: type, // Bạn nhớ update file types.ts thêm trường này nhé, nếu chưa có thì nó mặc định là optional
            items: type === 'checklist' ? [] : undefined,
            tags: [], // Thêm mảng tags rỗng để tránh lỗi type
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Lưu ngay lập tức note rỗng vào danh sách
        const newNotesList = [newNote, ...notes];
        setNotes(newNotesList); 
        setSelectedNote(newNote); // Chọn note mới tạo
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn việc click xóa mà lại mở note ra
        if (window.confirm("Bạn chắc chắn muốn xóa chứ?")) {
            const filtered = notes.filter(n => n.id !== id);
            setNotes(filtered); // Lưu danh sách mới (đã xóa) lên Firebase
            if (selectedNote?.id === id) setSelectedNote(null);
        }
    };

    // --- CÁC HÀM XỬ LÝ CHECKLIST ---
    const handleChecklistItem = (index: number, val: string) => {
        if (!selectedNote || !selectedNote.items) return;
        const newItems = [...selectedNote.items];
        newItems[index].text = val;
        // Cập nhật state cục bộ -> Kích hoạt useEffect auto-save ở trên
        setSelectedNote({ ...selectedNote, items: newItems, updatedAt: new Date().toISOString() });
    };

    const toggleChecklistItem = (index: number) => {
        if (!selectedNote || !selectedNote.items) return;
        const newItems = [...selectedNote.items];
        newItems[index].done = !newItems[index].done;
        setSelectedNote({ ...selectedNote, items: newItems, updatedAt: new Date().toISOString() });
    };

    const addChecklistItem = () => {
        if (!selectedNote) return;
        const newItems = selectedNote.items ? [...selectedNote.items, { text: '', done: false }] : [{ text: '', done: false }];
        setSelectedNote({ ...selectedNote, items: newItems, updatedAt: new Date().toISOString() });
    };

    const removeChecklistItem = (index: number) => {
        if (!selectedNote || !selectedNote.items) return;
        const newItems = selectedNote.items.filter((_, i) => i !== index);
        setSelectedNote({ ...selectedNote, items: newItems, updatedAt: new Date().toISOString() });
    };

    // --- LỌC TÌM KIẾM ---
    const filteredNotes = notes.filter(n => 
        (n.title && n.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (n.content && n.content.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-300">
            {/* Cột Trái: Danh sách */}
            <div className="w-full md:w-80 flex flex-col gap-4 h-full">
                <div className="flex items-center gap-2 bg-white dark:bg-[#1e1e2d] p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                </div>

                <div className="flex gap-2">
                    <button 
                        onClick={() => handleCreateNote('text')}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                        <Type className="w-4 h-4" /> Văn bản
                    </button>
                    <button 
                        onClick={() => handleCreateNote('checklist')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                        <CheckSquare className="w-4 h-4" /> Checklist
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1 pb-4">
                    {notes.length === 0 ? (
                        <div className="text-center py-10 opacity-60">
                            <PenLine className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500">{QUOTES[Math.floor(Math.random() * QUOTES.length)]}</p>
                        </div>
                    ) : filteredNotes.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border group relative ${
                                selectedNote?.id === note.id 
                                ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500' 
                                : 'bg-white border-gray-200 dark:bg-[#1e1e2d] dark:border-gray-700 hover:border-indigo-300'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate flex-1 pr-6">
                                    {note.title || 'Chưa có tiêu đề'}
                                </h4>
                                <button 
                                    onClick={(e) => handleDelete(note.id, e)}
                                    className="absolute right-2 top-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between items-center">
                                <span>{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString('vi-VN') : 'Vừa xong'}</span>
                                {note.type === 'checklist' && <CheckSquare className="w-3 h-3 text-emerald-500" />}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cột Phải: Trình soạn thảo */}
            <div className="flex-1 bg-white dark:bg-[#1e1e2d] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden relative h-full">
                {selectedNote ? (
                    <>
                        {/* Header của Note */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-[#252536]">
                            <input 
                                type="text" 
                                value={selectedNote.title}
                                onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value, updatedAt: new Date().toISOString()})}
                                placeholder="Tiêu đề ghi chú..."
                                className="text-xl font-bold bg-transparent outline-none text-gray-900 dark:text-white w-full"
                            />
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className={`text-xs transition-colors ${isAutoSaving ? 'text-amber-500 font-medium' : 'text-green-500'}`}>
                                    {isAutoSaving ? 'Đang lưu...' : 'Đã lưu'}
                                </span>
                            </div>
                        </div>

                        {/* Nội dung Note */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {selectedNote.type === 'checklist' ? (
                                <div className="space-y-3">
                                    {selectedNote.items?.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 group animate-in slide-in-from-left-2 duration-200">
                                            <button 
                                                onClick={() => toggleChecklistItem(idx)}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.done ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 hover:border-indigo-500'}`}
                                            >
                                                {item.done && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                            <input 
                                                type="text" 
                                                value={item.text}
                                                onChange={(e) => handleChecklistItem(idx, e.target.value)}
                                                placeholder="Việc cần làm..."
                                                className={`flex-1 bg-transparent outline-none transition-all ${item.done ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}
                                            />
                                            <button 
                                                onClick={() => removeChecklistItem(idx)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={addChecklistItem}
                                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mt-4 px-2 py-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm mục mới
                                    </button>
                                </div>
                            ) : (
                                <textarea 
                                    value={selectedNote.content}
                                    onChange={(e) => setSelectedNote({...selectedNote, content: e.target.value, updatedAt: new Date().toISOString()})}
                                    placeholder="Viết xuống suy nghĩ của bạn..."
                                    className="w-full h-full bg-transparent outline-none text-gray-800 dark:text-gray-200 resize-none leading-relaxed text-lg"
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <LayoutGrid className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Chọn một ghi chú để xem</p>
                        <p className="text-sm">Hoặc tạo mới để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};