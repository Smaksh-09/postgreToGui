import type { Metadata } from "next";
import { Inter } from "next/font/google"; // or your font
import "./globals.css";
import NextAuthSessionProvider from "../components/providers/SessionProvider";
import NavbarGate from "../components/ui/NavbarGate";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prism | The Database Interface",
  description: "Visualize your data instantly.",
  icons: {
    icon: "/logo_img.png",
    shortcut: "/logo_img.png",
    apple: "/logo_img.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-midnight-950 text-white antialiased`}>
        {/* Wrap everything in the Session Provider */}
        <NextAuthSessionProvider>
          <NavbarGate />
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}