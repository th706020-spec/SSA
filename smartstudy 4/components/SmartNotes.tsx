import React, { useState, useEffect } from 'react';
import { Note, User } from '../types';
import { Plus, Search, Trash2, CheckSquare, Type, LayoutGrid, X, PenLine } from 'lucide-react';
import { db } from '../firebaseConfig';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';

// Bộ soạn thảo chuyên nghiệp
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import 'katex/dist/katex.min.css';
// @ts-ignore
import katex from 'katex';

// Cấu hình để gõ được Công thức toán
(window as any).katex = katex;

interface SmartNotesProps {
    currentUser: User;
}

export const SmartNotes: React.FC<SmartNotesProps> = ({ currentUser }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAutoSaving, setIsAutoSaving] = useState(false);

    // THANH CÔNG CỤ GIỐNG WORD: In đậm, Nghiêng, Gạch chân, Màu chữ, Highlight, LaTeX
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],        // In đậm, nghiêng, gạch chân
            [{ 'color': [] }, { 'background': [] }],          // Đổi màu chữ & Highlight
            [{ 'script': 'sub'}, { 'script': 'super' }],      // Chỉ số trên/dưới
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],     // Danh sách số/chấm
            ['formula', 'link', 'image', 'clean'],            // LaTeX, Link, Ảnh, Xóa định dạng
        ],
    };

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

    useEffect(() => {
        if (!selectedNote || !selectedNote.id) return;
        setIsAutoSaving(true);
        const timer = setTimeout(async () => {
            try {
                const noteRef = doc(db, 'notes', selectedNote.id);
                const { id, ...dataToSave } = selectedNote; 
                await updateDoc(noteRef, { ...dataToSave, updatedAt: new Date().toISOString() });
                setNotes(prev => prev.map(n => n.id === selectedNote.id ? selectedNote : n));
                setIsAutoSaving(false);
            } catch (error) { setIsAutoSaving(false); }
        }, 1000);
        return () => clearTimeout(timer);
    }, [selectedNote]);

    const handleCreateNote = async (type: 'text' | 'checklist') => {
        const now = new Date().toISOString();
        const newNoteData = {
            title: '', content: '', type: type,
            items: type === 'checklist' ? [] : null,
            createdAt: now, updatedAt: now, // FIX LỖIcreatedAt Ở ĐÂY
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

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa ghi chú này?")) return;
        try {
            await deleteDoc(doc(db, 'notes', id));
            setNotes(prev => prev.filter(n => n.id !== id));
            if (selectedNote?.id === id) setSelectedNote(null);
        } catch (error) { console.error("Lỗi xóa:", error); }
    };

    const filteredNotes = notes.filter(n => (n.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (n.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6 animate-in fade-in duration-300">
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-[#1e1e2d] p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input type="text" placeholder="Tìm kiếm..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-200" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleCreateNote('text')} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 shadow-md"><Type className="w-4 h-4" /> Văn bản</button>
                    <button onClick={() => handleCreateNote('checklist')} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 shadow-md"><CheckSquare className="w-4 h-4" /> Checklist</button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                    {filteredNotes.map(note => (
                        <div key={note.id} onClick={() => setSelectedNote(note)} className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedNote?.id === note.id ? 'bg-indigo-50 border-indigo-500 dark:bg-indigo-900/20' : 'bg-white border-gray-200 dark:bg-[#1e1e2d] dark:border-gray-700'}`}>
                            <h4 className="font-bold text-gray-900 dark:text-white truncate">{note.title || 'Chưa có tiêu đề'}</h4>
                            <p className="text-xs text-gray-500 mt-1">{new Date(note.updatedAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white dark:bg-[#1e1e2d] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                {selectedNote ? (
                    <>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <input type="text" value={selectedNote.title} onChange={(e) => setSelectedNote({...selectedNote, title: e.target.value})} placeholder="Tiêu đề ghi chú..." className="text-xl font-bold bg-transparent outline-none text-gray-900 dark:text-white w-full" />
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400">{isAutoSaving ? 'Đang lưu...' : 'Đã lưu'}</span>
                                <button onClick={() => handleDelete(selectedNote.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-white dark:bg-[#1e1e2d]">
                            <ReactQuill 
                                theme="snow"
                                value={selectedNote.content}
                                onChange={(content) => setSelectedNote({...selectedNote, content})}
                                modules={quillModules}
                                className="h-full border-none"
                                placeholder="Viết ghi chú chi tiết tại đây..."
                            />
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