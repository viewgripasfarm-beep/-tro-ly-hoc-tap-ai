import React, { useState, useEffect } from 'react';
import type { Task, Reminder, PriorityColors, AppUser } from './types';
import { TaskStatus, Priority } from './types';
import StudyPlanner from './components/StudyPlanner';
import ProgressChart from './components/ProgressChart';
import Reminders from './components/Reminders';
import LoginScreen from './components/LoginScreen';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import * as firestoreService from './services/firestoreService';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [priorityColors, setPriorityColors] = useState<PriorityColors | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme) return storedTheme;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setIsDataLoading(true);
        try {
          const [userTasks, userReminders, userColors] = await Promise.all([
            firestoreService.getTasks(user.uid),
            firestoreService.getReminders(user.uid),
            firestoreService.getPriorityColors(user.uid)
          ]);
          setTasks(userTasks);
          setReminders(userReminders);
          setPriorityColors(userColors);
        } catch (error) {
          console.error("Lỗi khi tải dữ liệu người dùng:", error);
          setTasks([]);
          setReminders([]);
          setPriorityColors(null);
        } finally {
          setIsDataLoading(false);
        }
      } else {
        // Người dùng đã đăng xuất, xóa dữ liệu của họ
        setTasks([]);
        setReminders([]);
        setPriorityColors(null);
        setIsDataLoading(false);
      }
    };

    if (!isAuthLoading) {
      fetchUserData();
    }
  }, [user, isAuthLoading]);


  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Lỗi đăng xuất: ", error);
    }
  };

  const addTasks = async (tasksToAdd: Omit<Task, 'id'>[]) => {
    if (!user) return;
    const newTasks: Task[] = tasksToAdd.map(t => ({ ...t, id: crypto.randomUUID() }));
    setTasks(prev => [...newTasks, ...prev]);
    await firestoreService.saveTasksBatch(user.uid, newTasks);
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    if (!user) return;
    let updatedTask: Task | undefined;
    const newTasks = tasks.map(task => {
        if (task.id === id) {
            updatedTask = { ...task, status };
            return updatedTask;
        }
        return task;
    });
    setTasks(newTasks);
    if (updatedTask) await firestoreService.saveTask(user.uid, updatedTask);
  };
  
  const updateTaskPriority = async (id: string, priority: Priority) => {
    if (!user) return;
    let updatedTask: Task | undefined;
     const newTasks = tasks.map(task => {
        if (task.id === id) {
            updatedTask = { ...task, priority };
            return updatedTask;
        }
        return task;
    });
    setTasks(newTasks);
    if (updatedTask) await firestoreService.saveTask(user.uid, updatedTask);
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    setTasks(tasks.filter(task => task.id !== id));
    await firestoreService.deleteTaskFromDB(user.uid, id);
  };
  
  const addReminder = async (text: string, remindAt: string) => {
    if (!user) return;
    const newReminder: Reminder = { id: crypto.randomUUID(), text, remindAt };
    setReminders(prev => [...prev, newReminder].sort((a, b) => new Date(a.remindAt).getTime() - new Date(b.remindAt).getTime()));
    await firestoreService.saveReminder(user.uid, newReminder);
  };
  
  const deleteReminder = async (id: string) => {
    if (!user) return;
    setReminders(reminders.filter(reminder => reminder.id !== id));
    await firestoreService.deleteReminderFromDB(user.uid, id);
  };
  
  const handleSetPriorityColors = async (newColors: PriorityColors) => {
      if (!user) return;
      setPriorityColors(newColors);
      await firestoreService.savePriorityColors(user.uid, newColors);
  };
  
  const showSpinner = isAuthLoading || (user && isDataLoading);

  if (showSpinner) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-950">
        <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-gray-800 dark:text-slate-200 transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-sm transition-colors duration-300 sticky top-0 z-20 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <i className="fas fa-graduation-cap text-2xl text-white"></i>
            </div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-slate-200 hidden sm:block">Trợ lý Học tập</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <span className="font-semibold text-sm text-gray-700 dark:text-slate-300">{user.displayName}</span>
                <p className="text-xs text-slate-500">{user.email}</p>
             </div>
             {user.photoURL && <img src={user.photoURL} alt="User Avatar" className="w-10 h-10 rounded-full" />}
             <button 
                onClick={toggleTheme} 
                className="p-2 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none"
                aria-label="Chuyển đổi chế độ sáng/tối"
             >
                {theme === 'light' ? <i className="fas fa-moon text-lg"></i> : <i className="fas fa-sun text-lg"></i>}
             </button>
             <button 
                onClick={handleSignOut} 
                className="p-2 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none"
                aria-label="Đăng xuất"
             >
                <i className="fas fa-sign-out-alt text-lg"></i>
             </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StudyPlanner 
              tasks={tasks} 
              addTasks={addTasks}
              updateTaskStatus={updateTaskStatus}
              updateTaskPriority={updateTaskPriority} 
              deleteTask={deleteTask}
              priorityColors={priorityColors!}
              setPriorityColors={handleSetPriorityColors}
            />
          </div>
          
          <div className="space-y-8">
            <ProgressChart tasks={tasks} />
            <Reminders 
              reminders={reminders}
              addReminder={addReminder}
              deleteReminder={deleteReminder}
            />
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
        <p>Cung cấp bởi Gemini API & React</p>
      </footer>
    </div>
  );
};

export default App;