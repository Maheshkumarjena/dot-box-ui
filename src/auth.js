
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
providers: [
    Google({
      clientId: "811424453906-9i43pt6th3r1l0s5ek7b3lflnvcr1rn0.apps.googleusercontent.com",
      clientSecret: "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",
    }),
    // ... other providers
  ],})