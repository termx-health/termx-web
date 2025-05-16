export function applySort<T>(items: T[], sortParam?: string | string[]): T[] {
  if (!sortParam) {
    return [...items];
  }

  const sortValue = Array.isArray(sortParam) ? sortParam[0] : sortParam;
  const direction = sortValue.startsWith('-') ? -1 : 1;
  const field = sortValue.replace(/^-/, '') as keyof T;
  return [...items].sort((a, b) => {
    const aVal = ((a[field] ?? '') as any).toString();
    const bVal = ((b[field] ?? '') as any).toString();
    return direction * aVal.localeCompare(bVal, undefined, { numeric: true });
  });
}

export function applyPagination<T>(
  items: T[],
  query: { offset?: number; limit?: number }
): {
  data: T[];
  meta: {
    total: number;
    pages: number;
    offset: number;
  };
} {
  const total = items.length;
  const safeOffset = Math.max(0, query.offset ?? 0);
  const safeLimit = (query.limit ?? 0) > 0 ? query.limit! : total;

  const page = items.slice(safeOffset, safeOffset + safeLimit);
  const pages = safeLimit > 0 ? Math.ceil(total / safeLimit) : 1;

  return {
    data: page,
    meta: {
      total,
      pages,
      offset: safeOffset
    }
  };
}