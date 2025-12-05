# Route Protection with Proxy Guide

## Overview

The application uses Next.js Proxy (formerly Middleware) for route protection. This ensures:
- ✅ Unauthenticated users cannot access protected routes
- ✅ Automatic redirection to login page
- ✅ JWT token validation on every request
- ✅ Public routes remain accessible

## Proxy Location

**File**: `src/proxy.ts`

**Note**: In Next.js 16+, the `middleware.ts` convention has been renamed to `proxy.ts` to better reflect its purpose as a network boundary proxy.

## How It Works

### Route Protection Strategy

```
User Request
    ↓
Middleware Checks Token
    ↓
Token Valid?
    ├─ YES → Allow Access
    └─ NO → Redirect to /login
```

### Protected Routes

By default, these routes require authentication:
- `/` (Home page with todos)
- `/api/protected/*` (Protected API endpoints)
- Any other route not in the public list

### Public Routes

These routes are accessible without authentication:
- `/login` (Login page)
- `/api/auth/*` (NextAuth endpoints)
- `/_next/*` (Next.js static files)
- `/favicon.ico` (Favicon)

## Configuration

### Matcher Pattern

```typescript
export const config = {
  matcher: [
    '/',                                    // Home page protected
    '/api/protected/:path*',               // API protection
    '/((?!login|api/auth|_next|favicon).*)', // Everything else protected by default
  ],
};
```

### Explanation:
1. `/` - Protects home page
2. `/api/protected/:path*` - Protects API routes starting with `/api/protected/`
3. `/((?!login|api/auth|_next|favicon).*)` - Protects all other routes except:
   - `login` pages
   - `api/auth` endpoints
   - `_next` static assets
   - `favicon.ico`

## Middleware Callbacks

### `authorized` Callback

Determines if a request is allowed:

```typescript
authorized: ({ token, req }) => {
  // If token exists, user is authenticated
  if (token) return true;

  // Allow public routes
  if (isPublicRoute(req.path)) return true;

  // Redirect to login for protected routes
  return false;
}
```

## Advanced: Custom Route Protection

### Protecting Specific Routes

To protect specific routes with middleware:

1. **Update matcher in middleware.ts**
```typescript
export const config = {
  matcher: [
    '/admin/:path*',        // Protect /admin/*
    '/api/admin/:path*',    // Protect /api/admin/*
    '/dashboard/:path*',    // Protect /dashboard/*
  ],
};
```

2. **Add custom logic in callbacks**
```typescript
authorized: ({ token, req }) => {
  // Check specific admin route
  if (req.nextUrl.pathname.startsWith('/admin')) {
    return token?.role === 'admin'; // Check user role
  }
  
  return !!token;
}
```

### Role-Based Access Control

```typescript
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const userRole = token?.role;
    
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
```

## API Route Protection

### Protecting API Routes

For API routes that need authentication:

```typescript
// api/protected/route.ts
import { getServerSession } from 'next-auth';
import { authConfig } from '@/config/auth.config';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authConfig);
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Protected logic here
  return NextResponse.json({ data: 'Protected data' });
}
```

## Token Validation

### JWT Token Contents

The middleware automatically validates JWT tokens which contain:

```typescript
{
  sub: 'user-id',           // User ID (subject)
  email: 'user@example.com',
  name: 'User Name',
  iat: 1234567890,          // Issued at time
  exp: 1234671490,          // Expiration time
  id: 'custom-user-id'      // Custom field added by callbacks
}
```

### Token Expiration

- **Default**: 30 days
- **Custom**: Configure in auth callbacks

```typescript
callbacks: {
  jwt: async ({ token, user, account }) => {
    if (user) {
      token.id = user.id;
      token.maxAge = 7 * 24 * 60 * 60; // 7 days
    }
    return token;
  }
}
```

## Debugging Middleware

### Enable Logging

```typescript
// In middleware.ts
function middleware(req: NextRequest) {
  console.log('Middleware triggered for:', req.nextUrl.pathname);
  console.log('Token exists:', !!req.nextauth.token);
  
  return;
}
```

### Check in Browser

1. **DevTools → Application → Cookies**
   - Look for `next-auth.jwt` cookie
   - Should be secure and httpOnly

2. **DevTools → Network**
   - Check request headers for auth tokens
   - Watch for 307 redirects to /login

### NextAuth Debug Mode

```typescript
// In auth.config.ts
export const authConfig: NextAuthOptions = {
  debug: true, // Logs to console
  // ... rest of config
};
```

## Common Issues & Solutions

### Issue: Always Redirects to Login

**Possible Causes:**
- Token expired
- `NEXTAUTH_SECRET` changed
- Database session lost

**Solution:**
```typescript
// Clear cookies and retry
localStorage.clear();
// Hard refresh browser (Ctrl+Shift+R)
// Re-login
```

### Issue: Can Access Protected Routes Without Login

**Possible Causes:**
- Middleware not configured correctly
- Token validation failing silently
- Matcher pattern too permissive

**Solution:**
```typescript
// Verify matcher covers your routes
matcher: [
  '/((?!login|api/auth|_next|public|favicon).*)',
]
```

### Issue: API Routes Not Protected

**Possible Causes:**
- Middleware matcher excludes `/api` routes
- Manual middleware check not implemented

**Solution:**
```typescript
// Add API protection
matcher: [
  '/api/protected/:path*',
  '/((?!login|api/auth).*)',
]

// Or check in API route handler
const session = await getServerSession(authConfig);
if (!session) return unauthorizedResponse();
```

### Issue: Infinite Redirect Loop

**Possible Causes:**
- `/login` route protected by middleware
- Middleware incorrectly configured

**Solution:**
```typescript
// Ensure /login is public
const publicRoutes = ['/login', '/api/auth'];
if (publicRoutes.some(route => path.startsWith(route))) {
  return true; // Allow without token
}
```

## Testing Middleware

### Manual Testing

1. **Test Protected Route**
   ```
   Open http://localhost:3000 without logging in
   → Should redirect to /login
   ```

2. **Test Login**
   ```
   Login with demo@example.com / password
   → Should redirect to /
   ```

3. **Test Logout**
   ```
   Click logout
   → Should redirect to /login
   ```

4. **Test OAuth**
   ```
   Click "Sign in with Google"
   → Should complete flow and redirect to /
   ```

### Automated Testing

Create a test file:

```typescript
// __tests__/middleware.test.ts
import { getServerSession } from 'next-auth';

describe('Middleware Protection', () => {
  it('should redirect unauthenticated users to /login', async () => {
    // Mock no session
    jest.mock('next-auth', () => ({
      getServerSession: jest.fn(() => null),
    }));

    // Test middleware behavior
    // Verify redirect to /login
  });

  it('should allow authenticated users to access /', async () => {
    // Mock valid session
    jest.mock('next-auth', () => ({
      getServerSession: jest.fn(() => ({ user: { id: '1' } })),
    }));

    // Test middleware behavior
    // Verify access allowed
  });
});
```

## Best Practices

1. **Keep Matcher Simple** - Use clear patterns, avoid excessive nesting
2. **Whitelist Public Routes** - Explicitly allow public routes
3. **Validate in API Routes** - Always check session server-side
4. **Test Coverage** - Test both protected and public routes
5. **Logging** - Log middleware decisions for debugging
6. **Cache Control** - Set proper cache headers for protected pages
7. **CSRF Protection** - NextAuth handles this automatically
8. **Token Refresh** - Configure appropriate token expiration

## Production Deployment

### Security Considerations

1. **HTTPS Only** - Set `NODE_ENV=production`
2. **Secure Cookies** - Automatically set in production
3. **Token Expiration** - Set reasonable expiry times
4. **CORS** - Configure if using separate frontend
5. **Rate Limiting** - Add rate limit middleware
6. **Audit Logging** - Log authentication attempts

### Environment Variables for Production

```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secure-random-key
NODE_ENV=production
```

## Files Reference

| File | Purpose |
|------|---------|
| `src/proxy.ts` | Route protection logic (formerly middleware.ts) |
| `src/config/auth.config.ts` | Auth configuration |
| `src/app/layout.tsx` | Providers setup |
| `src/hooks/useAuth.ts` | Session hook |

## Next.js 16+ Migration Note

In Next.js 16, the `middleware.ts` file convention was renamed to `proxy.ts` to better reflect its purpose as a network boundary proxy. This is not a functional change, just a naming convention update to reduce confusion with Express.js middleware patterns.

### Changes Made:
- ✅ File renamed: `middleware.ts` → `proxy.ts`
- ✅ Function name updated: `middleware()` → `proxy()`
- ✅ Functionality remains the same
- ✅ No configuration changes needed

## Next Steps

1. ✅ Review middleware configuration
2. ✅ Test protected routes
3. ✅ Test OAuth flow
4. ✅ Verify API protection
5. ✅ Deploy to production
6. ✅ Monitor auth logs
7. ✅ Handle token refresh

## Resources

- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [NextAuth.js Middleware](https://next-auth.js.org/configuration/nextjs)
- [JWT Token Management](https://next-auth.js.org/configuration/callbacks)
