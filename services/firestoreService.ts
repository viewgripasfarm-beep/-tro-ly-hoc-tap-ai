import { db } from '../firebaseConfig';
import { collection, doc, getDocs, setDoc, writeBatch, deleteDoc, getDoc } from 'firebase/firestore';
import type { Task, Reminder, PriorityColors } from '../types';
import { Priority } from '../types';

const defaultPriorityColors: PriorityColors = {
  [Priority.High]: { background: '#fef2f2', border: '#fecaca', badge: '#ef4444', badgeText: '#ffffff' },
  [Priority.Medium]: { background: '#fefce8', border: '#fef08a', badge: '#eab308', badgeText: '#1e293b' },
  [Priority.Low]: { background: '#f0fdf4', border: '#bbf7d0', badge: '#22c55e', badgeText: '#ffffff' },
};

// --- Công việc ---
export const getTasks = async (userId: string): Promise<Task[]> => {
  const tasksCol = collection(db, 'users', userId, 'tasks');
  const snapshot = await getDocs(tasksCol);
  return snapshot.docs.map(doc => doc.data() as Task);
};

export const saveTask = async (userId: string, task: Task): Promise<void> => {
  const taskRef = doc(db, 'users', userId, 'tasks', task.id);
  await setDoc(taskRef, task, { merge: true });
};

export const deleteTaskFromDB = async (userId: string, taskId: string): Promise<void> => {
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
};

export const saveTasksBatch = async (userId: string, tasks: Task[]): Promise<void> => {
    const batch = writeBatch(db);
    tasks.forEach(task => {
        const taskRef = doc(db, 'users', userId, 'tasks', task.id);
        batch.set(taskRef, task);
    });
    await batch.commit();
};

// --- Nhắc nhở ---
export const getReminders = async (userId: string): Promise<Reminder[]> => {
  const remindersCol = collection(db, 'users', userId, 'reminders');
  const snapshot = await getDocs(remindersCol);
  return snapshot.docs.map(doc => doc.data() as Reminder);
};

export const saveReminder = async (userId: string, reminder: Reminder): Promise<void> => {
    const reminderRef = doc(db, 'users', userId, 'reminders', reminder.id);
    await setDoc(reminderRef, reminder);
};

export const deleteReminderFromDB = async (userId: string, reminderId: string): Promise<void> => {
    const reminderRef = doc(db, 'users', userId, 'reminders', reminderId);
    await deleteDoc(reminderRef);
};

// --- Cài đặt ---
export const getPriorityColors = async (userId: string): Promise<PriorityColors> => {
    const settingsRef = doc(db, 'users', userId, 'settings', 'priorityColors');
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
        // Hợp nhất với màu mặc định để đảm bảo tất cả các khóa đều tồn tại
        return { ...defaultPriorityColors, ...docSnap.data() };
    }
    // Nếu không tồn tại, tạo mới và trả về màu mặc định
    await setDoc(settingsRef, defaultPriorityColors);
    return defaultPriorityColors;
};

export const savePriorityColors = async (userId: string, colors: PriorityColors): Promise<void> => {
    const settingsRef = doc(db, 'users', userId, 'settings', 'priorityColors');
    await setDoc(settingsRef, colors);
};
