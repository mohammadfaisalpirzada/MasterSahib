import NextAuth from 'next-auth/next';
import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { saveUserLogin } from '@/app/lib/contactMessages';

const googleDriveProvider = {
  ...GoogleProvider({
    clientId: process.env.AUTH_GOOGLE_ID || '',
    clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    authorization: { params: { scope: 'openid email profile https://www.googleapis.com/auth/drive', prompt: 'consent', access_type: 'offline' } },
  }),
  id: 'google-drive',
  name: 'Owner Google Drive',
};

const isAllowedHost = (hostname: string) =>
  hostname === 'themastersahib.com' ||
  hostname === 'www.themastersahib.com' ||
  hostname === 'ggssnishtarroad.themastersahib.com' ||
  hostname.endsWith('.themastersahib.com') ||
  hostname === 'localhost' ||
  hostname === '127.0.0.1';

export const authOptions: NextAuthOptions = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID || '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || '',
    }),
    googleDriveProvider,
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async signIn({ user }) {
      try {
        await saveUserLogin(user.name || '', user.email || '');
      } catch {
        // non-blocking — login still succeeds even if sheet write fails
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl || isAllowedHost(parsed.hostname.toLowerCase())) {
          return url;
        }
      } catch {
        // ignore invalid URL
      }
      return baseUrl;
    },
    async session({ session, token }) {
      (session as typeof session & { googleDriveAccessToken?: string }).googleDriveAccessToken =
        typeof token.googleDriveAccessToken === 'string' ? token.googleDriveAccessToken : undefined;
      return session;
    },
    async jwt({ token, account }) {
      if (account?.provider === 'google-drive' && account.access_token) {
        token.googleDriveAccessToken = account.access_token;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV !== 'production',
};

export default NextAuth(authOptions);
