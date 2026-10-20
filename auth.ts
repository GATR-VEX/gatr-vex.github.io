import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAllowedMember } from "@/lib/members";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.email || !isAllowedMember(user.email)) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id ?? user.email ?? token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
      }
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      if (path.startsWith("/members") || path.startsWith("/api/prints")) {
        return !!auth?.user;
      }
      return true;
    },
  },
  trustHost: true,
});
