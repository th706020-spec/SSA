import React, { useState, useEffect } from 'react';
import { Note, User } from '../types';
import { Plus, Search, Trash2, CheckSquare, Type, LayoutGrid, X, PenLine } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

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

    // 1. Tải danh sách ghi chú từ Firebase
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const q = query(
                    collection(db, 'notes'), 
                    where("authorId", "==", currentUser.username),
                    orderBy('updatedAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const fetchedNotes: Note[] = [];
                querySnapshot.forEach((doc) => {
                    fetchedNotes.push({ id: doc.id, ...doc.data() } as Note);
                });
                setNotes(fetchedNotes);
            } catch (error) {
                console.error("Lỗi tải ghi chú:", error);
            }
        };
        fetchNotes();
    }, [currentUser.username]);

    // 2. Tự động đồng bộ lên Firebase (An toàn, không lỗi ngầm)
    useEffect(() => {
        if (!selectedNote || !selectedNote.id) return;

        const timer = setTimeout(async () => {
            setIsAutoSaving(true);
            try {
                const noteRef = doc(db, 'notes', selectedNote.id);
                const { id, ...dataToSave } = selectedNote; 
                
                // Lọc bỏ undefined để Firebase chấp nhận dữ liệu
                const cleanData = Object.fromEntries(
                    Object.entries(dataToSave).filter(([_, value]) => value !== undefined)
                );

                const finalDataToUpdate = {
                    ...cleanData,
                    updatedAt: new Date().toISOString()
                };

                await updateDoc(noteRef, finalDataToUpdate);
                setNotes(prev => prev.map(n => n.id === selectedNote.id ? { ...n, ...finalDataToUpdate } : n));
                setIsAutoSaving(false);
            } catch (error) {
                console.error("Lỗi đồng bộ dữ liệu:", error);
                setIsAutoSaving(false);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [selectedNote]);

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
        } catch (error) {
            console.error("Lỗi tạo ghi chú mới:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) return;
        try {
            await deleteDoc(doc(db, 'notes', id));
            setNotes(prev => prev.filter(n => n.id !== id));
            if (selectedNote?.id === id) setSelectedNote(null);
        } catch (error) {
            console.error("Lỗi xóa ghi chú:", error);
        }
    };

    // 4. Các hàm xử lý Checklist
    const handleChecklistItem = (index: number, val: string) => {
        if (!selectedNote || !selectedNote.items) return;
        const newItems = [...selectedNote.items];
        newItems[index].text = val;
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

    const filteredNotes = notes.filter(n => 
        (n.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
        (n.content?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-300">
            {/* Cột Danh Sách Bên Trái */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-[#1e1e2d] p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200"
                    />
                </div>

                <div className="flex gap-2">
                    <button onClick={() => handleCreateNote('text')} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md">
                        <Type className="w-4 h-4" /> Văn bản
                    </button>
                    <button onClick={() => handleCreateNote('checklist')} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md">
                        <CheckSquare className="w-4 h-4" /> Checklist
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {notes.length === 0 ? (
                        <div className="text-center py-10 opacity-60">
                            <PenLine className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500">{QUOTES[Math.floor(Math.random() * QUOTES.length)]}</p>
                        </div>
                    ) : filteredNotes.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => setSelectedNote(note)}
                            className={`p-4 rounded-xl cursor-pointer transition-all border ${
                                selectedNote?.id === note.id 
                                ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20 dark:border-indigo-500' 
                                : 'bg-white border-gray-200 dark:bg-[#1e1e2d] dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500'
                            }`}
                        >
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                {note.title || 'Chưa có tiêu đề'}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
                                <span>{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</span>
                                {note.type === 'checklist' && <CheckSquare className="w-3 h-3" />}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cột Soạn Thảo Bên Phải */}
            <div className="flex-1 bg-white dark:bg-[#1e1e2d] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden relative">
                {selectedNote ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <input 
                                type="text" 
                                value={selectedNote.title || ''}
                                onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value, updatedAt: new Date().toISOString()})}
                                placeholder="Tiêu đề ghi chú..."
                                className="text-xl font-bold bg-transparent outline-none text-gray-900 dark:text-white w-full"
                            />
                            <div className="flex items-center gap-4 whitespace-nowrap">
                                <span className={`text-xs ${isAutoSaving ? 'text-amber-500 animate-pulse' : 'text-emerald-500'} font-medium`}>
                                    {isAutoSaving ? 'Đang lưu...' : 'Đã lưu'}
                                </span>
                                <button onClick={() => handleDelete(selectedNote.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {selectedNote.type === 'checklist' ? (
                                <div className="space-y-3">
                                    {selectedNote.items?.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3 group">
                                            <button 
                                                onClick={() => toggleChecklistItem(idx)}
                                                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${item.done ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 hover:border-indigo-500'}`}
                                            >
                                                {item.done && <X className="w-3.5 h-3.5 text-white" />}
                                            </button>
                                            <input 
                                                type="text" 
                                                value={item.text}
                                                onChange={(e) => handleChecklistItem(idx, e.target.value)}
                                                placeholder="Việc cần làm..."
                                                className={`flex-1 bg-transparent outline-none transition-all ${item.done ? 'text-gray-400 line-through' : 'text-gray-800 dark:text-gray-200'}`}
                                            />
                                            <button 
                                                onClick={() => {
                                                    const newItems = selectedNote.items?.filter((_, i) => i !== idx);
                                                    setSelectedNote({...selectedNote, items: newItems, updatedAt: new Date().toISOString()});
                                                }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={addChecklistItem} 
                                        className="flex items-center gap-2 text-indigo-600 text-sm font-bold mt-4 hover:text-indigo-700"
                                    >
                                        <Plus className="w-4 h-4" /> Thêm mục
                                    </button>
                                </div>
                            ) : (
                                <textarea 
                                    value={selectedNote.content || ''}
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
                    </div>
                )}
            </div>
        </div>
    );
};