import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { todoApi } from "../api/todoApi";
import { Todo, CreateTodoPayload, UpdateTodoPayload } from "@/types";

const TODOS_QUERY_KEY = ["todos"];
const SINGLE_TODO_QUERY_KEY = (id: number) => [...TODOS_QUERY_KEY, id];
const USER_TODOS_QUERY_KEY = (userId: number) => [
  ...TODOS_QUERY_KEY,
  "user",
  userId,
];

// Queries
export const useGetAllTodos = () => {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: todoApi.getAllTodos,
  });
};

export const useGetTodoById = (id: number) => {
  return useQuery({
    queryKey: SINGLE_TODO_QUERY_KEY(id),
    queryFn: () => todoApi.getTodoById(id),
    enabled: !!id,
  });
};

export const useGetTodosByUserId = (userId: number) => {
  return useQuery({
    queryKey: USER_TODOS_QUERY_KEY(userId),
    queryFn: () => todoApi.getTodosByUserId(userId),
    enabled: !!userId,
  });
};

// Mutations
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTodoPayload) => todoApi.createTodo(payload),
    onSuccess: (newTodo) => {
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (oldData) => {
        return oldData ? [newTodo, ...oldData] : [newTodo];
      });

      queryClient.invalidateQueries({
        queryKey: USER_TODOS_QUERY_KEY(newTodo.userId),
      });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateTodoPayload }) =>
      todoApi.updateTodo(id, payload),
    onSuccess: (updatedTodo) => {
      queryClient.setQueryData<Todo>(
        SINGLE_TODO_QUERY_KEY(updatedTodo.id),
        updatedTodo
      );

      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (oldData) => {
        if (!oldData) return [updatedTodo];
        return oldData.map((todo) =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        );
      });

      queryClient.invalidateQueries({
        queryKey: USER_TODOS_QUERY_KEY(updatedTodo.userId),
      });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => todoApi.deleteTodo(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (oldData) => {
        if (!oldData) return [];
        const todoToDelete = oldData.find((todo) => todo.id === id);
        const filtered = oldData.filter((todo) => todo.id !== id);

        if (todoToDelete) {
          queryClient.invalidateQueries({
            queryKey: USER_TODOS_QUERY_KEY(todoToDelete.userId),
          });
        }

        return filtered;
      });
    },
  });
};
