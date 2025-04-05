import { 
  Home, 
  SquareEqual, 
  Network, 
  MapPin, 
  Shield, 
  Users, 
  Leaf, 
  TrafficCone 
} from "lucide-react";

export default function About() {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-6 text-[#2C5E1A]">About Riverwood Ranch</h2>
            <p className="mb-4">
              Riverwood Ranch is a private community corporation established to maintain the easement of roads serving 36 properties in Southern California. Located in the beautiful landscape of Los Angeles County, our ranch combines the tranquility of nature with the convenience of city proximity.
            </p>
            
            <p className="mb-4">
              Our corporation is dedicated to preserving the natural beauty of our surroundings while ensuring that all property owners have safe, well-maintained road access to their homes.
            </p>
            
            <p className="mb-6">
              Established in 1985, Riverwood Ranch has grown into a thriving community that values cooperation, sustainability, and responsible land management.
            </p>
            
            <div className="bg-[#F5F5DC] p-5 rounded-lg border border-[#D2B48C]">
              <h3 className="text-xl font-semibold mb-3 text-[#8B5A2B]">Our Mission</h3>
              <p>
                To maintain and improve the shared roadways and common areas of Riverwood Ranch, ensuring safe access for all property owners while preserving the natural environment and fostering a sense of community.
              </p>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="rounded-lg overflow-hidden shadow-lg h-80 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80" 
                alt="Aerial view of Riverwood Ranch" 
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#2C5E1A] bg-opacity-10 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <SquareEqual className="text-[#2C5E1A] mr-3" size={20} />
                  <h4 className="font-semibold">Dues Collection</h4>
                </div>
                <p className="text-sm">Efficient management of community dues to fund essential maintenance and security operations.</p>
              </div>
              
              <div className="bg-[#2C5E1A] bg-opacity-10 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <TrafficCone className="text-[#2C5E1A] mr-3" size={20} />
                  <h4 className="font-semibold">Road Maintenance</h4>
                </div>
                <p className="text-sm">Regular upkeep and improvement of all shared roadways within the ranch property.</p>
              </div>
              
              <div className="bg-[#2C5E1A] bg-opacity-10 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <Shield className="text-[#2C5E1A] mr-3" size={20} />
                  <h4 className="font-semibold">Community Security</h4>
                </div>
                <p className="text-sm">Coordinated security measures to ensure the safety of all residents and properties.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
