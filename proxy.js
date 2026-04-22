import { withAuth } from "next-auth/middleware";

const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export default function middleware(req, event) {
  return authMiddleware(req, event);
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
