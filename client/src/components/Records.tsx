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
import RecordUpload from "@/components/RecordUpload";
import { Document } from "@shared/schema";
import ScrollToTop from "@/components/ScrollToTop";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRecordArchive, useRecordDelete } from "@/hooks/use-records";

export default function Records() {
  const { accessLevel, setAccessLevel } = useAccessLevel();
  const [activeTab, setActiveTab] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { toast } = useToast();

  // Mutations for archive and delete
  const archiveMutation = useRecordArchive();
  const deleteMutation = useRecordDelete();

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
          <Badge variant="outline" className="text-xs font-normal bg-green-50 text-green-700 border-green-200">
            <Eye className="h-3 w-3 mr-1" /> Public
          </Badge>
        );
      case "protected":
        return (
          <Badge variant="outline" className="text-xs font-normal bg-yellow-50 text-yellow-700 border-yellow-200">
            <ShieldCheck className="h-3 w-3 mr-1" /> Property Owner
          </Badge>
        );
      case "admin":
        return (
          <Badge variant="outline" className="text-xs font-normal bg-red-50 text-red-700 border-red-200">
            <Lock className="h-3 w-3 mr-1" /> Board Only
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleArchiveToggle = async (doc: Document) => {
    try {
      const updatedStatus = !doc.archived;
      archiveMutation.mutate(
        { id: doc.id, archived: updatedStatus },
        {
          onSuccess: () => {
            toast({
              title: `Record ${updatedStatus ? "archived" : "unarchived"}`,
              description: `Record has been ${updatedStatus ? "moved to the archive" : "restored from the archive"}.`,
            });
          },
          onError: (error) => {
            toast({
              title: "Action failed",
              description: `Failed to ${updatedStatus ? "archive" : "unarchive"} the record: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error("Archive toggle error:", error);
      toast({
        title: "Action failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!documentToDelete) return;

    try {
      deleteMutation.mutate(
        { id: documentToDelete.id },
        {
          onSuccess: () => {
            setDocumentToDelete(null);
            toast({
              title: "Record deleted",
              description: "The record has been successfully deleted.",
            });
          },
          onError: (error) => {
            toast({
              title: "Deletion failed",
              description: `Failed to delete the record: ${error.message}`,
              variant: "destructive",
            });
          },
        }
      );
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Deletion failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const renderDocActions = (doc: Document) => (
    <div className="mt-2 flex gap-2 justify-end">
      <Button
        size="sm"
        variant="outline"
        className="text-amber-600 hover:text-amber-700 border-amber-200 hover:border-amber-300"
        onClick={() => handleArchiveToggle(doc)}
      >
        {doc.archived ? "Unarchive" : "Archive"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
        onClick={() => setDocumentToDelete(doc)}
      >
        Delete
      </Button>
    </div>
  );

  const handleLoginSuccess = (level: LoginAccessLevel) => {
    setAccessLevel(level);
    setIsLoginModalOpen(false);
    toast({
      title: "Login successful",
      description: `You now have ${level} level access to records.`,
    });
  };

  function getFilteredDocuments() {
    if (!records) return [];

    let filteredDocs = records;

    // Filter by category
    if (activeCategory !== "all") {
      filteredDocs = filteredDocs.filter(doc => doc.type === activeCategory);
    }

    // Filter by visibility
    if (accessLevel === 'none') {
      filteredDocs = filteredDocs.filter(doc => doc.visibility === 'public');
    } else if (accessLevel === 'user') {
      filteredDocs = filteredDocs.filter(doc => 
        doc.visibility === 'public' || doc.visibility === 'protected'
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filteredDocs = filteredDocs.filter(doc => 
        doc.title.toLowerCase().includes(search) || 
        doc.description.toLowerCase().includes(search) ||
        doc.type.toLowerCase().includes(search)
      );
    }

    return filteredDocs;
  }

  if (isLoading) {
    return (
      <div className="bg-[#F5F5DC] min-h-screen">
        <Navbar />
        <main className="pt-16 md:pt-20">
          <section className="py-16 bg-[#F5F5DC] bg-opacity-50 min-h-screen">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-[#2C5E1A] mb-4">
                Loading Records...
              </h2>
              <div className="flex justify-center items-center py-12">
                <RefreshCw className="mr-2 h-8 w-8 animate-spin text-[#2C5E1A]" />
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F5F5DC] min-h-screen">
        <Navbar />
        <main className="pt-16 md:pt-20">
          <section className="py-16 bg-[#F5F5DC] bg-opacity-50 min-h-screen">
            <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-[#2C5E1A] mb-4">
                Error Loading Records
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-md p-6 my-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                  <p className="text-red-700">
                    {error instanceof Error ? error.message : "Failed to load records. Please try again later."}
                  </p>
                </div>
                <Button 
                  className="mt-4 bg-[#2C5E1A] hover:bg-[#4C8033]"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/records'] })}
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Retry
                </Button>
              </div>
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
                      <RecordUpload accessLevel="admin" />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {accessLevel === "none" && (
              <div className="mb-8 bg-blue-50 border border-blue-200 rounded-md p-4 text-sm">
                <p className="flex items-center">
                  <Lock className="h-4 w-4 text-blue-500 mr-2" />
                  <span>
                    Some records require property owner access.{" "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      Login here
                    </button>{" "}
                    to view all available records.
                  </span>
                </p>
              </div>
            )}

            <div className="mb-8 flex flex-wrap gap-2 mt-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center space-x-1 border ${
                  activeCategory === 'all'
                    ? 'bg-[#2C5E1A] text-white border-[#2C5E1A] shadow-md transform -translate-y-0.5 transition-transform'
                    : 'bg-white border-gray-300 hover:bg-gray-50 transition-transform'
                }`}
              >
                <span>All</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-opacity-50 rounded-sm text-xs font-semibold h-5 min-w-[20px] px-1.5 bg-white text-[#2C5E1A]">
                  {records?.length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveCategory('agreement')}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center space-x-1 border ${
                  activeCategory === 'agreement'
                    ? 'bg-[#2C5E1A] text-white border-[#2C5E1A] shadow-md transform -translate-y-0.5 transition-transform'
                    : 'bg-white border-gray-300 hover:bg-gray-50 transition-transform'
                }`}
              >
                <FileText className="w-4 h-4 mr-1" />
                <span>Agreements</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-opacity-50 rounded text-xs font-semibold h-5 min-w-[20px] px-1 bg-white text-[#2C5E1A]">
                  {records?.filter(doc => doc.type === 'agreement').length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveCategory('bylaw')}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center space-x-1 border ${
                  activeCategory === 'bylaw'
                    ? 'bg-[#2C5E1A] text-white border-[#2C5E1A] shadow-md transform -translate-y-0.5 transition-transform'
                    : 'bg-white border-gray-300 hover:bg-gray-50 transition-transform'
                }`}
              >
                <FileText className="w-4 h-4 mr-1" />
                <span>Bylaws</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-opacity-50 rounded text-xs font-semibold h-5 min-w-[20px] px-1 bg-white text-[#2C5E1A]">
                  {records?.filter(doc => doc.type === 'bylaw').length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveCategory('financial')}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center space-x-1 border ${
                  activeCategory === 'financial'
                    ? 'bg-[#2C5E1A] text-white border-[#2C5E1A] shadow-md transform -translate-y-0.5 transition-transform'
                    : 'bg-white border-gray-300 hover:bg-gray-50 transition-transform'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 mr-1" />
                <span>Financial</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-opacity-50 rounded text-xs font-semibold h-5 min-w-[20px] px-1 bg-white text-[#2C5E1A]">
                  {records?.filter(doc => doc.type === 'financial').length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveCategory('minutes')}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center space-x-1 border ${
                  activeCategory === 'minutes'
                    ? 'bg-[#2C5E1A] text-white border-[#2C5E1A] shadow-md transform -translate-y-0.5 transition-transform'
                    : 'bg-white border-gray-300 hover:bg-gray-50 transition-transform'
                }`}
              >
                <ClipboardList className="w-4 h-4 mr-1" />
                <span>Minutes</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-opacity-50 rounded text-xs font-semibold h-5 min-w-[20px] px-1 bg-white text-[#2C5E1A]">
                  {records?.filter(doc => doc.type === 'minutes').length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveCategory('map')}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center space-x-1 border ${
                  activeCategory === 'map'
                    ? 'bg-[#2C5E1A] text-white border-[#2C5E1A] shadow-md transform -translate-y-0.5 transition-transform'
                    : 'bg-white border-gray-300 hover:bg-gray-50 transition-transform'
                }`}
              >
                <MapPin className="w-4 h-4 mr-1" />
                <span>Maps</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-opacity-50 rounded text-xs font-semibold h-5 min-w-[20px] px-1 bg-white text-[#2C5E1A]">
                  {records?.filter(doc => doc.type === 'map').length || 0}
                </span>
              </button>
              
              <button
                onClick={() => setActiveCategory('schedule')}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center space-x-1 border ${
                  activeCategory === 'schedule'
                    ? 'bg-[#2C5E1A] text-white border-[#2C5E1A] shadow-md transform -translate-y-0.5 transition-transform'
                    : 'bg-white border-gray-300 hover:bg-gray-50 transition-transform'
                }`}
              >
                <Calendar className="w-4 h-4 mr-1" />
                <span>Schedules</span>
                <span className="ml-1.5 inline-flex items-center justify-center bg-opacity-50 rounded text-xs font-semibold h-5 min-w-[20px] px-1 bg-white text-[#2C5E1A]">
                  {records?.filter(doc => doc.type === 'schedule').length || 0}
                </span>
              </button>
            </div>

            <div className="mb-8">
              <div className="flex border-b border-gray-200">
                <button
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === "all"
                      ? "border-b-2 border-[#2C5E1A] text-[#2C5E1A]"
                      : "text-gray-500 hover:text-[#2C5E1A]"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  Current Records
                </button>
                {(accessLevel === "admin" || accessLevel === "user") && (
                  <button
                    className={`py-2 px-4 font-medium text-sm ${
                      activeTab === "archived"
                        ? "border-b-2 border-[#2C5E1A] text-[#2C5E1A]"
                        : "text-gray-500 hover:text-[#2C5E1A]"
                    }`}
                    onClick={() => setActiveTab("archived")}
                  >
                    Archived Records
                  </button>
                )}
              </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this record? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Document Preview Dialog */}
            <Dialog open={!!previewDocument} onOpenChange={(open) => !open && setPreviewDocument(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                {previewDocument && (
                  <>
                    <DialogHeader>
                      <div className="flex items-center">
                        {getRecordIcon(previewDocument.type)}
                        <DialogTitle>{previewDocument.title}</DialogTitle>
                      </div>
                      <div className="mt-2 flex">
                        {getVisibilityBadge(previewDocument.visibility)}
                        {previewDocument.archived && (
                          <Badge variant="outline" className="ml-2 text-xs font-normal bg-gray-50 text-gray-600 border-gray-200">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </DialogHeader>
                    
                    <div className="my-6">
                      <p className="text-gray-700">{previewDocument.description}</p>
                      <p className="text-sm text-gray-500 mt-4">
                        Uploaded on {new Date(previewDocument.uploadDate).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Display file content */}
                    <div className="h-full w-full min-h-[300px] overflow-auto border border-gray-200 rounded-md p-4">
                      {/* Determine if it's an image */}
                      {previewDocument.fileContent.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                        <div className="flex justify-center">
                          <img 
                            src={previewDocument.fileContent} 
                            alt={previewDocument.title} 
                            className="max-w-full h-auto" 
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <FileText className="h-16 w-16 text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-4">This document can't be previewed directly.</p>
                          <div className="flex space-x-4">
                            <a 
                              href={previewDocument.fileContent} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C5E1A] hover:bg-[#4C8033]"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" /> Open
                            </a>
                            <a 
                              href={previewDocument.fileContent} 
                              download
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Download className="mr-2 h-4 w-4" /> Download
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {accessLevel === "admin" && 
                      renderDocActions(previewDocument)
                    }

                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                      </DialogClose>
                    </DialogFooter>
                  </>
                )}
              </DialogContent>
            </Dialog>

            {/* Record Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {(activeTab === "all" ? activeDocs : archivedDocs).length > 0 ? (
                (activeTab === "all" ? activeDocs : archivedDocs).map((doc) => (
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
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <p className="text-gray-500">
                    {searchTerm
                      ? "No records match your search criteria."
                      : activeTab === "archived"
                      ? "No archived records found."
                      : "No records available."}
                  </p>
                </div>
              )}
            </div>

            {/* Login Modal */}
            <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
              <PasscodeLogin onSuccess={handleLoginSuccess} />
            </Dialog>
          </div>
        </section>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}