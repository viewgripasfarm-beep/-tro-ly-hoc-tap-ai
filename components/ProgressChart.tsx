import React from 'react';
import type { Task, ChartData } from '../types';
import { TaskStatus } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartPieIcon } from './icons';

interface ProgressChartProps {
  tasks: Task[];
}

const COLORS = {
  [TaskStatus.Done]: '#34d399', // emerald-400
  [TaskStatus.InProgress]: '#60a5fa', // blue-400
  [TaskStatus.ToDo]: '#f87171', // red-400
};

const STATUS_NAMES = {
    [TaskStatus.ToDo]: 'Cần làm',
    [TaskStatus.InProgress]: 'Đang làm',
    [TaskStatus.Done]: 'Hoàn thành',
}

const ProgressChart: React.FC<ProgressChartProps> = ({ tasks }) => {
  const data: ChartData[] = React.useMemo(() => {
    const counts = {
      [TaskStatus.ToDo]: 0,
      [TaskStatus.InProgress]: 0,
      [TaskStatus.Done]: 0,
    };
    tasks.forEach(task => {
      counts[task.status]++;
    });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_NAMES[status as TaskStatus],
      value: count,
    }));
  }, [tasks]);

  const totalTasks = tasks.length;
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700/50 h-full transition-colors duration-300 flex flex-col">
      <div className="flex items-center mb-4">
        <ChartPieIcon className="w-6 h-6 text-blue-500 mr-3" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200">Báo cáo Hiệu suất</h2>
      </div>
      {totalTasks === 0 ? (
         <div className="flex-1 flex flex-col items-center justify-center text-center">
            <ChartPieIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="font-semibold text-slate-600 dark:text-slate-400">Chưa có dữ liệu</h3>
            <p className="text-sm text-slate-500 dark:text-slate-500">Báo cáo sẽ được hiển thị khi bạn có công việc.</p>
        </div>
      ) : (
        <div className="w-full h-[300px]">
             <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent, x, y, textAnchor }) => (
                           <text x={x} y={y} fill={isDark ? '#cbd5e1' : '#475569'} textAnchor={textAnchor} dominantBaseline="central" fontSize={12}>
                             {`${(percent * 100).toFixed(0)}%`}
                           </text>
                        )}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[Object.keys(STATUS_NAMES).find(key => STATUS_NAMES[key as TaskStatus] === entry.name) as TaskStatus]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                            backgroundColor: isDark ? 'rgb(30 41 59 / 0.9)' : 'rgb(255 255 255 / 0.9)',
                            border: `1px solid ${isDark ? 'rgb(51 65 85)' : 'rgb(226 232 240)'}`,
                            borderRadius: '0.5rem',
                        }}
                        formatter={(value, name) => [`${value} công việc`, name]}
                        labelStyle={{ color: isDark ? '#e2e8f0' : '#1e293b', fontWeight: 'bold' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px', color: isDark ? '#e2e8f0' : '#475569' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;