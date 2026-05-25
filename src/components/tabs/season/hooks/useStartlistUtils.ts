export const calculatePages = (
  rows: any[],
  targetSize: number,
  groupKey?: string
) => {
  const pages: number[] = [];
  let currentPage = 1;
  let currentSize = 0;
  let prevGroup = null;
  rows.forEach((r) => {
    const groupVal = groupKey && r ? r[groupKey] : null;
    const shouldBreak = groupKey
      ? currentSize >= targetSize && groupVal !== prevGroup
      : currentSize >= targetSize;
    if (currentSize > 0 && shouldBreak) {
      currentPage++;
      currentSize = 0;
    }
    pages.push(currentPage);
    currentSize++;
    prevGroup = groupVal;
  });
  return { pages, totalPages: Math.max(1, currentPage) };
};

export const colorScale = (val: number, max: number, inverted?: boolean) => {
  const t = max === 0 ? 0 : Math.max(0, Math.min(1, val / max));
  const hue = inverted ? 120 - t * 120 : t * 120; // 0=red, 120=green
  return `rgb(${Math.round(255 - t * 100)}, ${Math.round(t * 200)}, 100)`;
};
