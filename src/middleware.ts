import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    /*
     * Protect dashboard routes only.
     * Public: /, /login, /signup, /admin/login, /api/*, static assets, /uploads/*
     */
    '/dashboard/:path*',
  ],
};
