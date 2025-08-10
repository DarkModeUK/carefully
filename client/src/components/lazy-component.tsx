import { Skeleton } from "@/components/ui/skeleton";
import { useLazyLoad } from "@/hooks/useLazyLoad";
import { ReactNode } from "react";

interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
  minHeight?: number;
}

/**
 * Wrapper component for lazy loading content
 * Only renders children when component comes into view
 */
export function LazyComponent({
  children,
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  className = "",
  minHeight = 100,
}: LazyComponentProps) {
  const { ref, isVisible } = useLazyLoad({
    rootMargin,
    threshold,
  });

  const defaultFallback = (
    <div className={`space-y-3 ${className}`} style={{ minHeight }}>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || defaultFallback)}
    </div>
  );
}

/**
 * Lazy loading card component
 * Useful for scenario cards, progress cards, etc.
 */
export function LazyCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, isVisible } = useLazyLoad({
    rootMargin: "100px",
    threshold: 0.1,
  });

  return (
    <div ref={ref} className={className}>
      {isVisible ? (
        children
      ) : (
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      )}
    </div>
  );
}