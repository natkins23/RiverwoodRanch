import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Standard scroll function with no offset
export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Adaptive scroll function that adjusts offset based on scroll direction
export const scrollToElementWithNavbarOffset = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Get current scroll position
    const currentScrollPos = window.pageYOffset;
    // Get element position
    const elementPosition = element.getBoundingClientRect().top + currentScrollPos;
    
    // Determine if we're scrolling up or down
    const isScrollingDown = elementPosition > currentScrollPos;
    
    // Apply different offsets based on scroll direction
    // When scrolling down, use minimal offset
    // When scrolling up, use larger offset to account for navbar
    const offset = isScrollingDown ? 0 : 60;
    
    // Scroll to element with calculated offset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};

// Scroll function with larger offset for footer links
export const scrollToElementWithOffset = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Get current scroll position
    const currentScrollPos = window.pageYOffset;
    // Get element position
    const elementPosition = element.getBoundingClientRect().top + currentScrollPos;
    
    // Use a consistent 70px offset for footer links
    const offset = 70;
    
    // Scroll to element with offset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};

/**
 * Gets the base API URL depending on environment
 * - Empty string in development (Vite's dev server handles proxying)
 * - Full origin URL in production or when deployed locally
 */
export const getBaseApiUrl = (): string => {
  // In development mode with Vite's dev server, we can use relative URLs
  // as the dev server proxies API requests to the backend
  if (import.meta.env.DEV) {
    return '';
  }
  
  // In production or when deployed locally, we need the full URL
  // Check if we're running in a browser environment
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback to relative URLs if we can't determine the origin
  return '';
};
