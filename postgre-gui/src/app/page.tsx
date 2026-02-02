import Image from "next/image";
import Hero from "../components/ui/Hero";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <Image
        src="/chat_img.png"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />
      <Hero />
    </main>
  );
}