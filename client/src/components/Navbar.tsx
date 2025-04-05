import { useState } from "react";
import { Menu, X, Network } from "lucide-react";
import { Link } from "wouter";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Documents", href: "#documents" },
  { name: "Board", href: "#board" },
  { name: "Properties", href: "#properties" },
  { name: "Contact", href: "#contact" }
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-[#2C5E1A] text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0 justify-between w-full md:w-auto">
          <div className="flex items-center">
            <Network className="mr-3 text-[#D4AF37]" size={30} />
            <h1 className="font-bold text-2xl md:text-3xl">Riverwood Ranch</h1>
          </div>
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
            {navLinks.map((link) => (
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
          </ul>
        </nav>
      </div>
    </header>
  );
}
