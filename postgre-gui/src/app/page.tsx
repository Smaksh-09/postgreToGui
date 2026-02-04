// app/page.tsx
import Image from "next/image";
import Hero from "../components/ui/Hero";
import Loop from "../components/ui/Loop";
import ThirdSection from "../components/ui/ThirdSection";

export default function Home() {
  return (
    <main className="relative w-full bg-midnight-950">
      
      {/* 1. min-h-screen ensures it covers the full viewport */}
      <section className="relative w-full min-h-screen">
        
        {/* BACKGROUND WRAPPER */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            // THE FIX: Change 80% -> 95%. 
            // This means the top 95% of your image stays 100% bright and untouched.
            // The fade only happens in the very last 5% of the container.
            maskImage: 'linear-gradient(to bottom, black 95%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 95%, transparent 100%)'
          }}
        >
          <Image
            src="/chat_img.png"
            alt=""
            fill
            className="object-cover"
            priority
          />
          
          {/* Keep your top shadow if you want text readability, otherwise remove it */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        </div>

        {/* CONTENT */}
        <div className="relative z-10 pt-20">
          <Hero />
        </div>

        {/* Loop Section */}
        <div className="relative z-10 mt-20 pb-20">
          <Loop />
        </div>

      </section>

      {/* The next section */}
      <ThirdSection />
    </main>
  );
}