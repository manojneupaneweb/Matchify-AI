import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || 'missing_github_id',
      clientSecret: process.env.GITHUB_SECRET || 'missing_github_secret',
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      try {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
          // Store previous lastLoginAt and embed current tokenVersion
          user.lastLoginAt = existingUser.lastLoginAt?.toISOString() || null;
          user.tokenVersion = existingUser.tokenVersion ?? 0;
          await User.findOneAndUpdate(
            { email: user.email },
            { lastLoginAt: new Date() }
          );
        }
      } catch (err) {
        console.error('Error in signIn callback:', err);
      }
      return true;
    },
    async jwt({ token, user }) {
      // On initial sign-in: embed data from user object into token
      if (user) {
        token.lastLoginAt = user.lastLoginAt || null;
        token.tokenVersion = user.tokenVersion ?? 0;
        return token;
      }
      // On subsequent requests: validate tokenVersion against DB
      try {
        await dbConnect();
        const dbUser = await User.findOne({ email: token.email }).select('tokenVersion').lean();
        if (dbUser && dbUser.tokenVersion !== token.tokenVersion) {
          // Token has been invalidated by Logout All
          return { ...token, error: 'TokenInvalidated' };
        }
      } catch (err) {
        console.error('Error validating tokenVersion:', err);
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.error === 'TokenInvalidated') {
        session.error = 'TokenInvalidated';
        return session;
      }
      if (token) {
        session.user.id = token.sub;
        session.user.lastLoginAt = token.lastLoginAt || null;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
