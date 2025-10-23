import React, { useState, useMemo } from 'react';
import type { Task, PriorityColors } from '../types';
import { TaskStatus, Priority } from '../types';
import { BookOpenIcon, PaletteIcon } from './icons';
import { generateStudyPlan } from '../services/geminiService';

interface StudyPlannerProps {
  tasks: Task[];
  addTasks: (tasks: Omit<Task, 'id'>[]) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskPriority: (id: string, priority: Priority) => void;
  deleteTask: (id: string) => void;
  priorityColors: PriorityColors;
  setPriorityColors: (colors: PriorityColors) => void;
}

const statusOptions = [
  { value: TaskStatus.ToDo, label: 'Cần làm' },
  { value: TaskStatus.InProgress, label: 'Đang làm' },
  { value: TaskStatus.Done, label: 'Hoàn thành' },
];

const priorityOptions = [
  { value: Priority.High, label: 'Cao' },
  { value: Priority.Medium, label: 'Trung bình' },
  { value: Priority.Low, label: 'Thấp' },
];

const TaskItem: React.FC<{ 
    task: Task; 
    colors: PriorityColors[Priority];
    onStatusChange: (status: TaskStatus) => void; 
    onPriorityChange: (priority: Priority) => void;
    onDelete: () => void 
}> = ({ task, colors, onStatusChange, onPriorityChange, onDelete }) => {
    const priorityConfig = priorityOptions.find(p => p.value === task.priority) || priorityOptions[1];
    
    return (
        <div 
          style={{ 
            backgroundColor: colors.background, 
            borderColor: colors.border 
          }}
          className={`p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-300 border-l-4 ${task.status === TaskStatus.Done ? 'opacity-60' : 'hover:shadow-md hover:-translate-y-1'}`}
        >
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <span 
                      style={{ backgroundColor: colors.badge, color: colors.badgeText }}
                      className={`px-3 py-1 text-xs font-bold rounded-full`}
                    >
                      {priorityConfig.label}
                    </span>
                    <p className={`text-xs font-medium ${task.status === TaskStatus.Done ? 'text-gray-500 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}>Hạn chót: {new Date(task.dueDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <h3 className={`font-bold text-lg text-gray-800 dark:text-slate-200 ${task.status === TaskStatus.Done ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>{task.title}</h3>
                <p className={`text-sm text-gray-600 dark:text-slate-400 ${task.status === TaskStatus.Done ? 'line-through' : ''}`}>{task.description}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto self-end sm:self-center">
                 <select
                    value={task.priority}
                    onChange={(e) => onPriorityChange(e.target.value as Priority)}
                    className="text-sm font-semibold p-2 border-none rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer w-full sm:w-auto bg-black/5 dark:bg-white/10 dark:text-slate-200"
                    aria-label="Đổi mức độ ưu tiên"
                >
                    {priorityOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select
                    value={task.status}
                    onChange={(e) => onStatusChange(e.target.value as TaskStatus)}
                    className="text-sm font-semibold p-2 border-none rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer w-full sm:w-auto bg-black/5 dark:bg-white/10 dark:text-slate-200"
                    aria-label="Đổi trạng thái"
                >
                    {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <button onClick={onDelete} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition p-2 rounded-full h-9 w-9 flex items-center justify-center hover:bg-red-500/10">
                    <i className="fas fa-trash"></i>
                </button>
            </div>
        </div>
    );
};

const ColorCustomizer: React.FC<{
  colors: PriorityColors;
  setColors: (colors: PriorityColors) => void;
  onClose: () => void;
}> = ({ colors, setColors, onClose }) => {
    const handleColorChange = (priority: Priority, type: keyof PriorityColors[Priority], value: string) => {
        setColors({
            ...colors,
            [priority]: {
                ...colors[priority],
                [type]: value,
            }
        });
    };

    return (
        <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 border dark:border-slate-600 mb-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700 dark:text-slate-300">Tùy chỉnh màu sắc ưu tiên</h4>
                <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {priorityOptions.map(({ value, label }) => (
                    <div key={value}>
                        <h5 className="font-bold mb-2 text-gray-800 dark:text-slate-200">{label}</h5>
                        <div className="flex flex-col gap-2">
                           {Object.entries({background: 'Nền', border: 'Viền', badge: 'Huy hiệu', badgeText: 'Chữ Huy hiệu'}).map(([type, typeLabel]) => (
                             <label key={type} className="flex items-center justify-between text-sm">
                                 <span className="text-gray-600 dark:text-slate-400">{typeLabel}</span>
                                 <input type="color" value={colors[value][type as keyof PriorityColors[Priority]]} onChange={e => handleColorChange(value, type as keyof PriorityColors[Priority], e.target.value)} className="w-8 h-8 p-0 border-none rounded cursor-pointer bg-transparent" />
                             </label>
                           ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

type SortKey = 'dueDate' | 'status' | 'priority';
interface SortConfig {
    key: SortKey;
    direction: 'ascending' | 'descending';
}

const StudyPlanner: React.FC<StudyPlannerProps> = ({ tasks, addTasks, updateTaskStatus, updateTaskPriority, deleteTask, priorityColors, setPriorityColors }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'dueDate', direction: 'ascending' });
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);

  const sortedTasks = useMemo(() => {
    const sortableTasks = [...tasks];
    const priorityOrder: { [key in Priority]: number } = { [Priority.High]: 3, [Priority.Medium]: 2, [Priority.Low]: 1 };
    const statusOrder: { [key in TaskStatus]: number } = { [TaskStatus.ToDo]: 3, [TaskStatus.InProgress]: 2, [TaskStatus.Done]: 1 };

    sortableTasks.sort((a, b) => {
        let comparison = 0;
        if (sortConfig.key === 'dueDate') {
            comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortConfig.key === 'priority') {
            comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
        } else if (sortConfig.key === 'status') {
            comparison = statusOrder[b.status] - statusOrder[a.status];
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
    });
    return sortableTasks;
  }, [tasks, sortConfig]);

  const handleSortChange = (key: SortKey) => {
    setSortConfig(current => {
      if (current.key === key && key === 'dueDate') {
        return { ...current, direction: current.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { key, direction: key === 'dueDate' ? 'ascending' : 'descending' };
    });
  };
  
  const handleGeneratePlan = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const planTasks = await generateStudyPlan(topic);
      const tasksToAdd = planTasks.map((task, index) => {
        const today = new Date();
        const dueDate = new Date(today);
        dueDate.setDate(today.getDate() + (index + 1) * 3);
        return {
          ...task,
          dueDate: dueDate.toISOString().split('T')[0],
          status: TaskStatus.ToDo,
        };
      });
       if (tasksToAdd.length > 0) {
        addTasks(tasksToAdd);
      }
    } catch (error) {
      console.error("Failed to generate and add tasks", error);
    } finally {
      setIsLoading(false);
      setTopic('');
    }
  };
  
  const sortOptions: {key: SortKey, label: string}[] = [
    { key: 'dueDate', label: 'Hạn chót' },
    { key: 'priority', label: 'Ưu tiên' },
    { key: 'status', label: 'Trạng thái' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 transition-colors duration-300">
      <div className="flex items-center mb-4">
        <BookOpenIcon className="w-6 h-6 text-blue-500 mr-3" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Kế hoạch Học tập</h2>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-700 dark:to-slate-800 border border-blue-200 dark:border-slate-600 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Tạo kế hoạch học tập với AI ✨</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Nhập chủ đề học tập (ví dụ: 'React Hooks')"
            className="flex-grow p-2 border border-gray-300 dark:border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white dark:bg-slate-600 dark:text-white dark:placeholder-gray-400"
            disabled={isLoading}
          />
          <button onClick={handleGeneratePlan} disabled={isLoading || !topic.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-blue-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isLoading ? <><i className="fas fa-spinner fa-spin"></i>Đang tạo...</> : <>Tạo kế hoạch</>}
          </button>
        </div>
      </div>
      
      {isColorPickerVisible && <ColorCustomizer colors={priorityColors} setColors={setPriorityColors} onClose={() => setIsColorPickerVisible(false)} />}

      <div className="flex items-center gap-2 mb-4 flex-wrap justify-between">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-full">
            <span className="text-sm font-medium text-gray-600 dark:text-slate-400 pl-2">Sắp xếp:</span>
            {sortOptions.map(({key, label}) => (
                <button key={key} onClick={() => handleSortChange(key)} className={`px-3 py-1 text-sm font-semibold rounded-full transition ${sortConfig.key === key ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/50'}`}>
                    {label}
                    {sortConfig.key === key && key === 'dueDate' && (
                        <i className={`fas ${sortConfig.direction === 'ascending' ? 'fa-arrow-up' : 'fa-arrow-down'} ml-2 text-xs`}></i>
                    )}
                </button>
            ))}
        </div>
        <button onClick={() => setIsColorPickerVisible(v => !v)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition" aria-label="Tùy chỉnh màu sắc">
            <PaletteIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
        {sortedTasks.length > 0 ? (
          sortedTasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              colors={priorityColors[task.priority]}
              onStatusChange={(status) => updateTaskStatus(task.id, status)} 
              onPriorityChange={(priority) => updateTaskPriority(task.id, priority)}
              onDelete={() => deleteTask(task.id)}
            />
          ))
        ) : (
          <div className="text-center py-10">
            <BookOpenIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">Chưa có kế hoạch nào</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500">Hãy tạo một kế hoạch mới với AI để bắt đầu!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyPlanner;