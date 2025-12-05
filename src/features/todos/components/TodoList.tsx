"use client";

import { useGetTodosByUserId } from "@/features/todos/hooks/useTodos";
import { TodoItem } from "./TodoItem";
import { CreateTodoForm } from "./CreateTodoForm";

interface TodoListProps {
  userId: number;
}

export function TodoList({ userId }: TodoListProps) {
  const { data: todos = [], isLoading, error } = useGetTodosByUserId(userId);

  if (isLoading) {
    return <div className="text-center py-8">Loading todos...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading todos. Please try again.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <CreateTodoForm userId={userId} />
      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No todos yet. Create one to get started!
          </div>
        ) : (
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </div>
    </div>
  );
}
