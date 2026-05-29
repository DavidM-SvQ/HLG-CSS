import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedTableBody({
  items,
  renderRow,
  colSpan = 15,
  estimateSize = 40,
  className = "divide-y divide-neutral-100",
  scrollElementRef
}: {
  items: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  colSpan?: number;
  estimateSize?: number;
  className?: string;
  scrollElementRef: React.RefObject<HTMLDivElement>;
}) {
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    if (scrollElementRef.current) {
      forceUpdate();
    }
  }, [scrollElementRef.current]);

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <tbody className={className}>
      {rowVirtualizer.getVirtualItems().length > 0 && (
        <tr>
          <td
            style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }}
            colSpan={colSpan}
          />
        </tr>
      )}
      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
        const item = items[virtualRow.index];
        return (
          <React.Fragment key={virtualRow.key}>
            {renderRow(item, virtualRow.index)}
          </React.Fragment>
        );
      })}
      {rowVirtualizer.getVirtualItems().length > 0 && (
        <tr>
          <td
            style={{
              height: `${
                rowVirtualizer.getTotalSize() -
                rowVirtualizer.getVirtualItems()[
                  rowVirtualizer.getVirtualItems().length - 1
                ].end
              }px`,
            }}
            colSpan={colSpan}
          />
        </tr>
      )}
    </tbody>
  );
}
