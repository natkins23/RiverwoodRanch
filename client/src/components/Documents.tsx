import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import {
  File,
  FileText,
  FileSpreadsheet,
  ClipboardList,
  MapPin,
  Calendar,
  Upload,
  ShieldCheck,
  Eye,
  Lock,
  Trash2,
  Archive,
  Download,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PasscodeLogin, {
  AccessLevel as LoginAccessLevel,
} from "@/components/PasscodeLogin";
import { useAccessLevel } from "@/components/Navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/DocumentUpload";
import { Document } from "@shared/schema";
import ScrollToTop from "@/components/ScrollToTop";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useDocumentArchive, useDocumentDelete } from "@/hooks/use-documents";

export default function Documents() {
  const { accessLevel, setAccessLevel } = useAccessLevel();
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { toast } = useToast();

  // Mutations for archive and delete
  const archiveMutation = useDocumentArchive();
  const deleteMutation = useDocumentDelete();

  const {
    data: records,
    isLoading,
    error,
  } = useQuery<Document[]>({
    queryKey: ["/api/records"],
    enabled: true, // Always fetch records
  });

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "agreement":
      case "bylaw":
        return <FileText className="text-[#8B5A2B] mr-3" size={24} />;
      case "financial":
        return <FileSpreadsheet className="text-[#8B5A2B] mr-3" size={24} />;
      case "minutes":
        return <ClipboardList className="text-[#8B5A2B] mr-3" size={24} />;
      case "map":
        return <MapPin className="text-[#8B5A2B] mr-3" size={24} />;
      case "schedule":
        return <Calendar className="text-[#8B5A2B] mr-3" size={24} />;
      default:
        return <File className="text-[#8B5A2B] mr-3" size={24} />;
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case "public":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
          >
            <Eye className="h-3 w-3" /> Public
          </Badge>
        );
      case "protected":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200"
          >
            <Lock className="h-3 w-3" /> Private
          </Badge>
        );
      case "admin":
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200"
          >
            <ShieldCheck className="h-3 w-3" /> Board
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleArchiveToggle = async (doc: Document) => {
    try {
      await archiveMutation.mutateAsync({
        id: doc.id,
        archived: !doc.archived,
      });

      toast({
        title: doc.archived ? "Document Restored" : "Document Archived",
        description: `"${doc.title}" has been ${doc.archived ? "restored" : "archived"}.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling archive status:", error);
      toast({
        title: "Action Failed",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      // Optimistically update UI by filtering out the deleted record
      if (records) {
        const updatedRecords = records.filter((doc) => doc.id !== id);
        // Update the local cache immediately for a responsive UI
        queryClient.setQueryData(["/api/records"], updatedRecords);
      }

      // Then actually delete it on the server
      await deleteMutation.mutateAsync(id);

      toast({
        title: "Record Deleted",
        description: "The record has been permanently deleted.",
        variant: "default",
      });

      setDocumentToDelete(null);
    } catch (error) {
      console.error("Error deleting record:", error);
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the record.",
        variant: "destructive",
      });

      // Refresh the records in case of failure
      queryClient.invalidateQueries({ queryKey: ["/api/records"] });
    }
  };

  const renderDocActions = (doc: Document) => (
    <div className="flex space-x-3">
      <a
        href={doc.fileContent}
        download
        target="_blank"
        rel="noopener noreferrer"
      >
        <Download className="w-4 h-4 text-gray-500 hover:text-[#2C5E1A]" />
      </a>
      <a href={doc.fileContent} target="_blank" rel="noopener noreferrer">
        <ExternalLink className="w-4 h-4 text-gray-500 hover:text-[#2C5E1A]" />
      </a>
      {accessLevel === "admin" && (
        <>
          <button
            title={doc.archived ? "Restore" : "Archive"}
            onClick={() => handleArchiveToggle(doc)}
            disabled={archiveMutation.isPending}
          >
            {doc.archived ? (
              <RefreshCw className="w-4 h-4 text-green-600 hover:text-green-700" />
            ) : (
              <Archive className="w-4 h-4 text-blue-600 hover:text-blue-700" />
            )}
          </button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button title="Delete">
                <Trash2 className="w-4 h-4 text-red-600 hover:text-red-700" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete the document{" "}
                  <strong>{doc.title}</strong>. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(doc.id)}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {deleteMutation.isPending ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );

  const getFilteredDocuments = () => {
    if (!records) return [];

    let filtered = records;

    // Filter by visibility tab
    if (activeTab !== "all") {
      filtered = filtered.filter((doc) => doc.visibility === activeTab);
    }

    // Filter by record type/category
    if (activeCategory !== "all") {
      filtered = filtered.filter((doc) => doc.type === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by access level
    if (accessLevel === "user") {
      return filtered.filter(
        (doc) => doc.visibility === "public" || doc.visibility === "protected",
      );
    } else if (accessLevel === "admin") {
      return filtered;
    } else {
      // For non-signed in users, only show public records
      return filtered.filter((doc) => doc.visibility === "public");
    }
  };
  
  // Function to get record categories and their counts
  const getRecordCategories = () => {
    if (!records) return [];
    
    const categories = [
      { id: "all", name: "All Records", count: 0 },
      { id: "agreement", name: "Agreements", count: 0 },
      { id: "bylaw", name: "Bylaws", count: 0 },
      { id: "financial", name: "Financial", count: 0 },
      { id: "minutes", name: "Meeting Minutes", count: 0 },
      { id: "map", name: "Property Maps", count: 0 },
      { id: "schedule", name: "Schedules", count: 0 },
      { id: "other", name: "Other Records", count: 0 },
    ];
    
    // Update counts based on records
    const filteredDocs = records.filter(doc => 
      accessLevel === "admin" || 
      (accessLevel === "user" && (doc.visibility === "public" || doc.visibility === "protected"))
    );
    
    // Count all visible records
    categories[0].count = filteredDocs.length;
    
    // Count records by category
    filteredDocs.forEach(doc => {
      const category = categories.find(c => c.id === doc.type);
      if (category) {
        category.count++;
      } else {
        // If the category doesn't exist, count it as "other"
        const otherCategory = categories.find(c => c.id === "other");
        if (otherCategory) {
          otherCategory.count++;
        }
      }
    });
    
    return categories;
  };

  const handleLoginSuccess = (level: LoginAccessLevel) => {
    setAccessLevel(level);
  };

  if (accessLevel === "none") {
    return (
      <div className="bg-[#F5F5DC] min-h-screen">
        <Navbar />
        <main className="pt-16 md:pt-20">
          <section className="py-16 bg-[#F5F5DC] bg-opacity-50 min-h-screen">
            <div className="container mx-auto px-6">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-[#2C5E1A]">
                  Ranch Records
                </h2>
              
              </div>
              <p className="text-start max-w-3xl mb-6">
                Access important records related to Riverwood Ranch. Sign in to view additional records.
              </p>

              {/* Public Records Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records?.filter(doc => doc.visibility === 'public' && !doc.archived).map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => setPreviewDocument(doc)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center">
                          {getRecordIcon(doc.type)}
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          <a
                            href={doc.fileContent}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="w-4 h-4 text-gray-500 hover:text-[#2C5E1A]" />
                          </a>
                        </div>
                      </div>
                      <div className="mb-3 ml-9">
                        {getVisibilityBadge(doc.visibility)}
                      </div>
                      <p className="text-sm mb-4 text-gray-600">
                        {doc.description}
                      </p>
                      <div className="flex justify-start items-center">
                        <span className="text-xs text-gray-500">
                          Updated: {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Login Modal */}
              <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Access Protected Records</DialogTitle>
                  </DialogHeader>
                  <PasscodeLogin onSuccess={handleLoginSuccess} />
                </DialogContent>
              </Dialog>
            </div>
          </section>
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    );
  }

  const allFiltered = getFilteredDocuments();
  const activeDocs = allFiltered.filter((doc) => !doc.archived);
  const archivedDocs = allFiltered.filter((doc) => doc.archived);

  return (
    <div className="bg-[#F5F5DC] min-h-screen">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="py-16 bg-[#F5F5DC] bg-opacity-50 min-h-screen">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold text-[#2C5E1A] mb-4">
              Ranch Records
            </h2>
            <p className="text-start max-w-3xl  mb-6">
              Access important records related to Riverwood Ranch. These
              resources provide guidelines, policies, and other essential
              information for property owners.
            </p>
            <div className="flex justify-between mb-8">
              <input
                type="text"
                placeholder="Search records..."
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-[#2C5E1A]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {accessLevel === "admin" && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-[#2C5E1A] hover:bg-[#4C8033] text-white">
                      <Upload className="mr-2 h-4 w-4" /> Upload
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Upload New Record</DialogTitle>
                      <DialogDescription>
                        Add a new record to the Riverwood Ranch records library.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <DocumentUpload accessLevel="admin" />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Record Categories */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex space-x-2 pb-2">
                {getRecordCategories().map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-md whitespace-nowrap 
                      ${activeCategory === category.id 
                        ? 'bg-[#2C5E1A] text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                    ></div>
                  ))
              ) : error ? (
                <div className="col-span-3 text-center py-10">
                  <p className="text-red-500">
                    Error loading records. Please try again later.
                  </p>
                </div>
              ) : activeDocs.length > 0 ? (
                activeDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => setPreviewDocument(doc)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between mb-1">
                        <div className="flex items-center">
                          {getRecordIcon(doc.type)}
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                        </div>
                        <div onClick={(e) => e.stopPropagation()}>
                          {renderDocActions(doc)}
                        </div>
                      </div>
                      <div className="mb-3 ml-9">
                        {getVisibilityBadge(doc.visibility)}
                      </div>
                      <p className="text-sm mb-4 text-gray-600">
                        {doc.description}
                      </p>
                      <div className="flex justify-start items-center">
                        <span className="text-xs text-gray-500">
                          Updated:{" "}
                          {new Date(doc.uploadDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500">No matching records found.</p>
                </div>
              )}
            </div>

            {archivedDocs.length > 0 && (
              <>
                <h3 className="text-xl font-semibold mb-4 mt-16 text-[#2C5E1A]">
                  Archived Records
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {archivedDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-gray-50 cursor-pointer"
                      onClick={() => setPreviewDocument(doc)}
                    >
                      <div className="p-6">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            {getRecordIcon(doc.type)}
                            <h3 className="font-semibold text-lg">
                              {doc.title}
                            </h3>
                          </div>
                          <div onClick={(e) => e.stopPropagation()}>
                            {renderDocActions(doc)}
                          </div>
                        </div>
                        <div className="mb-3 ml-9">
                          {getVisibilityBadge(doc.visibility)}
                        </div>
                        <p className="text-sm mb-4 text-gray-600">
                          {doc.description}
                        </p>
                        <div className="flex justify-start items-center">
                          <span className="text-xs text-gray-500">
                            Updated:{" "}
                            {new Date(doc.uploadDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}


          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
      
      {/* Record Preview Modal */}
      {previewDocument && (
        <Dialog open={!!previewDocument} onOpenChange={() => setPreviewDocument(null)}>
          <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getRecordIcon(previewDocument.type)}
                {previewDocument.title}
              </DialogTitle>
              <DialogDescription>
                {previewDocument.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex items-center gap-2 mb-2">
              {getVisibilityBadge(previewDocument.visibility)}
              <span className="text-xs text-gray-500">
                Updated: {new Date(previewDocument.uploadDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex-1 overflow-hidden bg-gray-100 rounded-md">
              <iframe 
                src={previewDocument.fileContent} 
                className="w-full h-full border-0" 
                title={previewDocument.title}
              />
            </div>
            
            <DialogFooter className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href={previewDocument.fileContent} download target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href={previewDocument.fileContent} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Tab
                  </a>
                </Button>
              </div>
              <Button variant="outline" onClick={() => setPreviewDocument(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
