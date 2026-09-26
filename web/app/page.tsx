import Link from "next/link";
import Image from "next/image";
import ShaderBackground from "./components/ShaderBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import GuardrailsSection from "./components/GuardrailsSection";
import LeakRadarSection from "./components/LeakRadarSection";
import ArchitectureSection from "./components/ArchitectureSection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#050506] overflow-hidden text-[#EDEDEF] selection:bg-[#5E6AD2]/30 selection:text-white">
      {/* Dynamic Interactive Perspective Grid & Particles Shader Canvas */}
      <ShaderBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <div className="w-full border-b border-white/[0.06] py-6 flex items-center justify-center">
          <Link
            href="https://www.swytchcode.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 opacity-90 hover:opacity-100 transition-opacity"
          >
            <span className="text-xs text-[#8A8F98]">Powered by</span>
            <Image
              src="/swytchcode-logo.png"
              alt="Swytchcode"
              width={2173}
              height={535}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>
        <main className="flex-1">
          <Hero />
          <GuardrailsSection />
          <LeakRadarSection />
          <ArchitectureSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

