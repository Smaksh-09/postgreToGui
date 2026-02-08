"use client";

import { usePathname } from "next/navigation";
import FloatingNavbar from "./navbar";

const hiddenPrefixes = ["/dashboard"];

export default function NavbarGate() {
  const pathname = usePathname();
  const shouldHide = hiddenPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) {
    return null;
  }

  return <FloatingNavbar />;
}
