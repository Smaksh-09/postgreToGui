// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

  ],
  session: {
    strategy: "jwt", // Easier for middleware & serverless
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Add the User ID to the session object so we can use it in APIs
        //@ts-ignore
        session.user.id = token.sub;
      }
      return session;
    },
  },
  // Ensure we can use our custom "Magma" login page later if we want
  pages: {
    signIn: '/login', 
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };