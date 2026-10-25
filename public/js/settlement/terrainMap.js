export function createTileMap(rows, columns) {
  const map = [];

  for (let row = 0; row < rows; row++) {
    const newRow = [];

    for (let column = 0; column < columns; column++) {
      newRow.push(0);
    }

    map.push(newRow);
  }

  return map;
}

export function createHorizontalPath(map, row, startColumn, length) {
  for (let column = startColumn; column < startColumn + length; column++) {
    map[row][column] = 1;
  }
}

export function createVerticalPath(map, startRow, column, length) {
  for (let row = startRow; row < startRow + length; row++) {
    map[row][column] = 1;
  }
}
