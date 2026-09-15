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
// NOTE: /ggss-nishtar-road/admin/:path* (admin dashboard, admission form, takeover
// inventory) is intentionally NOT matched here. Those pages already enforce their
// own dedicated password login (see STAFF_ADMIN_SESSION_COOKIE / ADMISSION_FORM_SESSION_COOKIE).
// Matching them here used to let ANY signed-in Google account (not just the school
// admin) reach that password screen, which is unnecessary exposure — removed.
export const config = {
  matcher: [
    '/my-presentations/:path*',
    '/ggss-nishtar-road/staff-portal/:path*',
    '/ggss-nishtar-road/stipend/:path*',
    '/resume-builder/:path*',
    '/educational-resources/:path*',
    '/portfolio/:path*',
  ],
};
