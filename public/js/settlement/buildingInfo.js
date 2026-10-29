import {
  updateProductionConsumptionElement,
  updateToolPolicyControl,
} from "../game/buildingProduction.js";

function updateBuildingHealth(building) {
  // Health text, percentage, progress bar and colours
  const buildingHealthProgress = document.querySelector(
    "#building-health-progress",
  );
  const buildingHealth = document.querySelector("#building-health");
  const buildingHealthBar = document.querySelector("#building-health-bar");

  if (building == null) {
    buildingHealthProgress.classList.add("d-none");
    buildingHealth.textContent = "";
    buildingHealthBar.style.width = "0%";
    return;
  }

  const healthPercentage = Number(building.health / building.max_health) * 100;

  buildingHealthProgress.classList.remove("d-none");
  buildingHealth.textContent = `Health: ${building.health}/${building.max_health}`;
  buildingHealthBar.style.width = `${healthPercentage}%`;
  buildingHealthBar.classList.remove("bg-success", "bg-warning", "bg-danger");
  if (healthPercentage > 75) {
    buildingHealthBar.classList.add("bg-success");
  } else if (healthPercentage > 40) {
    buildingHealthBar.classList.add("bg-warning");
  } else {
    buildingHealthBar.classList.add("bg-danger");
  }
}

function updateBuildingWorkers(building) {
  const buildingWorkers = document.querySelector("#building-workers");
  const workerSection = document.querySelector("#building-worker-section");

  const isProduction = building?.type === "production";

  workerSection.classList.toggle("d-none", !isProduction);

  if (isProduction) {
    buildingWorkers.textContent = `Workers: ${building.workers_assigned}/${building.effectiveWorkerCapacity}`;
  } else {
    buildingWorkers.textContent = "";
  }
}

function updateBuildingProduction(building) {
  const buildingProduction = document.querySelector("#building-production");

  const isProduction = building?.type === "production";
  buildingProduction.classList.toggle("d-none", !isProduction);

  if (isProduction) {
    updateProductionConsumptionElement(buildingProduction, building);
  } else {
    buildingProduction.textContent = "";
  }
}

function updateBuildingTools(building) {
  const buildingTool = document.querySelector("#building-tool-section");
  const buildingPolicy = document.querySelector("#building-tool-policy");

  const isProduction = building?.type === "production";
  buildingTool.classList.toggle("d-none", !isProduction);

  if (isProduction) {
    updateToolPolicyControl(buildingPolicy, building);
  }
}

export function updateBuildingInfo(building) {
  const buildingName = document.querySelector("#building-name");
  const buildingNumber = document.querySelector("#building-number");

  if (building != null) {
    buildingName.textContent = building.name;
    buildingNumber.textContent = `#${building.building_number}`;
  } else {
    buildingName.textContent = "No building selected";
    buildingNumber.textContent = "";
  }

  updateBuildingHealth(building);
  updateBuildingWorkers(building);
  updateBuildingProduction(building);
  updateBuildingTools(building);
}
