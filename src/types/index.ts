// API Types
export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

export interface CreateTodoPayload {
  userId: number;
  title: string;
  completed: boolean;
}

export interface UpdateTodoPayload {
  userId?: number;
  title?: string;
  completed?: boolean;
}

// Auth Types
export interface Session {
  user?: {
    id: string;
    email: string;
    name: string;
  };
  expires: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Error Types
export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}
