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
    '/peace-quiz/:path*',
    '/ggss-nishtar-road/staff-portal/:path*',
    '/ggss-nishtar-road/admin/:path*',
    '/ggss-nishtar-road/stipend/:path*',
    '/resume-builder/:path*',
    '/teaching-tools/:path*',
    '/portfolio/:path*',
    '/student/:path*',
    '/teacher/:path*',
    '/admin/:path*',
    '/quiz-score/:path*',
  ],
};
