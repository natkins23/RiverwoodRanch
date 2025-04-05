import { useQuery } from "@tanstack/react-query";
import { Mail, ChevronRight } from "lucide-react";
import { BoardMember } from "@shared/schema";
import { Button } from "@/components/ui/button";

export default function Board() {
  const { data: boardMembers, isLoading, error } = useQuery<BoardMember[]>({
    queryKey: ['/api/board-members'],
  });

  return (
    <section id="board" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#2C5E1A]">Board Members</h2>
        <p className="text-center max-w-3xl mx-auto mb-12">
          Our dedicated board members oversee the management of Riverwood Ranch, ensuring the community's needs are met and the property is well-maintained.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array(5).fill(0).map((_, index) => (
              <div key={index} className="bg-[#F5F5DC] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-60 bg-gray-200 animate-pulse"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 mb-4 animate-pulse"></div>
                  <div className="border-t border-[#D2B48C] pt-4 flex justify-between items-center">
                    <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-10">
              <p className="text-red-500">Error loading board members. Please try again later.</p>
            </div>
          ) : boardMembers && boardMembers.length > 0 ? (
            boardMembers.map((member) => (
              <div key={member.id} className="bg-[#F5F5DC] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="h-60 overflow-hidden">
                  <img 
                    src={member.imageUrl} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#8B5A2B]">{member.name}</h3>
                  <p className="text-[#2C5E1A] font-medium mb-3">{member.position}</p>
                  <p className="text-sm mb-4">{member.bio}</p>
                  <div className="border-t border-[#D2B48C] pt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Property {member.propertyNumber}</span>
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-[#2C5E1A] hover:text-[#4C8033]"
                      aria-label={`Email ${member.name}`}
                    >
                      <Mail />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No board members information available.</p>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            className="inline-flex items-center bg-[#8B5A2B] hover:bg-opacity-90 text-white font-medium px-6 py-6 rounded-md transition-colors duration-300"
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Contact the Board <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
