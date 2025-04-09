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

// Scroll function with minimal navbar offset for navbar links
export const scrollToElementWithNavbarOffset = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Use a 20px offset for navbar links
    const offset = 20;
    
    // Calculate the element's position relative to the top of the document
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    
    // Scroll to element with offset to account for navbar height
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
    // Use a 70px offset for footer links
    const offset = 70;
    
    // Calculate the element's position relative to the top of the document
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    
    // Scroll to element with offset to account for navbar height and padding
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};
