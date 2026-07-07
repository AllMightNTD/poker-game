export function encodeCursor(date: Date, id: string): string | null {
  if (!date || !id) return null;
  return Buffer.from(`${date.getTime()}_${id}`).toString('base64');
}

export function decodeCursor(
  cursor: string,
): { time: Date; id: string } | null {
  if (!cursor) return null;
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [timeStr, id] = decoded.split('_');
    if (!timeStr || !id) return null;
    return { time: new Date(Number(timeStr)), id };
  } catch (e) {
    console.log(e.message);
  }
}

export function buildCursorPaginationResponse<
  T extends { created_at: Date; id: string },
>(items: T[], limit: number) {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;

  let next_cursor = null;
  if (hasMore && data.length > 0) {
    const lastItem = data[data.length - 1];
    next_cursor = encodeCursor(lastItem.created_at, lastItem.id);
  }

  return {
    data,
    meta: {
      next_cursor,
      has_more: hasMore,
    },
  };
}
