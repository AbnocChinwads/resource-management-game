function getProductionStatusMessage(building) {
  const reasonMessages = {
    insufficient_storage: "Insufficient storage capacity",
    insufficient_inputs: "Insufficient resources",
    no_workers: "No workers assigned",
    building_damaged: "Building damaged",
  };

  return reasonMessages[building.productionStatus?.reason] ?? "Not producing";
}

export function updateProductionConsumptionElement(element, building) {
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

export function setupToolPolicyControl(row, building) {
  const toolPolicySelect = row.querySelector(
    `#building-${building.id}-tool-policy`,
  );

  if (!toolPolicySelect) return;

  toolPolicySelect.addEventListener("change", async (event) => {
    const select = event.target;

    const previousPolicy = select.dataset.currentPolicy ?? "none";

    const toolPolicy = select.value;

    try {
      const res = await fetch("/update-tool-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          buildingId: building.id,
          toolPolicy,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        select.value = previousPolicy;
        return;
      }

      select.dataset.currentPolicy = data.toolPolicy;
    } catch (err) {
      console.error("Tool policy update error:", err);
      select.value = previousPolicy;
    }
  });
}

export function updateToolPolicyControl(row, building) {
  const toolPolicySelect = row.querySelector(
    `#building-${building.id}-tool-policy`,
  );

  if (!toolPolicySelect) return;

  const toolPolicy = building.tool_policy ?? "none";

  toolPolicySelect.value = toolPolicy;
  toolPolicySelect.dataset.currentPolicy = toolPolicy;
}

export function updateActiveToolBonus(row, building) {
  const activeToolElement = row.querySelector(
    `#building-${building.id}-tool-active`,
  );

  if (!activeToolElement) return;

  const activeBonus = Math.round(
    (Number(building.toolEfficiencyMultiplier ?? 1) - 1) * 100,
  );

  activeToolElement.textContent =
    activeBonus > 0 ? `Active bonus: +${activeBonus}%` : "Active bonus: none";
}

export function updateToolTimer(row, building) {
  const timer = row.querySelector(`#building-${building.id}-tool-timer`);

  const progress = row.querySelector(`#building-${building.id}-tool-progress`);

  const bar = row.querySelector(`#building-${building.id}-tool-timer-bar`);

  const text = row.querySelector(`#building-${building.id}-tool-timer-text`);

  if (!timer || !progress || !bar || !text) {
    return;
  }

  const remaining = Math.max(0, Number(building.toolRemainingSeconds ?? 0));

  const duration = Math.max(1, Number(building.toolDurationSeconds ?? 1));

  if (remaining <= 0) {
    timer.classList.add("d-none");

    bar.style.width = "0%";

    progress.setAttribute("aria-valuenow", "0");

    return;
  }

  timer.classList.remove("d-none");

  const percentage = Math.min(100, (remaining / duration) * 100);

  const minutes = Math.floor(remaining / 60);

  const seconds = Math.floor(remaining % 60);

  bar.style.width = `${percentage}%`;

  progress.setAttribute("aria-valuenow", String(Math.round(percentage)));

  text.textContent = `Tool time remaining: ${minutes}:${String(
    seconds,
  ).padStart(2, "0")}`;
}
