import ConnectForm from "../../components/Dashboard/ConnectionForm";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-midnight-950 px-4 relative overflow-hidden">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-orange-500/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full">
        
        {/* Welcome Message */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {session ? `Welcome back, ${session.user?.name}` : "Enter the Matrix"}
          </h1>
          <p className="text-white/40 mt-2">
            {session 
              ? "Select a saved database or connect a new one." 
              : "Read-only access. No data stored."}
          </p>
        </div>

        {/* The Form */}
        <ConnectForm />
        
      </div>
    </main>
  );
}