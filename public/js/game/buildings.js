import { formatResourceAmount } from "./helpers.js";

export function updateBuildings(buildings) {
  if (!buildings) return;

  buildings.forEach((building) => {
    const container =
      building.type === "housing"
        ? document.getElementById("population-buildings-body")
        : document.getElementById("production-buildings-body");

    if (!container) return;

    let row = container.querySelector(`[data-building-id="${building.id}"]`);

    if (!row) {
      row = document.createElement("tr");
      row.dataset.buildingId = building.id;

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
          <td class="d-none d-xxl-table-cell" id="building-${building.id}-production"></td>
          <td class="d-none d-xxl-table-cell" id="building-${building.id}-consumption"></td>
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

      container.appendChild(row);
    }

    if (building.type === "production") {
      const productionEl = row.querySelector(
        `#building-${building.id}-production`,
      );

      const consumptionEl = row.querySelector(
        `#building-${building.id}-consumption`,
      );

      if (productionEl) {
        updateProductionElement(productionEl, building);
      }

      if (consumptionEl) {
        updateConsumptionElement(consumptionEl, building);
      }
    }
  });
}

function updateProductionElement(element, building) {
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

  element.classList.remove("text-success", "text-danger", "text-muted");

  if (value > 0) {
    element.innerHTML = `
      <span aria-hidden="true">▲</span>
      ${building.output_resource_name}
      ${value.toFixed(1)}/min
    `;
    element.classList.add("text-success");
  } else if (value < 0) {
    element.innerHTML = `
      <span aria-hidden="true">▼</span>
      ${building.output_resource_name}
      ${Math.abs(value).toFixed(1)}/min
    `;
    element.classList.add("text-danger");
  } else {
    element.innerHTML = `
      <span aria-hidden="true">—</span>
      0/min
    `;
    element.classList.add("text-muted");
  }
}

function updateConsumptionElement(element, building) {
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

  element.classList.remove("text-danger", "text-muted");

  if (
    !building.consumptionRates ||
    building.consumptionRates.length === 0 ||
    building.workers_assigned === 0
  ) {
    element.innerHTML = `
      <span aria-hidden="true">—</span>
    `;
    element.classList.add("text-muted");
    return;
  }

  element.innerHTML = building.consumptionRates
    .map(
      (input) =>
        `<span aria-hidden="true">▼</span>
        ${input.name}
        ${Number(input.amount).toFixed(1)}/min`,
    )
    .join("<br>");

  element.classList.add("text-danger");
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
