function getOrCreateBuildingGroup(container, building) {
  const groupName = building.name;

  let groupRow = container.querySelector(
    `[data-building-group="${groupName}"][data-building-group-row]`,
  );

  if (!groupRow) {
    groupRow = document.createElement("tr");

    groupRow.dataset.buildingGroup = groupName;
    groupRow.dataset.buildingGroupRow = "";
    groupRow.dataset.expanded = "false";

    let extraColumns = "";

    if (building.type === "production") {
      extraColumns = `
        <td></td>
        <td data-building-group-summary></td>
        <td></td>
        <td></td>
      `;
    } else if (building.type === "maintenance") {
      extraColumns = `
        <td></td>
      `;
    } else {
      extraColumns = `
        <td></td>
        <td data-building-group-summary></td>
      `;
    }

    groupRow.innerHTML = `
      <td>
        <button type="button" class="btn btn-link text-decoration-none p-0">
          <span aria-hidden="true">▸</span>${groupName}
        </button>

        <span class="text-muted ms-2" data-building-group-count></span>
      </td>

      ${extraColumns}
    `;

    const button = groupRow.querySelector("button");

    button.addEventListener("click", () => {
      const expanded = groupRow.dataset.expanded === "true";

      groupRow.dataset.expanded = String(!expanded);

      const buildingRows = container.querySelectorAll(
        `[data-building-group="${groupName}"]:not([data-building-group-row])`,
      );

      buildingRows.forEach((buildingRow) => {
        buildingRow.hidden = expanded;
      });

      button.querySelector("span").textContent = expanded ? "▸" : "▾";
    });

    container.appendChild(groupRow);
  }

  return groupRow;
}

function addBuildingRowToGroup(container, groupRow, row) {
  const groupRows = container.querySelectorAll(
    `[data-building-group="${row.dataset.buildingGroup}"]:not([data-building-group-row])`,
  );

  row.hidden = groupRow.dataset.expanded !== "true";

  if (groupRows.length > 0) {
    groupRows[groupRows.length - 1].after(row);
  } else {
    groupRow.after(row);
  }
}

function sortBuildingRows(containerId) {
  const container = document.getElementById(containerId);

  if (!container) return;

  const groupRows = [
    ...container.querySelectorAll("tr[data-building-group-row]"),
  ];

  groupRows.sort((a, b) => {
    const groupA = a.dataset.buildingGroup ?? "";
    const groupB = b.dataset.buildingGroup ?? "";

    return groupA.localeCompare(groupB);
  });

  groupRows.forEach((groupRow) => {
    const groupName = groupRow.dataset.buildingGroup;

    const buildingRows = [
      ...container.querySelectorAll(
        `tr[data-building-group="${groupName}"]:not([data-building-group-row])`,
      ),
    ];

    buildingRows.sort((a, b) => {
      const numberA = Number(a.dataset.buildingNumber ?? 0);
      const numberB = Number(b.dataset.buildingNumber ?? 0);

      return numberA - numberB;
    });

    container.appendChild(groupRow);

    buildingRows.forEach((buildingRow) => {
      container.appendChild(buildingRow);
    });
  });
}

