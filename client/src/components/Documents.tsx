import { useQuery } from "@tanstack/react-query";
import { ArrowRight, File, FileText, FileSpreadsheet, ClipboardList, MapPin, Calendar, Upload } from "lucide-react";
import DocumentUpload from "./DocumentUpload";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as React from "react";
import { Document } from "@shared/schema";

export default function Documents() {
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'agreement':
      case 'bylaw':
        return <FileText className="text-[#8B5A2B] mr-3" size={24} />;
      case 'financial':
        return <FileSpreadsheet className="text-[#8B5A2B] mr-3" size={24} />;
      case 'minutes':
        return <ClipboardList className="text-[#8B5A2B] mr-3" size={24} />;
      case 'map':
        return <MapPin className="text-[#8B5A2B] mr-3" size={24} />;
      case 'schedule':
        return <Calendar className="text-[#8B5A2B] mr-3" size={24} />;
      default:
        return <File className="text-[#8B5A2B] mr-3" size={24} />;
    }
  };

  return (
    <section id="documents" className="py-16 bg-[#F5F5DC] bg-opacity-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center text-[#2C5E1A]">Ranch Documents</h2>
        <p className="text-center max-w-3xl mx-auto mb-12">
          Access important documents related to Riverwood Ranch. These resources provide guidelines, policies, and other essential information for property owners.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeleton
            Array(6).fill(0).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-6">
                <div className="animate-pulse flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-3 text-center py-10">
              <p className="text-red-500">Error loading documents. Please try again later.</p>
            </div>
          ) : documents && documents.length > 0 ? (
            documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {getDocumentIcon(doc.type)}
                    <h3 className="font-semibold text-lg">{doc.title}</h3>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">{doc.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(doc.uploadDate).toLocaleDateString()}
                    </span>
                    <a 
                      href={doc.fileContent}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2C5E1A] hover:text-[#4C8033] font-medium text-sm flex items-center"
                    >
                      View Document <ArrowRight className="ml-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // Placeholder documents if no documents exist yet
            <>
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="text-[#8B5A2B] mr-3" size={24} />
                    <h3 className="font-semibold text-lg">Road Maintenance Agreement</h3>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">Details the responsibilities and cost-sharing arrangements for maintaining the shared roadways within Riverwood Ranch.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Updated: Jan 15, 2023</span>
                    <span className="text-[#2C5E1A] hover:text-[#4C8033] font-medium text-sm flex items-center">
                      No Document Available
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FileText className="text-[#8B5A2B] mr-3" size={24} />
                    <h3 className="font-semibold text-lg">Corporation Bylaws</h3>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">Official bylaws governing the operation of the Riverwood Ranch Corporation, including decision-making processes.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Updated: Mar 22, 2022</span>
                    <span className="text-[#2C5E1A] hover:text-[#4C8033] font-medium text-sm flex items-center">
                      No Document Available
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <FileSpreadsheet className="text-[#8B5A2B] mr-3" size={24} />
                    <h3 className="font-semibold text-lg">Annual Budget</h3>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">Current fiscal year budget detailing planned expenditures for road maintenance and other community projects.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Updated: Oct 5, 2023</span>
                    <span className="text-[#2C5E1A] hover:text-[#4C8033] font-medium text-sm flex items-center">
                      No Document Available
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <ClipboardList className="text-[#8B5A2B] mr-3" size={24} />
                    <h3 className="font-semibold text-lg">Meeting Minutes</h3>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">Records of board meetings, decisions made, and community discussions.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Updated: Dec 1, 2023</span>
                    <span className="text-[#2C5E1A] hover:text-[#4C8033] font-medium text-sm flex items-center">
                      No Document Available
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <MapPin className="text-[#8B5A2B] mr-3" size={24} />
                    <h3 className="font-semibold text-lg">Property Maps</h3>
                  </div>
                  <p className="text-sm mb-4 text-gray-600">Detailed maps showing property boundaries, roads, and common areas.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Updated: Nov 15, 2023</span>
                    <span className="text-[#2C5E1A] hover:text-[#4C8033] font-medium text-sm flex items-center">
                      No Document Available
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Upload Document Button and Modal */}
        <div className="mt-12 text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-[#2C5E1A] hover:bg-[#4C8033] text-white">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-[#2C5E1A]">Upload New Document</DialogTitle>
                <DialogDescription>
                  Board members can upload new documents for the community. All uploads require administrative approval.
                </DialogDescription>
              </DialogHeader>
              <DocumentUpload />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </section>
  );
}
