"use client";
import Image from "next/image";

type LogoItem =
  | { type: "image"; src: string; alt: string; width: number; height: number }
  | { type: "text"; label: string };

const logos: LogoItem[] = [
  { type: "image", src: "/postgresql.png", alt: "PostgreSQL", width: 140, height: 40 }, // Slightly reduced size
  { type: "image", src: "/mysql.png", alt: "MySQL", width: 140, height: 40 },
  { type: "image", src: "/supabase.png", alt: "Supabase", width: 140, height: 40 },
  { type: "image", src: "/neon.png", alt: "Neon", width: 140, height: 40 },
  { type: "image", src: "/cockroachdb.png", alt: "CockroachDB", width: 180, height: 48 },
];

interface LoopProps {
  className?: string;
}

export default function Loop({ className = "" }: LoopProps) {
  return (
    <section 
      className={`relative w-full overflow-hidden ${className}`}
      // THE FIX: Use a CSS mask instead of black gradient divs. 
      // This fades the content to transparent, letting the magma background show through perfectly.
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
      }}
    >
      {/* REMOVED: The two gradient divs that were causing the "black corners" */}

      {/* Girth Fix: Reduced py-8 to py-5 (slimmer vertical profile) */}
      <div className="flex select-none gap-12 py-5">
        {/* LIST 1 */}
        <div className="flex min-w-full shrink-0 items-center justify-around gap-12 animate-infinite-scroll">
          {logos.map((logo, index) => (
            <LogoItem key={`a-${index}`} logo={logo} />
          ))}
        </div>

        {/* LIST 2 */}
        <div className="flex min-w-full shrink-0 items-center justify-around gap-12 animate-infinite-scroll" aria-hidden="true">
          {logos.map((logo, index) => (
            <LogoItem key={`b-${index}`} logo={logo} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 30s linear infinite; /* Slowed down slightly for elegance */
        }
      `}</style>
    </section>
  );
}

function LogoItem({ logo }: { logo: LogoItem }) {
  return (
    <div className="group flex items-center justify-center">
      {logo.type === "image" ? (
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width}
          height={logo.height}
          className="opacity-50 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]"
        />
      ) : (
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40 transition duration-300 group-hover:text-orange-400">
          {logo.label}
        </span>
      )}
      
    </div>
  );
}