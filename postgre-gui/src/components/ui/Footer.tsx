import Link from "next/link";
import { Github, Twitter, Disc } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505] pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-16">
          {/* Column 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-orange-500 to-red-600">
                <Disc className="h-4 w-4 text-white animate-[spin_8s_linear_infinite]" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Prism
              </span>
            </div>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/40">
              The intelligent visualization layer for your PostgreSQL database.
              Stop guessing, start seeing.
            </p>
            {/* Socials */}
            <div className="flex gap-4">
              <Link
                href="https://github.com"
                className="text-white/40 transition-colors hover:text-white"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://twitter.com"
                className="text-white/40 transition-colors hover:text-blue-400"
              >
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Column 2: Product */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-3 text-sm text-white/40">
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-orange-500"
                >
                  Visualizer
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-orange-500"
                >
                  AI Query
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-orange-500"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-orange-500"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Resources
            </h3>
            <ul className="space-y-3 text-sm text-white/40">
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Community
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  GitHub
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3 text-sm text-white/40">
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="transition-colors hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 md:flex-row">
          <p className="text-xs text-white/20">
            &copy; 2026 Prism Inc. All rights reserved.
          </p>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[10px] font-medium text-white/60">
              All Systems Normal
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
