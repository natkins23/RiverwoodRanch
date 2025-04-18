import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { RectangleEllipsis, Phone, Calendar, AlertCircle, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertContactSchema, } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Extended schema with validation
const contactFormSchema = insertContactSchema.extend({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});



type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const { toast } = useToast();
  
  // Contact form
  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      isPropertyOwner: false,
    },
  });
  
  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      contactForm.reset();
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully. We'll get back to you soon.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onContactSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#2C5E1A] pt-6">Contact Us</h2>
        <p className="text-center max-w-3xl mx-auto mb-12">
          Have questions about Riverwood Ranch? Our board members are here to help. Fill out the form below, and we'll get back to you as soon as possible.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Form {...contactForm}>
              <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={contactForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={contactForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name*</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={contactForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address*</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={contactForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Street address, City, State, ZIP" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="road_maintenance">Road Maintenance</SelectItem>
                          <SelectItem value="records">Documents & Records</SelectItem>
                          <SelectItem value="payments">Dues & Payments</SelectItem>
                          <SelectItem value="property">Property Inquiries</SelectItem>
                          <SelectItem value="board">Board Matters</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message*</FormLabel>
                      <FormControl>
                        <Textarea rows={6} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="isPropertyOwner"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I am a current property owner at Riverwood Ranch</FormLabel>
                        <p className="text-sm text-gray-500">
                          Please check this box if you own property within the ranch community.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={contactForm.control}
                  name="joinEmailChain"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Request to be added to community email chain</FormLabel>
                        <p className="text-sm text-gray-500">
                          Submit a request to join the community email chain for important updates and discussions
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-[#2C5E1A] hover:bg-[#4C8033]"
                  disabled={contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
          
          <div>
            <div className="bg-[#F5F5DC] p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-semibold mb-6 text-[#8B5A2B]">Get In Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-[#2C5E1A] bg-opacity-10 p-3 rounded-full mr-4">
                    <RectangleEllipsis className="text-[#2C5E1A]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Email</h4>
                    <p className="text-gray-600">board@riverwoodranch.org</p>
                    <p className="text-sm text-gray-500 mt-1">We aim to respond within 48 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#2C5E1A] bg-opacity-10 p-3 rounded-full mr-4">
                    <Phone className="text-[#2C5E1A]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Phone</h4>
                    <p className="text-gray-600">(888) 555-0123</p>
                    <p className="text-sm text-gray-500 mt-1">Monday-Friday, 9am-5pm PT</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#2C5E1A] bg-opacity-10 p-3 rounded-full mr-4">
                    <MapPin className="text-[#2C5E1A]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Mailing Address</h4>
                    <p className="text-gray-600">PO Box 12345</p>
                    <p className="text-sm text-gray-500 mt-1">Los Angeles, CA 90001</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-[#2C5E1A] bg-opacity-10 p-3 rounded-full mr-4">
                    <Calendar className="text-[#2C5E1A]" size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Board Meetings</h4>
                    <p className="text-gray-600">First Tuesday of every month</p>
                    <p className="text-sm text-gray-500 mt-1">7:00 PM at the Community Pavilion</p>
                  </div>
                </div>
                
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
