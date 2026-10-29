import { fetchGameData } from "../api/gameData.js";
import {
  createTileMap,
  createHorizontalPath,
  createVerticalPath,
} from "./terrainMap.js";
import {
  drawTileMap,
  drawBuilding,
  drawSelectedBuilding,
} from "./townRenderer.js";
import { updateBuildingInfo } from "./buildingInfo.js";
import {
  setupToolPolicyControl,
  updateToolTimer,
  startToolTimer,
} from "../game/buildingProduction.js";
import { initialiseWorkerButtons } from "../game/actions.js";

const canvas = document.querySelector("#town-map");
const ctx = canvas.getContext("2d");

let selectedBuildingId = null;
let maintenanceAvailable = false;

const tileSize = 32;
const tileTypes = {
  0: {
    name: "Grass",
    colour: "#348C31",
  },
  1: {
    name: "Dirt",
    colour: "#BA6742",
  },
};
const drawableBuildings = [];

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();

  //column
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const left = Math.floor(x / tileSize);
  //row
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  const top = Math.floor(y / tileSize);

  selectedBuildingId = null;
  let selectedBuilding = null;

  drawableBuildings.forEach((building) => {
    if (top >= building.row && top < building.row + building.height) {
      if (left >= building.column && left < building.column + building.width) {
        selectedBuildingId = building.id;
        selectedBuilding = building;
      }
    }
  });
  updateBuildingInfo(selectedBuilding, maintenanceAvailable);
  drawMap();
});

initialiseWorkerButtons(
  () => selectedBuildingId,
  (buildingId, data) => {
    const building = drawableBuildings.find(
      (building) => building.id === buildingId,
    );

    if (!building) {
      return;
    }

    building.workers_assigned = data.workers_assigned;

    if (building.id === selectedBuildingId) {
      updateBuildingInfo(building, maintenanceAvailable);
    }
  },
);

setupToolPolicyControl(
  document.querySelector("#building-tool-policy"),
  () => selectedBuildingId,
  (buildingId, toolPolicy) => {
    const building = drawableBuildings.find(
      (drawable) => drawable.id === buildingId,
    );

    if (!building) return;

    building.tool_policy = toolPolicy;

    if (selectedBuildingId === buildingId) {
      updateBuildingInfo(building, maintenanceAvailable);
    }
  },
);

startToolTimer(() => selectedBuildingId);

async function buildingsArray() {
  const data = await fetchGameData();

  return data.buildings;
}

const bounds = canvas.parentElement.getBoundingClientRect();
canvas.width = bounds.width;
canvas.height = bounds.height;

const columns = Math.ceil(canvas.width / tileSize);
const rows = Math.ceil(canvas.height / tileSize);

const terrainMap = createTileMap(rows, columns);
createHorizontalPath(terrainMap, Math.floor(rows / 2), 0, columns);
createVerticalPath(terrainMap, 0, Math.floor(columns / 2), rows);

async function loadBuildings() {
  const buildings = await buildingsArray();

  maintenanceAvailable = buildings.some(
    (building) =>
      building.type === "maintenance" && Number(building.health) > 0,
  );

  buildings.forEach((building, index) => {
    updateToolTimer(building);
    const existingBuilding = drawableBuildings.find((drawable) => {
      return drawable.id === building.id;
    });

    if (existingBuilding) {
      Object.assign(existingBuilding, building);

      return;
    }

    const drawableBuilding = {
      ...building,
      width: 2,
      height: 2,
      row: 0 + Math.floor(index / 5) * 2,
      column: 5 + (index % 5) * 2,
      colour: "yellow",
    };
    drawableBuildings.push(drawableBuilding);
  });
  const selectedBuilding = drawableBuildings.find(
    (drawable) => drawable.id === selectedBuildingId,
  );
  updateBuildingInfo(selectedBuilding, maintenanceAvailable);
  drawMap();
}

function drawMap() {
  drawTileMap(ctx, canvas, terrainMap, tileSize, tileTypes);
  drawableBuildings.forEach((building) => {
    drawBuilding(ctx, building, tileSize);
  });
  drawableBuildings.forEach((building) => {
    if (selectedBuildingId === building.id) {
      drawSelectedBuilding(ctx, building, tileSize);
    }
  });
}

drawMap();
loadBuildings();
setInterval(loadBuildings, 3000);
