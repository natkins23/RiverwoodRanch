import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { BoardMember } from "@shared/schema";

export default function Board() {
  const { data: boardMembers, isLoading, error } = useQuery<BoardMember[]>({
    queryKey: ['/api/board-members'],
  });

  return (
    <section id="board" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#2C5E1A]">Board Members</h2>
        <p className="text-center max-w-3xl mx-auto mb-12">
          Our dedicated board members oversee the management of Riverwood Ranch, ensuring the community's needs are met. 
          Feelk free to reach out to them for any inquiries or concerns at board@riverwoodranch.org
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {isLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-[#F5F5DC] rounded-lg p-6 shadow-md">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-10">
              <p className="text-red-500">Error loading board members. Please try again later.</p>
            </div>
          ) : boardMembers && boardMembers.length > 0 ? (
            boardMembers.map((member) => (
              <div key={member.id} className="bg-[#F5F5DC] rounded-lg p-6 shadow-md flex flex-col items-center">
                <h3 className="text-xl font-bold text-[#8B5A2B]">{member.name}</h3>
                <p className="text-[#2C5E1A]  items-center font-medium mb-3">{member.position}</p>
                <div className="space-y-2">
                
                 
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-10">
              <p className="text-gray-500">No board members information available.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}