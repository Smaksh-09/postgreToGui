import type { Metadata } from "next";
import DashboardNav from "../../components/ui/DashboardNav";
import MobileBlocker from "../../components/Dashboard/Mobileblocker";

export const metadata: Metadata = {
  title: "Prism | Console",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-midnight-950 text-white selection:bg-orange-500/30">
      {/* Background Ambience (Subtle Global Glow) */}
      <div className="pointer-events-none absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-[120px]" />
      <MobileBlocker />
      <DashboardNav />
      {children}
    </div>
  );
}