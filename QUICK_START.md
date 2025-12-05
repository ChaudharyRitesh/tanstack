# Quick Start Guide

## Getting Started

### 1. Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### 2. Installation
The project is already set up! All dependencies are installed.

### 3. Environment Setup
Check `.env.local` file (already created):
```
NEXT_PUBLIC_API_URL=https://jsonplaceholder.typicode.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Test the App

**Login Credentials**:
- Email: `demo@example.com`
- Password: `password`

**Features to Try**:
1. Login with demo credentials
2. View todos (fetched from JSONPlaceholder)
3. Create a new todo
4. Toggle todo completion
5. Delete a todo
6. Logout

## Project Tour

### Key Files to Review

1. **Layout & Providers** (`src/app/layout.tsx`)
   - Sets up QueryProvider (TanStack Query)
   - Sets up ReduxProvider
   - Sets up AuthProvider (NextAuth)

2. **Todo Hooks** (`src/features/todos/hooks/useTodos.ts`)
   - TanStack Query hooks for todos
   - Shows query patterns and mutations

3. **Todo API** (`src/features/todos/api/todoApi.ts`)
   - Axios instance with interceptors
   - API service methods

4. **Redux Store** (`src/store/store.ts`)
   - Redux Toolkit configuration
   - Extensible for more slices

5. **Auth Config** (`src/config/auth.config.ts`)
   - NextAuth configuration
   - JWT callbacks

## Understanding the Architecture

### Data Flow

```
User Input
    ↓
Component (TodoList.tsx)
    ↓
Custom Hook (useTodos.ts - TanStack Query)
    ↓
API Service (todoApi.ts - Axios)
    ↓
Axios Interceptors (auth token, error handling)
    ↓
JSONPlaceholder API
    ↓
Cache (TanStack Query)
    ↓
Component Re-render
```

### State Management

**Server State** (TanStack Query):
- Todos from API
- Automatic caching & refetching
- Automatic invalidation on mutations

**Client State** (Redux):
- Can be extended for UI state (filters, modals, etc.)
- Already set up and ready to use

**Auth State** (NextAuth):
- Session management
- JWT handling
- Protected routes

## Common Tasks

### Add a New API Endpoint

1. Add method to `src/features/todos/api/todoApi.ts`:
```typescript
export const todoApi = {
  getCompletedTodos: async (): Promise<Todo[]> => {
    const response = await axiosClient.get<Todo[]>(`${ROUTES.TODOS}?completed=true`);
    return response.data;
  },
};
```

2. Create hook in `src/features/todos/hooks/useTodos.ts`:
```typescript
export const useGetCompletedTodos = () => {
  return useQuery({
    queryKey: [...TODOS_QUERY_KEY, 'completed'],
    queryFn: todoApi.getCompletedTodos,
  });
};
```

3. Use in component:
```typescript
const { data: completedTodos } = useGetCompletedTodos();
```

### Add a New Feature

1. Create feature folder: `src/features/[feature-name]/`
2. Structure:
   ```
   features/[feature]/
   ├── api/          # API services
   ├── components/   # React components
   ├── hooks/        # Custom hooks
   └── store/        # Redux slices (if needed)
   ```
3. Export hooks and components
4. Use in pages

### Add Redux State

1. Create new slice in `src/store/`:
```typescript
// src/store/filterSlice.ts
import { createSlice } from '@reduxjs/toolkit';

const filterSlice = createSlice({
  name: 'filters',
  initialState: { status: 'all' },
  reducers: {
    setFilter: (state, action) => {
      state.status = action.payload;
    },
  },
});

export default filterSlice.reducer;
```

2. Add to store:
```typescript
// src/store/store.ts
configureStore({
  reducer: {
    todos: todosReducer,
    filters: filterReducer,  // Add new slice
  },
});
```

3. Use in component:
```typescript
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setFilter } from '@/store/filterSlice';

function FilterButton() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.filters);
  
  return (
    <button onClick={() => dispatch(setFilter('completed'))}>
      Filter
    </button>
  );
}
```

## Debugging

### Check What's Running

```bash
# Terminal
npm run dev

# Browser DevTools
- Open DevTools (F12)
- Network tab: See API calls to jsonplaceholder.typicode.com
- Console: Watch for errors
```

### TanStack Query DevTools

Add to see query cache in real-time:
```bash
npm install @tanstack/react-query-devtools
```

Then uncomment devtools in QueryProvider (or add if needed).

### Redux DevTools

Install [Redux DevTools Extension](https://github.com/reduxjs/redux-devtools-extension) for browser to see Redux state changes.

## Build for Production

```bash
npm run build     # Create optimized build
npm start        # Run production server
```

## Troubleshooting

### Issue: "Module not found" errors
- Ensure import paths use `@/` alias
- Check TypeScript paths in `tsconfig.json`

### Issue: Auth token not being sent
- Check `src/lib/axios/interceptors.ts` for token logic
- Verify `localStorage.setItem('authToken', token)` is called after login

### Issue: Queries not updating
- Check query key in `useTodos.ts`
- Ensure mutations call `invalidateQueries` or `setQueryData`
- Check TanStack Query DevTools for cache state

### Issue: Styles not applying
- Ensure `globals.css` is imported in `layout.tsx`
- Check Tailwind config is correct
- Try clearing `.next` and rebuilding: `rm -r .next && npm run build`

## Next: Explore the Code

Start with these files in order:
1. `src/app/layout.tsx` - See how providers are set up
2. `src/app/page.tsx` - See home page with authentication
3. `src/features/todos/hooks/useTodos.ts` - Understand TanStack Query
4. `src/features/todos/components/TodoList.tsx` - See component usage
5. `src/config/auth.config.ts` - Understand NextAuth setup

Happy coding! 🚀
