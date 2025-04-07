import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, File, FileText, FileSpreadsheet, ClipboardList, MapPin, Calendar, Upload, ShieldCheck, Eye, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PasscodeLogin, { AccessLevel as LoginAccessLevel } from "@/components/PasscodeLogin";
import { useAccessLevel } from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DocumentUpload from "@/components/DocumentUpload";
import { Document } from "@shared/schema";
import ScrollToTop from "@/components/ScrollToTop";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function DocumentsPage() {
  // Use global access level context
  const { accessLevel, setAccessLevel } = useAccessLevel();
  const [activeTab, setActiveTab] = useState('all');
  
  // Only fetch documents when authenticated
  const { data: documents, isLoading, error } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
    enabled: accessLevel !== 'none',
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

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
          <Eye className="h-3 w-3" /> Public
        </Badge>;
      case 'protected':
        return <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
          <Lock className="h-3 w-3" /> Private
        </Badge>;
      case 'admin':
        return <Badge variant="outline" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
          <ShieldCheck className="h-3 w-3" /> Board
        </Badge>;
      default:
        return null;
    }
  };

  // Filter documents based on visibility and access level
  const getFilteredDocuments = () => {
    if (!documents) return [];
    
    let filtered = documents;
    
    // Filter by active tab if it's not 'all'
    if (activeTab !== 'all') {
      filtered = filtered.filter(doc => doc.visibility === activeTab);
    }
    
    // Filter by access level
    if (accessLevel === 'user') {
      // User can see public and protected docs
      return filtered.filter(doc => doc.visibility === 'public' || doc.visibility === 'protected');
    } else if (accessLevel === 'admin') {
      // Admin can see all docs
      return filtered;
    } else {
      // No access shows nothing (should not happen since query is disabled)
      return [];
    }
  };
  
  // Handle successful login with the determined access level
  const handleLoginSuccess = (level: LoginAccessLevel) => {
    setAccessLevel(level);
  };

  // If not authenticated, show login screen
  if (accessLevel === 'none') {
    return (
      <div className="bg-[#F5F5DC] min-h-screen">
        <Navbar />
        <main className="pt-16 md:pt-20">
          <section className="py-16 bg-[#F5F5DC] bg-opacity-50 min-h-screen">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold mb-8 text-center text-[#2C5E1A]">Ranch Documents</h2>
              <p className="text-center max-w-3xl mx-auto mb-8">
                This section contains all current documents for Riverwood Ranch.
              </p>
              
              <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden p-8">
                <h3 className="text-xl font-semibold text-center mb-6 text-[#2C5E1A]">Document Access</h3>
                <p className="text-sm text-gray-600 mb-8 text-center">
                  Please enter your passcode to access ranch documents.
                  <br /><br />
                  <span className="text-xs text-gray-500">
                    Property owners and board members have different access levels.
                  </span>
                </p>
                <PasscodeLogin onSuccess={handleLoginSuccess} />
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }
  
  // When authenticated, show documents
  return (
    <div className="bg-[#F5F5DC] min-h-screen">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="py-16 bg-[#F5F5DC] bg-opacity-50 min-h-screen">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#2C5E1A] mb-4 md:mb-0">Ranch Documents</h2>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2 bg-white">
                  {accessLevel === 'admin' ? 'Board Member Access' : 'Property Owner Access'}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setAccessLevel('none')}
                  className="text-[#2C5E1A] border-[#2C5E1A] hover:bg-[#F5F5DC]"
                >
                  Sign Out
                </Button>
              </div>
            </div>
            
            <p className="max-w-3xl mb-8 text-gray-700">
              Access important documents related to Riverwood Ranch. These resources provide guidelines, policies, and other essential information for property owners.
            </p>
            
            {/* Document visibility filter pills */}
            <div className="mb-6">
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 w-full max-w-md mx-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="public" className="flex gap-1 items-center justify-center">
                    <Eye className="h-3 w-3" /> Public
                  </TabsTrigger>
                  <TabsTrigger value="protected" className="flex gap-1 items-center justify-center">
                    <Lock className="h-3 w-3" /> Private
                  </TabsTrigger>
                  <TabsTrigger 
                    value="admin" 
                    className="flex gap-1 items-center justify-center"
                    disabled={accessLevel !== 'admin'}
                  >
                    <ShieldCheck className="h-3 w-3" /> Board
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                // Loading skeleton
                Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 p-6">
                    <div className="animate-pulse flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="rounded-full bg-gray-200 h-10 w-10 mr-3"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
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
              ) : getFilteredDocuments().length > 0 ? (
                getFilteredDocuments().map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          {getDocumentIcon(doc.type)}
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                        </div>
                        {getVisibilityBadge(doc.visibility)}
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
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500">
                    {activeTab !== 'all' 
                      ? `No ${activeTab} documents found.` 
                      : "No documents found."}
                    {accessLevel === 'admin' && " You can upload new documents using the button below."}
                  </p>
                </div>
              )}
            </div>
            
            {/* Upload Document Button and Modal - Only for admin */}
            {accessLevel === 'admin' && (
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
                        As a board member, you can upload new documents for the community.
                      </DialogDescription>
                    </DialogHeader>
                    <DocumentUpload accessLevel="admin" />
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}