import { GoogleGenAI, Type } from "@google/genai";
import type { Task } from '../types';
import { Priority } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateStudyPlan = async (topic: string): Promise<Omit<Task, 'id' | 'status' | 'dueDate'>[]> => {
  if (!process.env.API_KEY) {
    console.error("API key is not set.");
    // Trả về kế hoạch mẫu bằng tiếng Việt
    return [
      { title: `Học những điều cơ bản về ${topic}`, description: `Hiểu các khái niệm cơ bản.`, priority: Priority.High },
      { title: `Thực hành ${topic}`, description: `Làm các bài tập và dự án đơn giản.`, priority: Priority.Medium },
      { title: `Nâng cao ${topic}`, description: `Đi sâu vào các chủ đề phức tạp hơn và xây dựng một dự án lớn hơn.`, priority: Priority.Low },
    ];
  }
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Tạo một kế hoạch học tập chi tiết cho chủ đề "${topic}". Kế hoạch nên là một danh sách các công việc. Đối với mỗi công việc, hãy cung cấp một tiêu đề ngắn gọn, một mô tả ngắn gọn trong một câu và một mức độ ưu tiên được đề xuất (sử dụng một trong các giá trị: 'High', 'Medium', 'Low').`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "Tiêu đề của công việc học tập."
              },
              description: {
                type: Type.STRING,
                description: "Một mô tả ngắn gọn trong một câu về công việc."
              },
              priority: {
                type: Type.STRING,
                description: "Mức độ ưu tiên được đề xuất cho công việc. Phải là một trong các giá trị: 'High', 'Medium', 'Low'.",
                enum: ["High", "Medium", "Low"]
              }
            },
            required: ["title", "description", "priority"]
          }
        }
      }
    });

    const jsonString = response.text.trim();
    const plan = JSON.parse(jsonString);
    
    if (Array.isArray(plan) && plan.every(item => item.title && item.description && item.priority)) {
      // Convert priority from "High" to "high" to match our enum
      return plan.map(item => ({
        ...item,
        priority: item.priority.toLowerCase() as Priority,
      }));
    } else {
      console.error("Invalid format received from Gemini API:", plan);
      return [];
    }

  } catch (error) {
    console.error("Error generating study plan with Gemini:", error);
    return [];
  }
};