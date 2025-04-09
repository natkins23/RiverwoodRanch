import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// Standard scroll function for navbar links - no offset
export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// Scroll function for footer links with a small offset to account for the navbar
export const scrollToElementWithOffset = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Use a 70px offset for a better scrolling experience
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
