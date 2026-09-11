function createHousingRow(building) {
  return (`
          <td>
            ${building.name} #${building.building_number}
          </td>
          <td data-building-health>
            <span class="building-health-value">
              ${building.health}/${building.max_health}
            </span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">
                Maintenance
              </label>
            </span>
          </td>
          <td>${building.population_gain}</td>
        `);
}

function createProductionRow(building) {
  return (`
          <td>
            ${building.name} #${building.building_number}
          </td>
          <td data-building-health>
            <span class="building-health-value">
              ${building.health}/${building.max_health}
            </span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">
                Maintenance
              </label>
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
            <select class="form-select form-select-sm" id="building-${building.id}-tool-policy" aria-label="Tool policy for ${building.name} #${building.building_number}">
              <option value="none">None</option>
              <option value="stone">Stone Tools (+10%)</option>
              <option value="iron">Iron Tools (+20%)</option>
            </select>
            <div class="form-text" id="building-${building.id}-tool-active">
              Active bonus: none
            </div>
            <div class="form-text">
              1 tool per worker • lasts 5 active minutes
            </div>
          </td>
          <td>
            <div class="btn-group">
              <button class="btn btn-sm btn-danger px-2" aria-label="Remove worker" onclick="changeWorkers(${building.id}, -1)">
                -
              </button>
              <button class="btn btn-sm btn-success px-2" aria-label="Add worker" onclick="changeWorkers(${building.id}, 1)">
                +
              </button>
            </div>
          </td>
        `);
}

function createStorageRow(building) {
  return (`
          <td>
            ${building.name} #${building.building_number}
          </td>
          <td data-building-health>
            <span class="building-health-value">
              ${building.health}/${building.max_health}
            </span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">
                Maintenance
              </label>
            </span>
          </td>
          <td>
            ${building.storage_capacity} ${building.storage_category}
          </td>
        `);
}

function createMaintenanceRow(building) {
  return (`
          <td>
            ${building.name} #${building.building_number}
          </td>
          <td data-building-health>
            <span class="building-health-value">
              ${building.health}/${building.max_health}
            </span>
            <span class="ms-2 form-check form-check-inline form-switch maintenance-switch" data-maintenance-control>
              <input type="checkbox" class="form-check-input" role="switch" id="maintenance-${building.id}" ${building.auto_repair ? "checked" : ""}>
              <label class="form-check-label" for="maintenance-${building.id}">
                Maintenance
              </label>
            </span>
          </td>
        `);
}

export function createBuildingRow(building) {
  const row = document.createElement("tr");

  row.dataset.buildingId = building.id;
  row.dataset.buildingName = building.name;
  row.dataset.buildingGroup = building.name;
  row.dataset.buildingNumber = building.building_number;

  switch (building.type) {
    case "housing":
      row.innerHTML = createHousingRow(building);
      break;

    case "production":
      row.innerHTML = createProductionRow(building);
      break;

    case "storage":
      row.innerHTML = createStorageRow(building);
      break;

    case "maintenance":
      row.innerHTML = createMaintenanceRow(building);
      break;

    default:
      return null;
  }

  return row;
}
