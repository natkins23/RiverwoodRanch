import { useState, useEffect } from "react";
import { Menu, X, Sun } from "lucide-react";
import { Link, useLocation } from "wouter";
import { scrollToElement } from "@/lib/utils";

// Links for scrolling within the homepage
const scrollLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Board", href: "#board" },
  { name: "Properties", href: "#properties" },
  { name: "Contact", href: "#contact" }
];

// Links for navigating to separate pages
const pageLinks = [
  { name: "Documents", href: "/documents" }
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();
  const [isHomePage, setIsHomePage] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIsHomePage(location === "/");
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      
      // Set navbar visible if scrolling up or at the top of the page
      const isVisible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
      
      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header 
      className={`fixed top-0 left-0 w-full bg-[#2C5E1A] text-white shadow-md z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0 justify-between w-full md:w-auto">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <Sun className="mr-3 text-[#D4AF37]" size={30} />
              <h1 className="font-bold text-2xl md:text-3xl">Riverwood Ranch</h1>
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
        
        <nav className={`w-full md:w-auto ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
          <ul className="flex flex-col md:flex-row gap-1 md:gap-6 text-sm md:text-base">
            {/* Home page scroll links */}
            {isHomePage && scrollLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="block px-3 py-2 rounded hover:bg-[#4C8033] transition-colors duration-300"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    scrollToElement(link.href.substring(1));
                  }}
                >
                  {link.name}
                </a>
              </li>
            ))}
            
            {/* Page navigation links */}
            {pageLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>
                  <span
                    className={`block px-3 py-2 rounded hover:bg-[#4C8033] transition-colors duration-300 cursor-pointer ${
                      location === link.href ? "bg-[#4C8033]" : ""
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </span>
                </Link>
              </li>
            ))}
            
            {/* Home link when not on homepage */}
            {!isHomePage && (
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
    </header>
  );
}
