import { Link, useLocation } from "wouter";
import { Sun, MapPin, Mail } from "lucide-react";
import {
  scrollToElement,
  scrollToElementWithNavbarOffset,
  scrollToElementWithOffset,
} from "@/lib/utils";

export default function Footer() {
  const [location, setLocation] = useLocation();
  const isHomePage = location === "/";

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    if (isHomePage) {
      scrollToElementWithNavbarOffset(sectionId);
    } else {
      setLocation("/");
      // Wait for navigation to complete before scrolling
      setTimeout(() => {
        scrollToElementWithNavbarOffset(sectionId);
      }, 100);
    }
  };
  return (
    <footer className="bg-[#3E2723] text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Sun className="text-[#D4AF37] mr-3" size={24} />
              <h2 className="text-xl font-bold">Riverwood Ranch</h2>
            </div>
            <p className="text-gray-300 text-sm">
              A private community corporation managing road easements for 36
              properties in Southern California.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#home"
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  onClick={(e) => handleNavigation(e, "home")}
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  onClick={(e) => handleNavigation(e, "about")}
                >
                  About Us
                </a>
              </li>

              <li>
                <a
                  href="#properties"
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  onClick={(e) => handleNavigation(e, "properties")}
                >
                  Properties
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  onClick={(e) => handleNavigation(e, "contact")}
                >
                  Contact
                </a>
              </li>
              <li>
                <Link
                  href="/records"
                  className="text-gray-300 hover:text-white transition-colors duration-300 cursor-pointer"
                  onClick={() => {
                    setTimeout(() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }, 100);
                  }}
                >
                  Records
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 text-[#D4AF37]" size={16} />
                <span>PO Box 12345, Los Angeles, CA 90001</span>
              </li>

              <li className="flex items-start">
                <Mail className="mt-1 mr-3 text-[#D4AF37]" size={16} />
                <span>board@riverwoodranch.org</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Riverwood Ranch Corporation. All
            rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <ul className="flex space-x-6 text-sm">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Terms of Use
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
