
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone, Edit, Plus, Trash } from "lucide-react";
import { BoardMember } from "@shared/schema";
import { useAccessLevel } from "./Navbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { Input } from "./ui/input";

export default function Board() {
  const { data: boardMembers, isLoading, error } = useQuery<BoardMember[]>({
    queryKey: ['/api/board-members'],
  });

  const { accessLevel } = useAccessLevel();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMembers, setEditingMembers] = useState<BoardMember[]>([]);

  const handleEdit = () => {
    setEditingMembers(boardMembers || []);
    setIsEditModalOpen(true);
  };

  const handleAddMember = () => {
    setEditingMembers([...editingMembers, {
      id: Date.now(),
      name: "",
      position: "",
      email: "",
      phone: ""
    }]);
  };

  const handleRemoveMember = (id: number) => {
    setEditingMembers(editingMembers.filter(member => member.id !== id));
  };

  const handleMemberChange = (id: number, field: keyof BoardMember, value: string) => {
    setEditingMembers(members => 
      members.map(member => 
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/board-members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMembers)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update board members');
      }
      
      // Update the local cache with new data
      queryClient.setQueryData(['/api/board-members'], editingMembers);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to save board members:', error);
    }
  };

  return (
    <section id="board" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#2C5E1A]">Board Members</h2>
          {accessLevel === 'admin' && (
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                  Edit Board
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Board Members</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {editingMembers.map((member) => (
                    <div key={member.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <h3 className="font-semibold">Board Member</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Name"
                        value={member.name}
                        onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="Position"
                        value={member.position}
                        onChange={(e) => handleMemberChange(member.id, 'position', e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={member.email}
                        onChange={(e) => handleMemberChange(member.id, 'email', e.target.value)}
                      />
                      <Input
                        placeholder="Phone"
                        value={member.phone}
                        onChange={(e) => handleMemberChange(member.id, 'phone', e.target.value)}
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    onClick={handleAddMember}
                  >
                    <Plus className="h-4 w-4" />
                    Add Board Member
                  </Button>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <p className="text-center max-w-3xl mx-auto mb-12">
          Our dedicated board members oversee the management of Riverwood Ranch, ensuring the community's needs are met. 
          Feel free to reach out to them for any inquiries or concerns at board@riverwoodranch.org
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
                <p className="text-[#2C5E1A] items-center font-medium mb-3">{member.position}</p>
                <div className="space-y-2 flex flex-col items-center">
                  <a href={`mailto:${member.email}`} className="flex items-center text-[#2C5E1A] hover:text-[#4C8033]">
                    <Mail className="h-4 w-4 mr-1" />
                    {member.email}
                  </a>
                  <span className="flex items-center text-[#2C5E1A]">
                    <Phone className="h-4 w-4 mr-1" />
                    {member.phone}
                  </span>
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
