import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section 
      id="home" 
      className="relative bg-center bg-cover h-[500px] flex items-center" 
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80')" }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="container mx-auto px-6 relative z-10 text-white">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Welcome to Riverwood Ranch</h2>
          <p className="text-lg md:text-xl mb-8">
            A serene community nestled in the heart of Southern California, Los Angeles
          </p>
          <Button 
            variant="default" 
            className="bg-[#2C5E1A] hover:bg-[#4C8033] text-white px-6 py-6 rounded-md transition-colors duration-300 font-medium"
            onClick={() => scrollToElement('about')}
          >
            Learn More <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
