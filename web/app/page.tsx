import ShaderBackground from "./components/ShaderBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PipelineShowcase from "./components/PipelineShowcase";
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
        <main className="flex-1">
          <Hero />
          <PipelineShowcase />
          <GuardrailsSection />
          <LeakRadarSection />
          <ArchitectureSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}

