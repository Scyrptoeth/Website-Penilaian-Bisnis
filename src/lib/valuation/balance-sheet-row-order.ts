import type { AccountRow } from "./case-model";

export function applyAccountRowOrder(rows: AccountRow[], orderedRowIds: string[]): AccountRow[] {
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const orderedRows = orderedRowIds.flatMap((rowId) => {
    const row = rowById.get(rowId);
    return row ? [row] : [];
  });

  if (orderedRows.length < 2) {
    return rows;
  }

  const selectedIds = new Set(orderedRows.map((row) => row.id));
  let replacementIndex = 0;

  return rows.map((row) => {
    if (!selectedIds.has(row.id)) {
      return row;
    }

    const replacement = orderedRows[replacementIndex];
    replacementIndex += 1;
    return replacement;
  });
}

export function moveAccountRowByOffset(rowIds: string[], rowId: string, offset: -1 | 1): string[] {
  const currentIndex = rowIds.indexOf(rowId);
  const targetIndex = currentIndex + offset;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rowIds.length) {
    return rowIds;
  }

  const next = [...rowIds];
  [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
  return next;
}

export function moveAccountRowToTarget(rowIds: string[], movingRowId: string, targetRowId: string): string[] {
  const movingIndex = rowIds.indexOf(movingRowId);
  const targetIndex = rowIds.indexOf(targetRowId);

  if (movingIndex < 0 || targetIndex < 0 || movingIndex === targetIndex) {
    return rowIds;
  }

  const next = rowIds.filter((rowId) => rowId !== movingRowId);
  next.splice(targetIndex, 0, movingRowId);
  return next;
}
