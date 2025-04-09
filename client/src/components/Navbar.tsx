import { useState, useEffect, createContext, useContext } from "react";
import {
  Menu,
  X,
  Sun,
  LogOut,
  ShieldCheck,
  User,
  ArrowLeft,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { scrollToElement, scrollToElementWithNavbarOffset } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PasscodeLogin, {
  AccessLevel as LoginAccessLevel,
} from "@/components/PasscodeLogin";

// Define access level type
export type NavbarAccessLevel = "none" | "user" | "admin";

// Create context to manage access level state across the app
export const AccessLevelContext = createContext<{
  accessLevel: NavbarAccessLevel;
  setAccessLevel: (level: NavbarAccessLevel) => void;
}>({
  accessLevel: "none",
  setAccessLevel: () => {},
});

// Custom hook to use the access level context
export const useAccessLevel = () => useContext(AccessLevelContext);

// Links for scrolling within the homepage
const scrollLinks = [
  { name: "About", href: "#about" },
  { name: "Properties", href: "#properties" },
  { name: "Contact", href: "#contact" },
];

// Links for navigating to separate pages
const pageLinks = [{ name: "Records", href: "/records" }];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [isHomePage, setIsHomePage] = useState(true);
  const [isRanchPortal, setIsRanchPortal] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Get access level from context
  const { accessLevel, setAccessLevel } = useAccessLevel();

  useEffect(() => {
    setIsHomePage(location === "/");
    setIsRanchPortal(location === "/ranch-portal");
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isVisible =
        prevScrollPos > currentScrollPos || currentScrollPos < 10;

      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = () => {
    setAccessLevel("none");
    setIsMenuOpen(false);
  };

  const handleLoginSuccess = (level: LoginAccessLevel) => {
    setAccessLevel(level);
    setIsLoginModalOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-[#2C5E1A] text-white shadow-md z-50 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0 justify-between w-full md:w-auto">
          <Link href="/">
            <div
              className="flex items-center cursor-pointer"
              onClick={(e) => {
                if (isHomePage) {
                  e.preventDefault();
                  scrollToElementWithNavbarOffset("home");
                }
              }}
            >
              <Sun className="mr-3 text-[#D4AF37]" size={30} />
              <h1 className="font-bold text-2xl md:text-3xl">
                Riverwood Ranch
              </h1>
            </div>
          </Link>
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="flex-1 flex justify-center">
          <nav
            className={`w-full md:w-auto ${isMenuOpen ? "block" : "hidden md:block"}`}
          >
            <ul className="flex flex-col md:flex-row gap-1 md:gap-6 text-sm md:text-base items-center">
              {(isHomePage ||
                accessLevel !== "none" ||
                location === "/records" ||
                isRanchPortal) &&
                scrollLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="block px-3 py-2 rounded hover:bg-[#4C8033] transition-colors duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        if (location === "/records" || isRanchPortal) {
                          setLocation("/");
                          // Wait for navigation to complete before scrolling
                          setTimeout(() => {
                            scrollToElementWithNavbarOffset(
                              link.href.substring(1),
                            );
                          }, 100);
                        } else {
                          scrollToElementWithNavbarOffset(
                            link.href.substring(1),
                          );
                        }
                      }}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}

              {pageLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <span
                      className={`block px-3 py-2 rounded hover:bg-[#4C8033] transition-colors duration-300 cursor-pointer ${
                        location === link.href ? "bg-[#4C8033]" : ""
                      }`}
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (link.href === "/records") {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}

              {!isHomePage && location !== "/records" && !isRanchPortal && (
                <li>
                  <Link href="/">
                    <span
                      className="block px-3 py-2 rounded hover:bg-[#4C8033] transition-colors duration-300 cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </span>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {accessLevel !== "none" && (
            <>
              <Badge className="bg-[#4C8033] text-white border-0 flex items-center pointer-events-none">
                {accessLevel === "admin" ? (
                  <>
                    <ShieldCheck className="mr-1 h-3 w-3" /> Board
                  </>
                ) : (
                  <>
                    <User className="mr-1 h-3 w-3" /> Private
                  </>
                )}
              </Badge>
              {isRanchPortal ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#2C5E1A] hover:bg-[#4C8033] hover:text-white border-[#2C5E1A] w-32"
                  onClick={() => setLocation("/")}
                >
                  Welcome Page
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#2C5E1A] hover:bg-[#4C8033] hover:text-white border-[#2C5E1A] w-32"
                  onClick={() => setLocation("/ranch-portal")}
                >
                  Ranch Portal
                </Button>
              )}
            </>
          )}
          {accessLevel === "none" ? (
            <Dialog open={isLoginModalOpen} onOpenChange={setIsLoginModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white text-[#2C5E1A] hover:bg-[#4C8033] hover:text-white border-[#2C5E1A]"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Sign In
                </Button>
              </DialogTrigger>
              <PasscodeLogin onSuccess={handleLoginSuccess} />
            </Dialog>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-[#4C8033]"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
