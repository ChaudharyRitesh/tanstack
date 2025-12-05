"use client";

import { useState } from "react";
import { useCreateTodo } from "@/features/todos/hooks/useTodos";

interface CreateTodoFormProps {
  userId: number;
}

export function CreateTodoForm({ userId }: CreateTodoFormProps) {
  const [title, setTitle] = useState("");
  const createMutation = useCreateTodo();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createMutation.mutate(
      {
        userId,
        title: title.trim(),
        completed: false,
      },
      {
        onSuccess: () => {
          setTitle("");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new todo..."
        disabled={createMutation.isPending}
        className="flex-1 px-4 py-2 text-black border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={createMutation.isPending || !title.trim()}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {createMutation.isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
