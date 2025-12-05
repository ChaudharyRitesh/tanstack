"use client";

import { Todo } from "@/types";
import { useUpdateTodo, useDeleteTodo } from "@/features/todos/hooks/useTodos";

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const updateMutation = useUpdateTodo();
  const deleteMutation = useDeleteTodo();

  const handleToggle = () => {
    updateMutation.mutate({
      id: todo.id,
      payload: { completed: !todo.completed },
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(todo.id);
  };

  return (
    <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleToggle}
        disabled={updateMutation.isPending}
        className="w-5 h-5 cursor-pointer"
      />
      <span
        className={`flex-1 ${
          todo.completed ? "line-through text-gray-400" : "text-gray-900"
        }`}
      >
        {todo.title}
      </span>
      <button
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
      >
        {deleteMutation.isPending ? "Deleting..." : "Delete"}
      </button>
    </div>
  );
}
