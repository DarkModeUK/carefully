import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * Hook to automatically scroll to top when route changes
 * This ensures each page loads at the top instead of preserving scroll position
 */
export function useScrollToTop() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Scroll to top when location changes
    window.scrollTo(0, 0);
  }, [location]);
}

/**
 * Component wrapper that provides automatic scroll-to-top behavior
 * Can be used to wrap route components or the entire app
 */
export function ScrollToTop({ children }: { children: React.ReactNode }) {
  useScrollToTop();
  return <>{children}</>;
}