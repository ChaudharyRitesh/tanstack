## TanStack Query Setup & Usage Guide

### Overview
TanStack Query (React Query) handles all server state management in this project. It sits between your API calls and React components, providing caching, synchronization, and background refetching out of the box.

### Query Client Configuration
**File**: `src/lib/api/queryClient.ts`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes before data considered stale
      gcTime: 1000 * 60 * 10,           // 10 minutes cache retention
      retry: 1,                         // Retry failed requests once
      refetchOnWindowFocus: false,      // Don't refetch when window regains focus
    },
    mutations: {
      retry: 1,                         // Retry failed mutations once
    },
  },
});
```

### Query Hooks Pattern

#### How to Create Query Hooks

**File**: `src/features/todos/hooks/useTodos.ts`

```typescript
// 1. Define Query Keys (hierarchical, for cache management)
const TODOS_QUERY_KEY = ['todos'];
const SINGLE_TODO_QUERY_KEY = (id: number) => [...TODOS_QUERY_KEY, id];
const USER_TODOS_QUERY_KEY = (userId: number) => [...TODOS_QUERY_KEY, 'user', userId];

// 2. Create Query Hook
export const useGetAllTodos = () => {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: todoApi.getAllTodos,
  });
};

// 3. Create Query with Parameters
export const useGetTodosByUserId = (userId: number) => {
  return useQuery({
    queryKey: USER_TODOS_QUERY_KEY(userId),
    queryFn: () => todoApi.getTodosByUserId(userId),
    enabled: !!userId,  // Only run when userId is truthy
  });
};
```

#### How to Create Mutation Hooks

```typescript
export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTodoPayload) => todoApi.createTodo(payload),
    onSuccess: (newTodo) => {
      // 1. Update specific query cache
      queryClient.setQueryData<Todo[]>(TODOS_QUERY_KEY, (oldData) => {
        return oldData ? [newTodo, ...oldData] : [newTodo];
      });

      // 2. Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: USER_TODOS_QUERY_KEY(newTodo.userId),
      });
    },
  });
};
```

### Using Queries in Components

#### Basic Query Usage
```typescript
function TodoList() {
  const { data: todos, isLoading, error } = useGetAllTodos();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading todos</div>;

  return (
    <div>
      {todos.map(todo => <TodoItem key={todo.id} todo={todo} />)}
    </div>
  );
}
```

#### Using Multiple Queries
```typescript
function TodoDetail({ userId }: { userId: number }) {
  const { data: userTodos } = useGetTodosByUserId(userId);
  const { data: todo } = useGetTodoById(1);

  return (
    // Both queries run in parallel
  );
}
```

### Using Mutations in Components

#### Basic Mutation
```typescript
function CreateTodoButton({ userId }: { userId: number }) {
  const { mutate, isPending } = useCreateTodo();

  const handleClick = () => {
    mutate({
      userId,
      title: 'New Todo',
      completed: false,
    });
  };

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Todo'}
    </button>
  );
}
```

#### Mutation with Callbacks
```typescript
const { mutate } = useUpdateTodo();

mutate(
  { id: 1, payload: { completed: true } },
  {
    onSuccess: () => {
      // Show success toast
    },
    onError: (error) => {
      // Show error toast
    },
  }
);
```

### Advanced Patterns

#### 1. Dependent Queries
```typescript
export const useTodoWithDetails = (todoId: number) => {
  const todoQuery = useGetTodoById(todoId);
  
  // This query only runs after todoQuery succeeds
  const { data: todo } = todoQuery;
  
  return useQuery({
    queryKey: ['todoDetails', todoId],
    queryFn: () => fetchTodoDetails(todo.id),
    enabled: !!todo,  // Wait for todoQuery to complete
  });
};
```

#### 2. Query Invalidation
```typescript
const queryClient = useQueryClient();

// Invalidate single query
queryClient.invalidateQueries({ queryKey: TODOS_QUERY_KEY });

// Invalidate multiple queries
queryClient.invalidateQueries({
  queryKey: TODOS_QUERY_KEY,
  exact: false,  // Matches TODOS_QUERY_KEY and all subkeys
});
```

#### 3. Manual Cache Updates
```typescript
// Set cache data manually
queryClient.setQueryData(TODOS_QUERY_KEY, newTodos);

// Get current cache data
const todos = queryClient.getQueryData(TODOS_QUERY_KEY);
```

#### 4. Optimistic Updates
```typescript
const { mutate } = useUpdateTodo();

mutate(
  { id: 1, payload: { completed: true } },
  {
    onMutate: async (newData) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({
        queryKey: TODOS_QUERY_KEY,
      });

      // Save old data
      const oldTodos = queryClient.getQueryData(TODOS_QUERY_KEY);

      // Update cache immediately
      queryClient.setQueryData(TODOS_QUERY_KEY, (old) => {
        // Update logic
      });

      return { oldTodos };
    },
    onError: (err, newData, context) => {
      // Revert on error
      if (context?.oldTodos) {
        queryClient.setQueryData(TODOS_QUERY_KEY, context.oldTodos);
      }
    },
  }
);
```

### Best Practices

1. **Query Keys**: Keep them hierarchical and queryable
   ```typescript
   ✓ ['todos', 'user', userId]  // Can query exact or partial
   ✗ [userId, 'todos']           // Less flexible
   ```

2. **Enabled Queries**: Only run when ready
   ```typescript
   useQuery({
     enabled: !!userId,  // Wait for userId to be available
   });
   ```

3. **Cache Time**: Balance freshness vs API load
   ```typescript
   staleTime: 5 * 60 * 1000,    // Consider fresh for 5 min
   gcTime: 10 * 60 * 1000,      // Keep in cache for 10 min
   ```

4. **Error Handling**: Use fallback UI
   ```typescript
   const { error } = useQuery(/* ... */);
   if (error) return <ErrorComponent error={error} />;
   ```

5. **Suspense**: For boundaries (experimental)
   ```typescript
   const { data } = useQuery({
     suspense: true,  // Throws promise until data loads
   });
   ```

### Debugging

#### React Query DevTools
To add devtools for debugging:

```bash
npm install @tanstack/react-query-devtools
```

```typescript
// In your provider
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <YourApp />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### Common Issues

**Issue**: Query not updating after mutation
**Solution**: Invalidate the related query key in mutation's `onSuccess`

**Issue**: Stale data showing after successful mutation
**Solution**: Use `setQueryData` for immediate updates + `invalidateQueries` for sync

**Issue**: Multiple requests for same data
**Solution**: Check `staleTime` configuration and query deduplication

### Revision Checklist for TanStack Query

- [ ] Query keys are hierarchical and consistent
- [ ] `enabled` prop used to prevent premature queries
- [ ] `staleTime` and `gcTime` configured appropriately
- [ ] Mutations invalidate/update related queries
- [ ] Error states handled in components
- [ ] Loading states displayed correctly
- [ ] No unnecessary re-renders (check devtools)
