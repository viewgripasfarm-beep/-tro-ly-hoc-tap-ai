import React, { useState } from 'react';
import type { Reminder } from '../types';
import { BellIcon, ClockIcon } from './icons';

interface RemindersProps {
  reminders: Reminder[];
  addReminder: (text: string, remindAt: string) => void;
  deleteReminder: (id: string) => void;
}

const Reminders: React.FC<RemindersProps> = ({ reminders, addReminder, deleteReminder }) => {
  const [text, setText] = useState('');
  const [remindAt, setRemindAt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && remindAt) {
      addReminder(text, remindAt);
      setText('');
      setRemindAt('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 h-full transition-colors duration-300 flex flex-col">
      <div className="flex items-center mb-4">
        <BellIcon className="w-6 h-6 text-blue-500 mr-3" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Nhắc nhở</h2>
      </div>
      <form onSubmit={handleSubmit} className="mb-4 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nội dung nhắc nhở..."
          className="w-full p-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white dark:bg-slate-700 dark:text-white dark:placeholder-gray-400"
        />
        <input
          type="datetime-local"
          value={remindAt}
          onChange={(e) => setRemindAt(e.target.value)}
          className="w-full sm:w-auto p-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white dark:bg-slate-700 dark:text-white [color-scheme:dark]"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold">
          Thêm
        </button>
      </form>
      <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-3">
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <div key={reminder.id} className="flex justify-between items-center bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg border-l-4 border-blue-500">
              <div className="flex-1">
                <p className="text-gray-800 dark:text-slate-200 font-medium">{reminder.text}</p>
                <div className="flex items-center text-xs text-blue-600 dark:text-blue-400 mt-1">
                   <ClockIcon className="w-3.5 h-3.5 mr-1.5" />
                   <span>{new Date(reminder.remindAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              <button onClick={() => deleteReminder(reminder.id)} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition ml-2">
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BellIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">Không có nhắc nhở nào</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500">Thêm một vài nhắc nhở để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reminders;