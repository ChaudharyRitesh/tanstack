## Project Structure Overview

### Directory Organization

```
src/
├── app/                          # Next.js App Router
│   ├── api/auth/[...nextauth]/  # NextAuth configuration
│   ├── login/                    # Login page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home/Todo page
│   └── globals.css               # Global styles
│
├── config/                       # Configuration files
│   ├── api.config.ts             # API constants and routes
│   └── auth.config.ts            # NextAuth configuration
│
├── features/                     # Feature-based modules (Separation of Concerns)
│   ├── auth/
│   │   └── components/
│   │       ├── LoginForm.tsx      # Login form component
│   │       └── Navbar.tsx         # Navigation bar
│   │
│   └── todos/                    # Todo feature module
│       ├── api/
│       │   └── todoApi.ts         # Todo API service (Axios + TanStack Query)
│       ├── components/
│       │   ├── TodoItem.tsx       # Individual todo item
│       │   ├── TodoList.tsx       # Todo list container
│       │   └── CreateTodoForm.tsx # Create todo form
│       ├── hooks/
│       │   └── useTodos.ts        # TanStack Query hooks for todos
│       └── store/
│           └── todosSlice.ts      # Redux Toolkit slice
│
├── hooks/                        # Global hooks
│   ├── useAuth.ts                # Authentication hook
│   └── useRedux.ts               # Typed Redux hooks
│
├── lib/                          # Library/utility setup
│   ├── api/
│   │   └── queryClient.ts         # TanStack Query client
│   └── axios/
│       ├── client.ts              # Axios instance creation
│       └── interceptors.ts        # Request/Response interceptors
│
├── providers/                    # React context providers
│   ├── AuthProvider.tsx           # NextAuth provider
│   ├── QueryProvider.tsx          # TanStack Query provider
│   └── ReduxProvider.tsx          # Redux provider
│
├── store/                        # Redux store setup
│   └── store.ts                  # Redux store configuration
│
├── types/                        # TypeScript type definitions
│   └── index.ts                  # Centralized types
│
└── utils/                        # Utility functions (for future use)
```

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **State Management**: Redux Toolkit + React-Redux
- **Server State**: TanStack Query v5
- **HTTP Client**: Axios with custom interceptors
- **Authentication**: NextAuth.js v4
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **API**: JSONPlaceholder (Mock REST API)

### Key Features

#### 1. **Separation of Concerns**
- Feature-based module structure (e.g., `features/todos/`, `features/auth/`)
- Each feature has isolated: API, Components, Hooks, Store
- Clear boundaries between concerns

#### 2. **TanStack Query (React Query)**
- Manages server state (todos)
- Automatic caching and background refetching
- Optimistic updates on mutations
- Query keys organized hierarchically
- Cache invalidation on mutations

**Usage in `useTodos.ts`**:
```typescript
- useGetAllTodos(): Fetch all todos
- useGetTodoById(id): Fetch single todo
- useGetTodosByUserId(userId): Fetch user todos
- useCreateTodo(): Mutation to create
- useUpdateTodo(): Mutation to update
- useDeleteTodo(): Mutation to delete
```

#### 3. **Redux State Management**
- Redux Toolkit for predictable state management
- `todosSlice.ts`: Handles local UI state for todos
- Typed Redux hooks: `useAppDispatch`, `useAppSelector`
- Can be extended for global UI state

#### 4. **Axios Interceptors**
- **Request Interceptor**: Adds auth token from localStorage
- **Response Interceptor**: 
  - Handles 401 (unauthorized) → redirects to login
  - Handles 403 (forbidden) → logs error
  - Handles 429 (rate limit) → logs error

#### 5. **NextAuth Configuration**
- Credentials provider (email/password)
- JWT callbacks for token management
- Session callbacks for custom session data
- Logout capability
- Protected routes via middleware (optional)

### Authentication Flow

1. User navigates to `/login`
2. Enters credentials (demo@example.com / password)
3. NextAuth validates and creates JWT
4. User redirected to `/`
5. Protected pages check `useAuth()` hook
6. Logout clears session and redirects to login

### API Patterns

#### TanStack Query Pattern:
```typescript
// Query example
const { data: todos, isLoading } = useGetAllTodos();

// Mutation example
const { mutate, isPending } = useCreateTodo();
mutate(payload, {
  onSuccess: () => {
    // Handle success
  },
});
```

#### Axios Client Pattern:
```typescript
// Automatic interceptors applied
const response = await axiosClient.get('/todos');
```

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_API_URL=https://jsonplaceholder.typicode.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
```

### Running the Project

```bash
# Development
npm run dev        # http://localhost:3000

# Production build
npm run build
npm start

# Linting
npm run lint
```

### Scalability Considerations

1. **Feature Modules**: Add new features in `features/` with isolated structure
2. **API Services**: Create new service files in `features/[feature]/api/`
3. **Custom Hooks**: Add feature-specific hooks in `features/[feature]/hooks/`
4. **Redux Slices**: Create new slices for additional state in `store/`
5. **Providers**: Stack new providers in `layout.tsx` as needed
6. **Types**: Centralize all TypeScript types in `types/index.ts`

### Next Steps for Enhancement

- Add error boundary components
- Implement optimistic UI updates
- Add loading skeletons
- Implement infinite queries for pagination
- Add more auth providers (Google, GitHub)
- Add middleware for route protection
- Set up API mock interceptors for testing
