import {
  getOrCreateBuildingGroup,
  addBuildingRowToGroup,
  sortBuildingRows,
  updateBuildingGroupSummary,
} from "./buildingGroups.js";
import {
  updateProductionConsumptionElement,
  setupToolPolicyControl,
  updateToolPolicyControl,
  updateActiveToolBonus,
} from "./buildingProduction.js";
import {
  setupMaintenanceControl,
  updateMaintenanceControl,
} from "./buildingMaintenance.js";
import { createBuildingRow } from "./buildingRows.js";

export function updateBuildings(buildings) {
  if (!buildings) return;

  const maintenanceAvailable = buildings.some(
    (building) =>
      building.type === "maintenance" && Number(building.health) > 0,
  );

  const buildingGroups = {};

  // Collect buildings for group summaries.
  // Use a Map so each building ID can only appear once.
  buildings.forEach((building) => {
    if (!buildingGroups[building.name]) {
      buildingGroups[building.name] = new Map();
    }

    buildingGroups[building.name].set(building.id, building);
  });

  buildings.forEach((building) => {
    let container;

    switch (building.type) {
      case "housing":
        container = document.getElementById("population-buildings-body");
        break;

      case "production":
        container = document.getElementById("production-buildings-body");
        break;

      case "storage":
        container = document.getElementById("storage-buildings-body");
        break;

      case "maintenance":
        container = document.getElementById("maintenance-buildings-body");
        break;

      default:
        return;
    }

    if (!container) return;

    const groupRow = getOrCreateBuildingGroup(container, building);

    let row = container.querySelector(`[data-building-id="${building.id}"]`);

    if (!row) {
      row = createBuildingRow(building);

      setupMaintenanceControl(row, building);

      addBuildingRowToGroup(container, groupRow, row);

      if (building.type === "production") {
        setupToolPolicyControl(row, building);
      }
    }

    updateMaintenanceControl(row, building, maintenanceAvailable);

    const healthElement = row.querySelector("[data-building-health]");

    if (healthElement) {
      healthElement.querySelector(".building-health-value").textContent =
        `${building.health}/${building.max_health}`;
    }

    const workersElement = row.querySelector(
      `#building-${building.id}-workers`,
    );

    if (workersElement) {
      workersElement.textContent = building.workers_assigned;
    }

    const workerCapacityElement = row.querySelector(
      `#building-${building.id}-worker-capacity`,
    );

    if (workerCapacityElement) {
      workerCapacityElement.textContent = building.effectiveWorkerCapacity;
    }

    if (building.type === "production") {
      const productionConsumptionElement = row.querySelector(
        `#building-${building.id}-production-consumption`,
      );

      updateProductionConsumptionElement(
        productionConsumptionElement,
        building,
      );

      updateToolPolicyControl(row, building);

      updateActiveToolBonus(row, building);
    }
  });

  // Update building group summaries.
  Object.entries(buildingGroups).forEach(([groupName, buildingMap]) => {
    const groupBuildings = [...buildingMap.values()];

    const building = groupBuildings[0];

    if (!building) return;

    let container;

    switch (building.type) {
      case "housing":
        container = document.getElementById("population-buildings-body");
        break;

      case "production":
        container = document.getElementById("production-buildings-body");
        break;

      case "storage":
        container = document.getElementById("storage-buildings-body");
        break;

      case "maintenance":
        container = document.getElementById("maintenance-buildings-body");
        break;

      default:
        return;
    }

    if (!container) return;

    const groupRow = container.querySelector(
      `[data-building-group="${groupName}"][data-building-group-row]`,
    );

    if (groupRow) {
      updateBuildingGroupSummary(groupRow, groupBuildings);
    }
  });

  sortBuildingRows("population-buildings-body");

  sortBuildingRows("production-buildings-body");

  sortBuildingRows("storage-buildings-body");

  sortBuildingRows("maintenance-buildings-body");
}