function updateBuildingGroupSummary(groupRow, buildings) {
  const countElement = groupRow.querySelector("[data-building-group-count]");

  if (countElement) {
    countElement.textContent = `(${buildings.length} ${buildings.length === 1 ? "building" : "buildings"})`;
  }

  if (buildings[0]?.type !== "production") {
    return;
  }

  const production = {};
  const consumption = {};

  buildings.forEach((building) => {
    if (building.productionStatus?.status === "idle") {
      return;
    }

    const productionRate = Number(building.productionRate ?? 0);
    const outputName = building.output_resource_name;

    if (productionRate !== 0 && outputName) {
      production[outputName] = (production[outputName] ?? 0) + productionRate;
    }

    if (
      building.consumptionRates?.length > 0 &&
      building.workers_assigned > 0
    ) {
      building.consumptionRates.forEach((input) => {
        const amount = Number(input.amount ?? 0);

        consumption[input.name] = (consumption[input.name] ?? 0) + amount;
      });
    }
  });

  let summaryHtml = "";

  Object.entries(production).forEach(([resourceName, amount]) => {
    if (amount > 0) {
      summaryHtml += `
        <span class="text-success ms-3">
          <span aria-hidden="true">▲</span>
          ${resourceName}
          ${amount.toFixed(1)}/min
        </span>
      `;
    } else if (amount < 0) {
      summaryHtml += `
        <span class="text-danger ms-3">
          <span aria-hidden="true">▼</span>
          ${resourceName}
          ${Math.abs(amount).toFixed(1)}/min
        </span>
      `;
    }
  });

  Object.entries(consumption).forEach(([resourceName, amount]) => {
    summaryHtml += `
      <span class="text-danger ms-3">
        <span aria-hidden="true">▼</span>
        ${resourceName}
        ${amount.toFixed(1)}/min
      </span>
    `;
  });

  const summaryElement = groupRow.querySelector(
    "[data-building-group-summary]",
  );

  if (summaryElement) {
    summaryElement.innerHTML = summaryHtml;
  }
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

export function updateBuildings(buildings) {
  if (!buildings) return;

  const maintenanceAvailable = buildings.some(
    (building) =>
      building.type === "maintenance" && Number(building.health) > 0,
  );

  const buildingGroups = {};

  // Collect production buildings for group summaries.
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
      row = document.createElement("tr");

      row.dataset.buildingId = building.id;
      row.dataset.buildingName = building.name;
      row.dataset.buildingGroup = building.name;
      row.dataset.buildingNumber = building.building_number;

      if (building.type === "housing") {
        row.innerHTML = `
          <td>${building.name} #${building.building_number}</td>
          <td data-building-health><span class="building-health-value">${building.health}/${building.max_health}</span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">Maintenance</label>
            </span>
          </td>
          <td>${building.population_gain}</td>
        `;
      }

      if (building.type === "production") {
        row.innerHTML = `
          <td>${building.name} #${building.building_number}</td>
          <td data-building-health><span class="building-health-value">${building.health}/${building.max_health}</span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">Maintenance</label>
            </span>
          </td>
          <td class="d-none d-xxl-table-cell" id="building-${building.id}-production-consumption"></td>
          <td>
            <span id="building-${building.id}-workers">
              ${building.workers_assigned}
            </span>/<span id="building-${building.id}-worker-capacity">
              ${building.effectiveWorkerCapacity}
            </span>
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
          <td data-building-health><span class="building-health-value">${building.health}/${building.max_health}</span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">Maintenance</label>
            </span>
          </td>
          <td>${building.storage_capacity} ${building.storage_category}</td>
        `;
      }

      if (building.type === "maintenance") {
        row.innerHTML = `
          <td>${building.name} #${building.building_number}</td>
          <td data-building-health><span class="building-health-value">${building.health}/${building.max_health}</span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">Maintenance</label>
            </span>
          </td>
        `;
      }

      const maintenanceCheckbox = row.querySelector(
        `#maintenance-${building.id}`,
      );

      if (maintenanceCheckbox) {
        maintenanceCheckbox.addEventListener("change", async (event) => {
          const enabled = event.target.checked;

          const res = await fetch("/update-maintenance", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              buildingId: building.id,
              autoRepair: enabled,
            }),
          });

          const data = await res.json();
        });
      }

      addBuildingRowToGroup(container, groupRow, row);
    }

    const maintenanceControl = row.querySelector("[data-maintenance-control]");

    if (maintenanceControl) {
      maintenanceControl.classList.toggle("d-none", !maintenanceAvailable);
    }

    const maintenanceCheckbox = row.querySelector(
      `#maintenance-${building.id}`,
    );

    if (maintenanceCheckbox) {
      maintenanceCheckbox.checked = Boolean(building.auto_repair);
    }

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
      const productionConsumptionEl = row.querySelector(
        `#building-${building.id}-production-consumption`,
      );

      updateProductionConsumptionElement(productionConsumptionEl, building);
    }
  });

  // Update production group summaries.
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
