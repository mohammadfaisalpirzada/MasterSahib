import NextAuth from 'next-auth/next';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  debug: process.env.NODE_ENV !== 'production',
};

export default NextAuth(authOptions);
