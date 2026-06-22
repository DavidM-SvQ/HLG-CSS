export const calculatePages = (
  rows: any[],
  targetSize: number,
  groupKey?: string,
  minLastPageSize: number = 10
) => {
  if (!rows || rows.length === 0) return { pages: [], totalPages: 1 };

  const chunks: Array<Array<{ row: any; originalIndex: number }>> = [];
  let currentChunk: Array<{ row: any; originalIndex: number }> = [];
  let prevGroup = null;

  rows.forEach((r, i) => {
    const groupVal = groupKey && r ? r[groupKey] : null;
    const shouldBreak = groupKey
      ? currentChunk.length >= targetSize && groupVal !== prevGroup
      : currentChunk.length >= targetSize;

    if (currentChunk.length > 0 && shouldBreak) {
      chunks.push(currentChunk);
      currentChunk = [];
    }
    currentChunk.push({ row: r, originalIndex: i });
    prevGroup = groupVal;
  });

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  if (chunks.length > 1 && chunks[chunks.length - 1].length < minLastPageSize) {
    const lastChunk = chunks.pop()!;
    chunks[chunks.length - 1].push(...lastChunk);
  }

  const pages: number[] = new Array(rows.length).fill(1);
  chunks.forEach((chunk, chunkIndex) => {
    chunk.forEach((item) => {
      pages[item.originalIndex] = chunkIndex + 1;
    });
  });

  return { pages, totalPages: chunks.length };
};

export const colorScale = (val: number, max: number, inverted?: boolean) => {
  const t = max === 0 ? 0 : Math.max(0, Math.min(1, val / max));
  const hue = inverted ? 120 - t * 120 : t * 120; // 0=red, 120=green
  return `rgb(${Math.round(255 - t * 100)}, ${Math.round(t * 200)}, 100)`;
};
