import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // <--- Import the named export using curly braces

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };