export function updateBuildings(buildings) {
  if (!buildings) return;

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

      default:
        return;
    }

    if (!container) return;

    let row = container.querySelector(`[data-building-id="${building.id}"]`);

    if (!row) {
      row = document.createElement("tr");
      row.dataset.buildingId = building.id;
      row.dataset.buildingName = building.name;

      if (building.type === "housing") {
        row.innerHTML = `
          <td>${building.name} #${building.building_number}</td>
          <td>${building.health}/${building.max_health}</td>
          <td>${building.population_gain}</td>
        `;
      }

      if (building.type === "production") {
        row.innerHTML = `
          <td>${building.name} #${building.building_number}</td>
          <td>${building.health}/${building.max_health}</td>
          <td class="d-none d-xxl-table-cell" id="building-${building.id}-production-consumption"></td>
          <td>
            <span id="building-${building.id}-workers">
              ${building.workers_assigned}
            </span>/${building.max_workers}
          </td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-danger px-2"
                aria-label="Remove worker"
                onclick="changeWorkers(${building.id}, -1)">
                -
              </button>

              <button class="btn btn-sm btn-success px-2"
                aria-label="Add worker"
                onclick="changeWorkers(${building.id}, 1)">
                +
              </button>
            </div>
          </td>
        `;
      }

      if (building.type === "storage") {
        row.innerHTML = `
          <td>${building.name} #${building.building_number}</td>
          <td>${building.health}/${building.max_health}</td>
          <td>${building.storage_capacity} ${building.storage_category}</td>
        `;
      }
      
      container.appendChild(row);
    }

    if (building.type === "production") {
      const productionConsumptionEl = row.querySelector(
        `#building-${building.id}-production-consumption`,
      );

      updateProductionConsumptionElement(productionConsumptionEl, building);
    }
  });

  sortBuildingRows("population-buildings-body");
  sortBuildingRows("production-buildings-body");
  sortBuildingRows("storage-buildings-body");
}

function sortBuildingRows(containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const rows = [...container.querySelectorAll("tr")];

  rows.sort((a, b) => {
    const nameA = a.dataset.buildingName ?? "";
    const nameB = b.dataset.buildingName ?? "";

    return nameA.localeCompare(nameB);
  });

  rows.forEach((row) => container.appendChild(row));
}

function updateProductionConsumptionElement(element, building) {
  if (building.productionStatus?.status === "idle") {
    const message = getProductionStatusMessage(building);

    element.innerHTML = `
      <span aria-hidden="true">—</span>
      Idle — ${message}
    `;

    element.classList.remove("text-success", "text-danger");
    element.classList.add("text-muted");

    return;
  }

  const value = Number(building.productionRate ?? 0);

  let productionHtml = "";

  if (value > 0) {
    productionHtml = `
      <div class="text-success">
        <span aria-hidden="true">▲</span>
        ${building.output_resource_name}
        ${value.toFixed(1)}/min
      </div>
    `;
  } else if (value < 0) {
    productionHtml = `
      <div class="text-danger">
        <span aria-hidden="true">▼</span>
        ${building.output_resource_name}
        ${Math.abs(value).toFixed(1)}/min
      </div>
    `;
  } else {
    productionHtml = `
      <div class="text-muted">
        <span aria-hidden="true">—</span>
        0/min
      </div>
    `;
  }

  let consumptionHtml = "";

  if (building.consumptionRates?.length > 0 && building.workers_assigned > 0) {
    consumptionHtml = building.consumptionRates
      .map(
        (input) => `
          <div class="text-danger">
            <span aria-hidden="true">▼</span>
            ${input.name}
            ${Number(input.amount).toFixed(1)}/min
          </div>
        `,
      )
      .join("");
  }

  element.innerHTML = productionHtml + consumptionHtml;
}

function getProductionStatusMessage(building) {
  const reasonMessages = {
    insufficient_storage: "Insufficient storage capacity",
    insufficient_inputs: "Insufficient resources",
    no_workers: "No workers assigned",
    building_damaged: "Building damaged",
  };

  return reasonMessages[building.productionStatus?.reason] ?? "Not producing";
}
