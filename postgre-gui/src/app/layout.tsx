import type { Metadata } from "next";
import { Inter } from "next/font/google"; // or your font
import "./globals.css";
import NextAuthSessionProvider from "../components/providers/SessionProvider";
import FloatingNavbar from "../components/ui/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prism | The Database Interface",
  description: "Visualize your data instantly.",
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
          <FloatingNavbar />
          {children}
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}