import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, FileText, Newspaper, ArrowRight, Users, Edit, Plus, Trash, Mail, Phone } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { useAccessLevel } from "@/components/Navbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { getBaseApiUrl } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createEvent, getEvents, type Event } from "@/services/firebase";
import { BoardMember } from "@shared/schema";

export default function RanchPortal() {
  const { accessLevel } = useAccessLevel();
  const [location, setLocation] = useLocation();
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Omit<Event, "id" | "createdAt">>({
    title: "",
    date: "",
    time: "",
    location: "",
    description: ""
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (accessLevel === "none") {
      setLocation("/");
    }
  }, [accessLevel, setLocation]);

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: getEvents,
    enabled: accessLevel !== "none",
  });

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["/api/blog"],
    enabled: accessLevel !== "none",
  });

  const { data: boardMembers, isLoading: boardLoading } = useQuery<BoardMember[]>({
    queryKey: ['/api/board-members'],
    enabled: accessLevel !== "none",
  });

  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      setIsAddEventOpen(false);
      setNewEvent({
        title: "",
        date: "",
        time: "",
        location: "",
        description: ""
      });
    },
  });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    createEventMutation.mutate(newEvent);
  };

  if (accessLevel === "none") {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5DC]">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-20">
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-[#2C5E1A] mb-4">
                Ranch Portal
              </h1>
              <p className="text-gray-600">
                Welcome to your member dashboard. Here you can access all ranch resources and information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Events Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-6 w-6 text-[#2C5E1A] mr-3" />
                    <h2 className="text-xl font-semibold">Upcoming Events</h2>
                  </div>
                  {accessLevel === "admin" && (
                    <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-[#2C5E1A] hover:bg-[#4C8033] text-white"
                        >
                          <Calendar className="mr-2 h-4 w-4" /> Add Event
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Event</DialogTitle>
                          <DialogDescription>
                            Fill in the details for the new event.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateEvent}>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="title">Event Title</Label>
                              <Input 
                                id="title" 
                                placeholder="Enter event title"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="date">Date</Label>
                              <Input 
                                id="date" 
                                type="date"
                                value={newEvent.date}
                                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="time">Time</Label>
                              <Input 
                                id="time" 
                                type="time"
                                value={newEvent.time}
                                onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="location">Location</Label>
                              <Input 
                                id="location" 
                                placeholder="Enter event location"
                                value={newEvent.location}
                                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea 
                                id="description" 
                                placeholder="Enter event description"
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                                required
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button 
                              type="button"
                              variant="outline" 
                              onClick={() => setIsAddEventOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="button"
                              className="bg-[#2C5E1A] hover:bg-[#4C8033]"
                              onClick={() => setIsAddEventOpen(false)}
                            >
                              Create Event
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="min-h-[200px]">
                  {eventsLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : events?.length > 0 ? (
                    <div className="space-y-4">
                      {events.slice(0, 3).map((event) => (
                        <div key={event.id} className="border-b pb-4 last:border-0">
                          <h3 className="font-medium">{event.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full min-h-[200px] flex items-center justify-center">
                      <p className="text-gray-500">No upcoming events</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Blog Section */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Newspaper className="h-6 w-6 text-[#2C5E1A] mr-3" />
                    <h2 className="text-xl font-semibold">Latest Posts</h2>
                  </div>
                  {accessLevel === "admin" && (
                    <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="bg-[#2C5E1A] hover:bg-[#4C8033] text-white"
                        >
                          <Newspaper className="mr-2 h-4 w-4" /> New Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Post</DialogTitle>
                          <DialogDescription>
                            Write a new blog post for the ranch community.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="post-title">Title</Label>
                            <Input id="post-title" placeholder="Enter post title" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="post-content">Content</Label>
                            <Textarea id="post-content" placeholder="Write your post content" className="min-h-[200px]" />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                            Cancel
                          </Button>
                          <Button className="bg-[#2C5E1A] hover:bg-[#4C8033]">
                            Publish Post
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="min-h-[200px]">
                  {postsLoading ? (
                    <div className="space-y-4">
                      {Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : posts?.length > 0 ? (
                    <div className="space-y-4">
                      {posts.slice(0, 3).map((post) => (
                        <div key={post.id} className="border-b pb-4 last:border-0">
                          <h3 className="font-medium">{post.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(post.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">{post.excerpt}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full min-h-[200px] flex items-center justify-center">
                      <p className="text-gray-500">No blog posts available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Board Members Section */}
              <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-[#2C5E1A] mr-3" />
                    <h2 className="text-xl font-semibold">Board Members</h2>
                  </div>
                  {accessLevel === 'admin' && (
                    <Dialog open={isEditBoardOpen} onOpenChange={setIsEditBoardOpen}>
                      <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          Edit Members
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Edit Board Members</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {boardMembers?.map((member) => (
                            <div key={member.id} className="p-4 border rounded-lg space-y-2">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">Board Member</h3>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    const updatedMembers = boardMembers.filter(m => m.id !== member.id);
                                    queryClient.setQueryData(['/api/board-members'], updatedMembers);
                                  }}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                              <Input
                                placeholder="Name"
                                value={member.name}
                                onChange={(e) => {
                                  const updatedMembers = boardMembers.map(m =>
                                    m.id === member.id ? { ...m, name: e.target.value } : m
                                  );
                                  queryClient.setQueryData(['/api/board-members'], updatedMembers);
                                }}
                              />
                              <Input
                                placeholder="Position"
                                value={member.position}
                                onChange={(e) => {
                                  const updatedMembers = boardMembers.map(m =>
                                    m.id === member.id ? { ...m, position: e.target.value } : m
                                  );
                                  queryClient.setQueryData(['/api/board-members'], updatedMembers);
                                }}
                              />
                              <Input
                                placeholder="Email"
                                value={member.email}
                                onChange={(e) => {
                                  const updatedMembers = boardMembers.map(m =>
                                    m.id === member.id ? { ...m, email: e.target.value } : m
                                  );
                                  queryClient.setQueryData(['/api/board-members'], updatedMembers);
                                }}
                              />
                              <Input
                                placeholder="Phone"
                                value={member.phone}
                                onChange={(e) => {
                                  const updatedMembers = boardMembers.map(m =>
                                    m.id === member.id ? { ...m, phone: e.target.value } : m
                                  );
                                  queryClient.setQueryData(['/api/board-members'], updatedMembers);
                                }}
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            className="w-full flex items-center gap-2"
                            onClick={() => {
                              const newMember = {
                                id: Date.now(),
                                name: "",
                                position: "",
                                email: "",
                                phone: ""
                              };
                              queryClient.setQueryData(['/api/board-members'], 
                                (old: BoardMember[] | undefined) => [...(old || []), newMember]
                              );
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add Board Member
                          </Button>
                          <div className="flex justify-end gap-2 mt-4">
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={async () => {
                              try {
                                const baseApiUrl = getBaseApiUrl();
                                await fetch(`${baseApiUrl}/api/board-members`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(boardMembers)
                                });
                                queryClient.invalidateQueries({ queryKey: ['/api/board-members'] });
                                setIsEditBoardOpen(false);
                              } catch (error) {
                                console.error('Failed to save board members:', error);
                              }
                            }}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <p className="text-gray-600 mb-6">
                  Our dedicated board members oversee the management of Riverwood Ranch, ensuring the community's needs are met. 
                  Feel free to reach out to them for any inquiries or concerns at board@riverwoodranch.org
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {boardLoading ? (
                    Array(3).fill(0).map((_, index) => (
                      <div key={index} className="bg-[#F5F5DC] rounded-lg p-6 shadow-md">
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      </div>
                    ))
                  ) : boardMembers && boardMembers.length > 0 ? (
                    boardMembers.map((member) => (
                      <div key={member.id} className="bg-[#F5F5DC] rounded-lg p-6 shadow-md flex flex-col items-center">
                        <h3 className="text-xl font-bold text-[#8B5A2B]">{member.name}</h3>
                        <p className="text-[#2C5E1A] items-center font-medium mb-3">{member.position}</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 text-center py-10">
                      <p className="text-gray-500">No board members information available.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-[#2C5E1A] mr-3" />
                    <h2 className="text-xl font-semibold">Documents</h2>
                  </div>
                  <Button
                    className="bg-[#2C5E1A] hover:bg-[#4C8033] text-white"
                    onClick={() => setLocation("/records")}
                  >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Meeting Minutes</h3>
                    <p className="text-sm text-gray-600">Latest board meeting minutes</p>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Financial Reports</h3>
                    <p className="text-sm text-gray-600">Quarterly financial updates</p>
                  </div>
                  <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <h3 className="font-medium">Community Guidelines</h3>
                    <p className="text-sm text-gray-600">Ranch rules and regulations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}