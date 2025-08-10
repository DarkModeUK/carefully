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
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex } = calculateVisibleRange(
      scrollTop,
      containerHeight,
      itemHeight,
      items.length,
      3 // overscan
    );
    
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offset: (startIndex + index) * itemHeight
    }));
  }, [items, scrollTop, containerHeight, itemHeight]);

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