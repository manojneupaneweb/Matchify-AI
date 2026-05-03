import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import dbConnect from './mongodb';
import User from '../models/User';

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
        } else {
          // Initialize for new users if they aren't in DB yet
          user.tokenVersion = 0;
        }
      } catch (err) {
        console.error('Error in signIn callback:', err);
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        console.log('JWT Initial Sign-in:', user.email);
        token.lastLoginAt = user.lastLoginAt || null;
        token.tokenVersion = user.tokenVersion ?? 0;
        return token;
      }
      
      if (token?.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email }).select('tokenVersion').lean();
          const dbVersion = dbUser?.tokenVersion ?? 0;
          const tokenVersion = token.tokenVersion ?? 0;
          
          if (dbVersion !== tokenVersion) {
            console.log(`JWT Token Invalidated for ${token.email}: DB=${dbVersion}, Token=${tokenVersion}`);
            return { ...token, error: 'TokenInvalidated' };
          }
        } catch (err) {
          console.error('JWT Validation Error:', err);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback:', session.user?.email, 'Error:', token?.error);
      if (token?.error === 'TokenInvalidated') {
        session.error = 'TokenInvalidated';
        return session;
      }
      if (token) {
        session.user.id = token.sub;
        session.user.lastLoginAt = token.lastLoginAt || null;
        session.user.tokenVersion = token.tokenVersion;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
};
