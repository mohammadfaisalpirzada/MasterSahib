import { withAuth } from 'next-auth/middleware';

export default withAuth(
  {
    pages: {
      signIn: '/auth/signin',
    },
    secret: process.env.AUTH_SECRET,
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Public route intentionally left out: /contact
export const config = {
  matcher: [
    '/my-presentations/:path*',
    '/ggss-nishtar-road/staff-portal/:path*',
    '/ggss-nishtar-road/admin/:path*',
    '/ggss-nishtar-road/stipend/:path*',
    '/resume-builder/:path*',
    '/educational-resources/:path*',
    '/portfolio/:path*',
  ],
};
