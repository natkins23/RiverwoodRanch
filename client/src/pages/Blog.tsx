import { useQuery } from "@tanstack/react-query";
import { Calendar, User } from "lucide-react";
import { useAccessLevel } from "@/components/Navbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Blog() {
  const { accessLevel } = useAccessLevel();
  const [location, setLocation] = useLocation();

  // Redirect if not logged in
  if (accessLevel === "none") {
    setLocation("/");
    return null;
  }

  const { data: posts, isLoading } = useQuery({
    queryKey: ["/api/blog"],
    enabled: accessLevel !== "none",
  });

  return (
    <div className="bg-[#F5F5DC] min-h-screen">
      <Navbar />
      <main className="pt-16 md:pt-20">
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-[#2C5E1A]">
                Ranch Blog
              </h2>
              {accessLevel === "admin" && (
                <Button className="bg-[#2C5E1A] hover:bg-[#4C8033] text-white">
                  New Post
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
              </div>
            ) : posts?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="p-6">
                      <h3 className="font-semibold text-xl mb-2">{post.title}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <User className="h-4 w-4 mr-2" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center text-gray-600 mb-4">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{new Date(post.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-700 mb-4">{post.excerpt}</p>
                      <Button
                        variant="outline"
                        className="text-[#2C5E1A] border-[#2C5E1A] hover:bg-[#4C8033] hover:text-white"
                      >
                        Read More
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No blog posts available.</p>
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