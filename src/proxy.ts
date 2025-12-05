import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/"];

export default withAuth(
  function proxy(req: NextRequest) {
    // Token is verified by withAuth
    // This callback runs only for authenticated requests
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If token exists, user is authenticated
        if (token) return true;

        // Allow public routes without token
        const publicRoutes = ["/login", "/api/auth"];
        const isPublicRoute = publicRoutes.some((route) =>
          req.nextUrl.pathname.startsWith(route)
        );

        if (isPublicRoute) return true;

        // Redirect to login for protected routes without token
        return false;
      },
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Apply proxy to specific routes
export const config = {
  matcher: [
    // Protected routes
    "/",
    // API routes that need protection
    "/api/protected/:path*",
    // Exclude public routes
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
