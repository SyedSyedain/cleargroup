import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// NextAuth catch-all route — handles all /api/auth/* requests automatically
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
