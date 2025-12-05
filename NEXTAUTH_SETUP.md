# NextAuth Social Login Setup Guide

## Overview

The application now supports multiple authentication methods:
- ✅ Credentials (Email/Password)
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ Route protection via middleware

## Setting Up Social Logins

### Google OAuth Setup

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google+ API

2. **Create OAuth 2.0 Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
   - Copy the **Client ID** and **Client Secret**

3. **Add to `.env.local`**
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

4. **Test**
   - Restart dev server
   - Click "Sign in with Google" on login page

### GitHub OAuth Setup

1. **Create GitHub OAuth App**
   - Go to GitHub Settings → [Developer settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the form:
     - **Application name**: Your app name
     - **Homepage URL**: `http://localhost:3000` (dev) or your domain
     - **Authorization callback URL**: 
       - `http://localhost:3000/api/auth/callback/github` (development)
       - `https://yourdomain.com/api/auth/callback/github` (production)

2. **Get Credentials**
   - Copy **Client ID** and generate **Client Secret**

3. **Add to `.env.local`**
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

4. **Test**
   - Restart dev server
   - Click "Sign in with GitHub" on login page

## Authentication Flow

### Credentials Flow (Email/Password)
```
User enters email/password
    ↓
CredentialsProvider validates
    ↓
JWT token created
    ↓
User logged in
```

### OAuth Flow (Google/GitHub)
```
User clicks "Sign in with [Provider]"
    ↓
Redirected to provider's login
    ↓
User grants permission
    ↓
Redirected back with authorization code
    ↓
NextAuth exchanges code for user info
    ↓
JWT token created
    ↓
User logged in
```

## Middleware Protection

The application includes a middleware (`src/middleware.ts`) that:

1. **Protects Routes**: Requires authentication for accessing `/`
2. **Public Routes**: Allows unauthenticated access to:
   - `/login`
   - `/api/auth/*`
   - Static files (`_next`, `favicon.ico`, etc.)
3. **Auto-Redirect**: Unauthenticated users trying to access protected routes are redirected to `/login`

### How Middleware Works

```typescript
matcher: [
  '/',                                    // Protected
  '/api/protected/:path*',               // Protected API
  '/((?!login|api/auth|_next|favicon).*)', // Everything else protected
]
```

## Session & Token Management

### JWT Callbacks

The auth config includes JWT callbacks that:
- **Add user ID** to the token on login
- **Persist user data** across requests
- **Available in session** for use in components

```typescript
jwt: ({ token, user }) => {
  if (user) token.id = user.id;
  return token;
}

session: ({ session, token }) => {
  if (session.user) {
    session.user.id = token.id;
  }
  return session;
}
```

### Accessing Session in Components

```typescript
import { useAuth } from '@/hooks/useAuth';

function Component() {
  const { session, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Welcome, {session?.user?.email}</div>;
}
```

## Production Deployment

### 1. Update Environment Variables

```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=generate-a-secure-random-string-here

# Google
GOOGLE_CLIENT_ID=your-prod-client-id
GOOGLE_CLIENT_SECRET=your-prod-client-secret

# GitHub
GITHUB_CLIENT_ID=your-prod-client-id
GITHUB_CLIENT_SECRET=your-prod-client-secret
```

### 2. Generate NEXTAUTH_SECRET

```bash
# Use openssl
openssl rand -base64 32

# Or use Node
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Update OAuth Provider Callback URLs

For each provider, update the callback URL to:
- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

### 4. Set Secure Cookies

NextAuth automatically uses secure cookies in production (HTTPS).

## Adding More Providers

To add more OAuth providers (Facebook, Discord, etc.):

1. **Install provider**
   ```bash
   npm install next-auth/providers
   ```

2. **Import and add to authConfig**
   ```typescript
   import FacebookProvider from "next-auth/providers/facebook";
   
   providers: [
     FacebookProvider({
       clientId: process.env.FACEBOOK_CLIENT_ID || "",
       clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
     }),
   ]
   ```

3. **Add environment variables**
   ```env
   FACEBOOK_CLIENT_ID=your-id
   FACEBOOK_CLIENT_SECRET=your-secret
   ```

4. **Update UI** (add button in LoginForm)

## Troubleshooting

### "Invalid callback URL"
- Ensure callback URL matches exactly in NextAuth config and provider settings
- Check localhost vs 127.0.0.1
- Verify port number (3000)

### "Missing required parameters"
- Check environment variables are set correctly
- Ensure `NEXTAUTH_SECRET` is defined
- Verify `NEXTAUTH_URL` matches your application URL

### "Redirect error" when signing in
- Clear browser cookies
- Check NEXTAUTH_URL is set
- Verify the provider credentials are correct
- Check that callback URL is registered with provider

### User not staying logged in
- Check that `NEXTAUTH_SECRET` is the same across restarts
- Verify cookies are being sent (check browser DevTools)
- Check session expiry in auth config (default: 30 days)

## Security Best Practices

1. **Never commit `.env.local`** - Add to `.gitignore`
2. **Use strong `NEXTAUTH_SECRET`** - Use openssl to generate
3. **Enable HTTPS in production** - Required for secure cookies
4. **Validate emails** - Especially for OAuth providers
5. **Implement email verification** - For credentials provider
6. **Use refresh tokens** - For sensitive operations
7. **Monitor auth logs** - Track suspicious login attempts

## Testing Different Providers

### Local Testing
Use the credentials provider with demo credentials:
- Email: `demo@example.com`
- Password: `password`

### OAuth Testing
1. Set up development app credentials with each provider
2. Use localhost callback URLs
3. Test before production deployment

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Set up GitHub OAuth credentials
3. ✅ Test all auth methods locally
4. ✅ Review middleware protection
5. ✅ Deploy to production with updated URLs
6. ✅ Monitor authentication logs
7. ✅ Consider adding email verification

## Files Modified

- `src/config/auth.config.ts` - Added Google & GitHub providers
- `src/middleware.ts` - Created route protection middleware
- `src/features/auth/components/LoginForm.tsx` - Added social login buttons
- `.env.local` - Added OAuth credentials

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Setup](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [NextAuth Providers](https://next-auth.js.org/providers/)
