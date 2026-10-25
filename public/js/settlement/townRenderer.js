export function drawTileMap(ctx, canvas, map, tileSize, tileTypes) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let row = 0; row < map.length; row++) {
    for (let column = 0; column < map[row].length; column++) {
      const tile = map[row][column];
      const tileInfo = tileTypes[tile];

      ctx.fillStyle = tileInfo.colour;
      ctx.strokeStyle = "#222222";

      const left = column * tileSize;
      const top = row * tileSize;

      ctx.fillRect(left, top, tileSize, tileSize);
      ctx.strokeRect(left, top, tileSize, tileSize);
    }
  }
}

export function drawBuilding(ctx, building, tileSize) {
  const left = building.column * tileSize;
  const top = building.row * tileSize;
  const width = building.width * tileSize;
  const height = building.height * tileSize;

  ctx.fillStyle = building.colour;
  ctx.strokeStyle = "#222222";

  ctx.fillRect(left, top, width, height);
  ctx.strokeRect(left, top, width, height);
}

export function drawSelectedBuilding(ctx, building, tileSize) {
  ctx.save();
  ctx.translate(building.column * tileSize, building.row * tileSize);
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, tileSize * building.width, tileSize * building.height);
  ctx.restore();
}
