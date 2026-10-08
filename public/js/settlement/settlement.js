import { fetchGameData } from "../api/gameData.js";

const buildingIcons = {
  Kiln: "bi-fire",
  Farm: "bi-flower1",
  Mill: "bi-gear-wide-connected",
  Bakery: "bi-cake2",
  Quarry: "bi-bricks",
  "Woodcutters Hut": "bi-tree",
  Mine: "bi-gem",
  Blacksmith: "bi-hammer",
  Smelter: "bi-fire",
  Sawmill: "bi-gear-fill",

  Hut: "bi-house",
  Cottage: "bi-house-door",

  Workshop: "bi-wrench-adjustable",

  Toolmaker: "bi-hammer",
};

const storageIcons = {
  material: "bi-box-seam",
  grain: "bi-basket",
  food: "bi-shop",
  tool: "bi-tools",
  fuel: "bi-fire",
  ingredient: "bi-bookshelf",
};

function getBuildingIcon(building) {
  if (building.type === "storage") {
    return storageIcons[building.storage_category] ?? "bi-building";
  }

  return buildingIcons[building.name] ?? "bi-building";
}

function getZoneName(type) {
  const zoneNames = {
    housing: "Residential",
    production: "Production",
    storage: "Storage",
    maintenance: "Infrastructure",
    worker: "Workforce",
  };

  return zoneNames[type] ?? type;
}

function getProductionStatusDisplay(building) {
  if (building.productionStatus?.status === "working") {
    return {
      text: "Working",
      className: "text-bg-success",
    };
  }

  const idleStates = {
    no_workers: {
      text: "No workers",
      className: "text-bg-secondary",
    },
    building_damaged: {
      text: "Damaged",
      className: "text-bg-danger",
    },
    insufficient_inputs: {
      text: "Missing resources",
      className: "text-bg-warning",
    },
    insufficient_storage: {
      text: "Storage full",
      className: "text-bg-warning",
    },
    output_resource_not_found: {
      text: "Output unavailable",
      className: "text-bg-danger",
    },
    storage_not_found: {
      text: "Storage unavailable",
      className: "text-bg-danger",
    },
  };

  return (
    idleStates[building.productionStatus?.reason] ?? {
      text: "Idle",
      className: "text-bg-secondary",
    }
  );
}

function renderBuildings(buildings) {
  const settlementMap = document.querySelector("#settlement-map");

  settlementMap.replaceChildren();

  const zones = new Map();

  for (const building of buildings) {
    if (!zones.has(building.type)) {
      zones.set(building.type, []);
    }

    zones.get(building.type).push(building);
  }

  for (const [type, zoneBuildings] of zones) {
    const zone = document.createElement("section");
    zone.classList.add("settlement-zone");
    zone.dataset.zone = type;

    const heading = document.createElement("h2");
    heading.textContent = getZoneName(type);

    const buildingsContainer = document.createElement("div");
    buildingsContainer.classList.add("settlement-zone-buildings");

    for (const building of zoneBuildings) {
      const buildingElement = document.createElement("div");

      buildingElement.classList.add(
        "settlement-building",
        `settlement-building-${building.type}`,
      );
      buildingElement.dataset.buildingId = building.id;

      const icon = document.createElement("i");
      icon.classList.add(
        "bi",
        getBuildingIcon(building),
        "settlement-building-icon",
      );
      icon.setAttribute("aria-hidden", "true");

      const name = document.createElement("strong");
      name.textContent = `${building.name} #${building.building_number}`;

      const healthPercentage =
        (Number(building.health) / Number(building.max_health)) * 100;
      const health = document.createElement("div");
      health.classList.add("progress", "w-100");
      health.setAttribute("role", "progressbar");
      health.setAttribute("aria-label", "Building health");
      health.setAttribute("aria-valuenow", Math.round(healthPercentage));
      health.setAttribute("aria-valuemin", "0");
      health.setAttribute("aria-valuemax", "100");

      const healthBar = document.createElement("div");
      healthBar.classList.add("progress-bar");
      healthBar.style.width = `${healthPercentage}%`;

      let productionStatus = null;

      if (building.type === "production") {
        const statusDisplay = getProductionStatusDisplay(building);

        productionStatus = document.createElement("span");

        productionStatus.classList.add("badge", statusDisplay.className);

        productionStatus.textContent = statusDisplay.text;
      }

      health.append(healthBar);

      buildingElement.append(icon, name);

      if (productionStatus) {
        buildingElement.append(productionStatus);
      }

      buildingElement.append(health);
      buildingsContainer.append(buildingElement);

      if (healthPercentage > 75) {
        healthBar.classList.add("bg-success");
      } else if (healthPercentage > 40) {
        healthBar.classList.add("bg-warning");
      } else {
        healthBar.classList.add("bg-danger");
      }
    }

    zone.append(heading, buildingsContainer);
    settlementMap.append(zone);
  }
}

async function updateSettlement() {
  try {
    const data = await fetchGameData();

    renderBuildings(data.buildings);
  } catch (err) {
    console.error("Settlement update error:", err);
  }
}

async function initialiseSettlement() {
  await updateSettlement();

  setInterval(updateSettlement, 3000);
}

initialiseSettlement();
