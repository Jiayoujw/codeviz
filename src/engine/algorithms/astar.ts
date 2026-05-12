import type { StateSnapshot, GridState, GridCell } from '../../types';

function createGridSnapshot(step: number, line: number, grid: GridState, description: string): StateSnapshot {
  return { step, line, variables: [], description, gridState: grid };
}

function cloneGrid(grid: GridState): GridState {
  return {
    ...grid,
    cells: grid.cells.map((row) => row.map((cell) => ({ ...cell }))),
  };
}

const defaultMaze: boolean[][] = [
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
  [false,false,true,true,true,false,false,false,true,false,false,false,false,false,false],
  [false,false,false,false,true,false,false,false,true,false,false,false,false,false,false],
  [false,false,false,false,true,false,false,false,true,false,false,false,false,false,false],
  [false,false,false,false,true,false,false,false,true,false,false,false,false,false,false],
  [false,false,true,true,true,false,false,false,true,true,true,true,false,false,false],
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
  [false,false,false,true,true,true,true,true,false,false,false,false,false,false,false],
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
  [false,false,false,false,false,false,false,false,false,false,false,false,false,false,false],
];

function buildGrid(maze?: boolean[][]): GridState {
  const walls = maze ?? defaultMaze;
  const rows = walls.length;
  const cols = walls[0].length;
  const cells: GridCell[][] = [];

  for (let r = 0; r < rows; r++) {
    cells[r] = [];
    for (let c = 0; c < cols; c++) {
      cells[r][c] = { row: r, col: c, type: walls[r][c] ? 'wall' : 'empty', f: 0, g: 0, h: 0 };
    }
  }

  cells[1][1].type = 'start';
  cells[rows - 2][cols - 2].type = 'end';

  return { rows, cols, cells, startRow: 1, startCol: 1, endRow: rows - 2, endCol: cols - 2 };
}

function heuristic(r1: number, c1: number, r2: number, c2: number): number {
  // Manhattan distance
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

interface PQItem { row: number; col: number; f: number }

export function astarSnapshots(_data?: unknown): StateSnapshot[] {
  const grid = buildGrid();
  const snapshots: StateSnapshot[] = [];
  let step = 0;

  snapshots.push(createGridSnapshot(step++, 1, cloneGrid(grid), 'Starting A* pathfinding. Green=start, Red=end, Gray=walls'));

  const openSet: PQItem[] = [];
  const closedSet = new Set<string>();
  const parent = new Map<string, [number, number]>();

  const { startRow, startCol, endRow, endCol } = grid;
  const key = (r: number, c: number) => `${r},${c}`;

  grid.cells[startRow][startCol].g = 0;
  grid.cells[startRow][startCol].h = heuristic(startRow, startCol, endRow, endCol);
  grid.cells[startRow][startCol].f = grid.cells[startRow][startCol].h;
  openSet.push({ row: startRow, col: startCol, f: grid.cells[startRow][startCol].f });

  snapshots.push(createGridSnapshot(step++, 3, cloneGrid(grid), `Start at (${startRow},${startCol}). f=${grid.cells[startRow][startCol].f}`));

  const directions = [[-1,0],[0,1],[1,0],[0,-1]];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;
    const ck = key(current.row, current.col);

    if (closedSet.has(ck)) continue;
    closedSet.add(ck);
    grid.cells[current.row][current.col].type = 'current';

    snapshots.push(createGridSnapshot(step++, 5, cloneGrid(grid),
      `Expand node (${current.row},${current.col}) f=${current.f} g=${grid.cells[current.row][current.col].g} h=${grid.cells[current.row][current.col].h}`));

    if (current.row === endRow && current.col === endCol) {
      // Reconstruct path
      let cr = endRow, cc = endCol;
      while (cr !== startRow || cc !== startCol) {
        grid.cells[cr][cc].type = 'path';
        const p = parent.get(key(cr, cc));
        if (!p) break;
        [cr, cc] = p;
      }
      grid.cells[startRow][startCol].type = 'start';
      grid.cells[endRow][endCol].type = 'end';

      snapshots.push(createGridSnapshot(step++, 10, cloneGrid(grid),
        `Path found! Length=${grid.cells[endRow][endCol].g} steps`));
      return snapshots;
    }

    for (const [dr, dc] of directions) {
      const nr = current.row + dr;
      const nc = current.col + dc;

      if (nr < 0 || nr >= grid.rows || nc < 0 || nc >= grid.cols) continue;
      if (grid.cells[nr][nc].type === 'wall') continue;
      if (closedSet.has(key(nr, nc))) continue;

      const tentativeG = grid.cells[current.row][current.col].g + 1;

      const existing = openSet.find((item) => item.row === nr && item.col === nc);
      if (existing && tentativeG >= grid.cells[nr][nc].g) continue;

      parent.set(key(nr, nc), [current.row, current.col]);
      grid.cells[nr][nc].g = tentativeG;
      grid.cells[nr][nc].h = heuristic(nr, nc, endRow, endCol);
      grid.cells[nr][nc].f = tentativeG + grid.cells[nr][nc].h;

      if (grid.cells[nr][nc].type !== 'start' && grid.cells[nr][nc].type !== 'end') {
        grid.cells[nr][nc].type = 'open';
      }

      if (!existing) {
        openSet.push({ row: nr, col: nc, f: grid.cells[nr][nc].f });
      }

      snapshots.push(createGridSnapshot(step++, 7, cloneGrid(grid),
        `Exploring (${nr},${nc}) f=${grid.cells[nr][nc].f} g=${tentativeG} h=${grid.cells[nr][nc].h}`));
    }

    if (grid.cells[current.row][current.col].type !== 'start') {
      grid.cells[current.row][current.col].type = 'visited';
    }
    closedSet.forEach((c) => {
      const [r, co] = c.split(',').map(Number);
      if (grid.cells[r][co].type === 'open') {
        grid.cells[r][co].type = 'visited';
      }
    });
  }

  snapshots.push(createGridSnapshot(step++, 9, cloneGrid(grid), 'No path found! All reachable nodes explored.'));
  return snapshots;
}
