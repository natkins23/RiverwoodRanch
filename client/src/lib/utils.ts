import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const scrollToElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Get the navbar height (approximately 80px) plus additional padding (40px)
    const offset = 120;
    
    // Calculate the element's position relative to the top of the document
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    
    // Scroll to element with offset to account for navbar height and padding
    window.scrollTo({
      top: elementPosition - offset,
      behavior: 'smooth'
    });
  }
};
