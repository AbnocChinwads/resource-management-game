export function getOrCreateBuildingGroup(container, building) {
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

export function addBuildingRowToGroup(container, groupRow, row) {
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

export function sortBuildingRows(containerId) {
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

export function updateBuildingGroupSummary(groupRow, buildings) {
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
