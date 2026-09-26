import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureOverview from "@/components/FeatureOverview";
import CrackDetection from "@/components/CrackDetection";
import DigitalTwin from "@/components/DigitalTwin";
import PredictiveMaintenance from "@/components/PredictiveMaintenance";
import Workflow from "@/components/Workflow";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureOverview />
      <CrackDetection />
      <DigitalTwin />
      <PredictiveMaintenance />
      <Workflow />
      <Footer />
    </main>
  );
}
