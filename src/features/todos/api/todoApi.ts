import { axiosClient } from "@/lib/axios/client";
import { Todo, CreateTodoPayload, UpdateTodoPayload } from "@/types";
import { ROUTES } from "@/config/api.config";

export const todoApi = {
  // Fetch all todos
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await axiosClient.get<Todo[]>(ROUTES.TODOS);
    return response.data;
  },

  // Fetch single todo by ID
  getTodoById: async (id: number): Promise<Todo> => {
    const response = await axiosClient.get<Todo>(`${ROUTES.TODOS}/${id}`);
    return response.data;
  },

  // Fetch todos by user ID
  getTodosByUserId: async (userId: number): Promise<Todo[]> => {
    const response = await axiosClient.get<Todo[]>(ROUTES.TODOS, {
      params: { userId },
    });
    return response.data;
  },

  // Create new todo
  createTodo: async (payload: CreateTodoPayload): Promise<Todo> => {
    const response = await axiosClient.post<Todo>(ROUTES.TODOS, payload);
    return response.data;
  },

  // Update todo
  updateTodo: async (id: number, payload: UpdateTodoPayload): Promise<Todo> => {
    const response = await axiosClient.patch<Todo>(
      `${ROUTES.TODOS}/${id}`,
      payload
    );
    return response.data;
  },

  // Delete todo
  deleteTodo: async (id: number): Promise<void> => {
    await axiosClient.delete(`${ROUTES.TODOS}/${id}`);
  },
};
