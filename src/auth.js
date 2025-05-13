import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
console.log(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET);

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    }),
    // ... other providers
  ],
 callbacks: {
  async redirect({ url, baseUrl }) {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://dot-box-ui.vercel.app';
  },
  async signIn({ account, profile, user, credentials }) {
    return true;
  },
},
});