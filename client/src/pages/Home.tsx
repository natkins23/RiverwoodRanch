import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Documents from "@/components/Documents";
import Board from "@/components/Board";
import Properties from "@/components/Properties";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-[#F5F5DC] min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Documents />
        <Board />
        <Properties />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
