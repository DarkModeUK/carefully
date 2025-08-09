import { memo, useMemo } from 'react';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight?: number;
  containerHeight?: number;
  className?: string;
}

export const VirtualizedList = memo(<T,>({
  items,
  renderItem,
  itemHeight = 100,
  containerHeight = 400,
  className = ''
}: VirtualizedListProps<T>) => {
  const visibleItems = useMemo(() => {
    // For now, show all items since we don't have many
    // In a real app with thousands of items, implement windowing
    return items.map((item, index) => ({ item, index }));
  }, [items]);

  return (
    <div 
      className={`overflow-auto ${className}`} 
      style={{ height: containerHeight }}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map(({ item, index }) => (
          <div key={index} style={{ height: itemHeight }}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';