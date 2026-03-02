import React, { useState, useEffect } from 'react';
import { Note, User } from '../types';
import { Plus, Search, Trash2, CheckSquare, Type, LayoutGrid, X, PenLine } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
import '../quill-custom.css';
// @ts-ignore
import katex from 'katex';

(window as any).katex = katex;

interface SmartNotesProps {
    currentUser: User;
}

const QUOTES = [
    "Viết xuống suy nghĩ là bước đầu tiên để hiện thực hóa chúng.",
    "Trí nhớ tốt không bằng một nét mực mờ.",
    "Ghi chú hôm nay, kiến thức ngày mai.",
    "Sắp xếp suy nghĩ, sắp xếp cuộc đời."
];

export const SmartNotes: React.FC<SmartNotesProps> = ({ currentUser }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }], 
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['formula', 'link', 'image', 'clean'], 
        ],
    };

    // 1. Tải danh sách ghi chú
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const q = query(collection(db, 'notes'), where("authorId", "==", currentUser.username), orderBy('updatedAt', 'desc'));
                const querySnapshot = await getDocs(q);
                const fetchedNotes: Note[] = [];
                querySnapshot.forEach((doc) => { fetchedNotes.push({ id: doc.id, ...doc.data() } as Note); });
                setNotes(fetchedNotes);
            } catch (error) { console.error("Lỗi tải ghi chú:", error); }
        };
        fetchNotes();
    }, [currentUser.username]);

    // 2. Logic Tự động lưu (Auto-save) - ĐÃ ĐƯỢC CẤU TRÚC LẠI HOÀN TOÀN
    useEffect(() => {
        if (!selectedNote || !selectedNote.id) return;

        const timer = setTimeout(async () => {
            setIsAutoSaving(true);
            try {
                const noteRef = doc(db, 'notes', selectedNote.id);
                const { id, ...dataToSave } = selectedNote; 
                
                // BƯỚC LỌC DỮ LIỆU: Loại bỏ tuyệt đối các giá trị undefined để Firebase không báo lỗi ngầm
                const cleanData = Object.fromEntries(
                    Object.entries(dataToSave).filter(([_, value]) => value !== undefined)
                );

                const finalDataToUpdate = {
                    ...cleanData,
                    updatedAt: new Date().toISOString()
                };

                // Đẩy lên mây
                await updateDoc(noteRef, finalDataToUpdate);
                
                // Đồng bộ lại state hiển thị bên danh sách
                setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, ...finalDataToUpdate } : n));
                setIsAutoSaving(false);
                
            } catch (error) {
                console.error("Chi tiết lỗi Firebase khi lưu:", error);
                setIsAutoSaving(false);
            }
        }, 1200); // Tăng độ trễ lên 1.2s để đảm bảo bạn đã gõ xong cụm từ

        return () => clearTimeout(timer);
    }, [selectedNote]); // Chỉ theo dõi sự thay đổi của toàn bộ object

    // 3. Tạo ghi chú mới
    const handleCreateNote = async (type: 'text' | 'checklist') => {
        const now = new Date().toISOString();
        const newNoteData = {
            title: '',
            content: '',
            type: type,
            items: type === 'checklist' ? [] : null,
            createdAt: now, 
            updatedAt: now,
            color: 'bg-white dark:bg-[#27273a]',
            authorId: currentUser.username
        };

        try {
            const docRef = await addDoc(collection(db, 'notes'), newNoteData);
            const newNote: Note = { id: docRef.id, ...newNoteData } as Note;
            setNotes(prev => [newNote, ...prev]);
            setSelectedNote(newNote);
        } catch (error) { console.error("Lỗi tạo ghi chú:", error); }
    };

    // 4. Xóa ghi chú
    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) return;
        try {
            await deleteDoc(doc(db, 'notes', id));
            setNotes(prev => prev.filter(n => n.id !== id));
            if (selectedNote?.id === id) setSelectedNote(null);
        } catch (error) { console.error("Lỗi xóa ghi chú:", error); }
    };

    // 5. Quản lý Checklist
    const handleChecklistItem = (index: number, val: string) => {
        if (!selectedNote || !selectedNote.items) return;
        const newItems = [...selectedNote.items];
        newItems[index].text = val;
        setSelectedNote(prev => prev ? { ...prev, items: newItems } : null);
    };

    const toggleChecklistItem = (index: number) => {
        if (!selectedNote || !selectedNote.items) return;
        const newItems = [...selectedNote.items];
        newItems[index].done = !newItems[index].done;
        setSelectedNote(prev => prev ? { ...prev, items: newItems } : null);
    };

    const addChecklistItem = () => {
        if (!selectedNote) return;
        const newItems = selectedNote.items ? [...selectedNote.items, { text: '', done: false }] : [{ text: '', done: false }];
        setSelectedNote(prev => prev ? { ...prev, items: newItems } : null);
    };

    const filteredNotes = notes.filter(n => (n.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (n.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-300">
            {/* Cột danh sách (Bên trái) */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-[#1e1e2d] p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleCreateNote('text')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 shadow-md"><Type className="w-4 h-4" /> Văn bản</button>
                    <button onClick={() => handleCreateNote('checklist')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 shadow-md"><CheckSquare className="w-4 h-4" /> Checklist</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {notes.length === 0 ? (
                        <div className="text-center py-10 opacity-60">
                            <PenLine className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500">{QUOTES[Math.floor(Math.random() * QUOTES.length)]}</p>
                        </div>
                    ) : filteredNotes.map(note => (
                        <div key={note.id} onClick={() => setSelectedNote(note)} className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedNote?.id === note.id ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20' : 'bg-white border-gray-200 dark:bg-[#1e1e2d] dark:border-gray-700'}`}>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{note.title || 'Chưa có tiêu đề'}</h4>
                            <p className="text-xs text-gray-500 mt-1 flex justify-between">
                                <span>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
                                {note.type === 'checklist' && <CheckSquare className="w-3 h-3" />}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trình soạn thảo (Bên phải) */}
            <div className="flex-1 bg-white dark:bg-[#1e1e2d] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                {selectedNote ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <input 
                                type="text" 
                                value={selectedNote.title || ''} 
                                onChange={(e) => setSelectedNote(prev => prev ? {...prev, title: e.target.value} : null)} 
                                placeholder="Tiêu đề ghi chú..." 
                                className="text-xl font-bold bg-transparent outline-none text-gray-900 dark:text-white w-full" 
                            />
                            <div className="flex items-center gap-4 whitespace-nowrap">
                                <span className={`text-xs font-medium ${isAutoSaving ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                                    {isAutoSaving ? 'Đang lưu...' : 'Đã lưu'}
                                </span>
                                <button onClick={() => handleDelete(selectedNote.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-[#1e1e2d]">
                            {selectedNote.type === 'checklist' ? (
                                <div className="space-y-3">
                                    {selectedNote.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group">
                                            <button onClick={() => toggleChecklistItem(idx)} className={`w-5 h-5 rounded border flex items-center justify-center ${item.done ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400'}`}>
                                                {item.done && <X className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                            <input type="text" value={item.text || ''} onChange={(e) => handleChecklistItem(idx, e.target.value)} className={`flex-1 bg-transparent outline-none ${item.done ? 'text-gray-400 line-through' : 'dark:text-white'}`} />
                                        </div>
                                    ))}
                                    <button onClick={addChecklistItem} className="flex items-center gap-2 text-indigo-600 text-sm font-bold mt-4">
                                        <Plus className="w-4 h-4" /> Thêm mục mới
                                    </button>
                                </div>
                            ) : (
                                <ReactQuill 
                                    theme="snow"
                                    value={selectedNote.content || ''}
                                    // SỬ DỤNG LỐI VIẾT CALLBACK ĐỂ LUÔN LẤY ĐƯỢC STATE MỚI NHẤT
                                    onChange={(newContent) => setSelectedNote(prev => prev ? { ...prev, content: newContent } : null)}
                                    modules={quillModules}
                                    className="h-full border-none"
                                    placeholder="Viết ghi chú chi tiết tại đây (Hỗ trợ định dạng và Toán học LaTeX)..."
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                        <LayoutGrid className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg font-medium">Chọn một ghi chú để bắt đầu</p>
                    </div>
                )}
            </div>
        </div>
    );
};