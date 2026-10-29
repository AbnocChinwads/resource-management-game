const toolTimerStates = new Map();

function formatToolTimer(seconds) {
  seconds = Math.max(0, Math.floor(seconds));

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
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

export function setupToolPolicyControl(
  select,
  getBuildingId,
  onToolPolicyChanged,
) {
  if (!select) return;

  select.addEventListener("change", async () => {
    const buildingId = getBuildingId();

    if (buildingId === null) return;

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
          buildingId,
          toolPolicy,
        }),
      });

      const data = await res.json();

      if (data.success) {
        onToolPolicyChanged(buildingId, data.toolPolicy);
      } else if (getBuildingId() === buildingId) {
        select.value = previousPolicy;
      }
    } catch (err) {
      console.error("Tool policy update error:", err);

      if (getBuildingId() === buildingId) {
        select.value = previousPolicy;
      }
    }
  });
}

export function updateToolPolicyControl(select, building) {
  if (!select) {
    return;
  }

  const toolPolicy = building.tool_policy ?? "none";

  select.value = toolPolicy;
  select.dataset.currentPolicy = toolPolicy;
}

export function updateActiveToolBonus(element, building) {
  if (!element) return;

  const activeBonus = Math.round(
    (Number(building.toolEfficiencyMultiplier ?? 1) - 1) * 100,
  );

  element.textContent =
    activeBonus > 0 ? `Active bonus: +${activeBonus}%` : "Active bonus: none";
}

function renderToolTimer(state) {
  const timer = document.querySelector("#building-tool-timer");
  const progress = document.querySelector("#building-tool-progress");
  const bar = document.querySelector("#building-tool-timer-bar");
  const text = document.querySelector("#building-tool-timer-text");

  if (!timer || !progress || !bar || !text) {
    return;
  }

  if (!state) {
    timer.classList.add("d-none");
    bar.style.width = "0%";
    progress.setAttribute("aria-valuenow", "0");
    text.textContent = "";
    return;
  }

  const remaining = Math.max(0, state.displayRemaining);

  if (remaining <= 0) {
    timer.classList.add("d-none");

    bar.style.width = "0%";

    progress.setAttribute("aria-valuenow", "0");

    return;
  }

  timer.classList.remove("d-none");

  const percentage = Math.min(100, (remaining / state.duration) * 100);

  bar.style.width = `${percentage}%`;

  progress.setAttribute("aria-valuenow", String(Math.round(percentage)));

  text.textContent = formatToolTimer(remaining);
}

export function updateToolTimer(building) {
  const buildingId = Number(building.id);

  const serverRemaining = Math.max(
    0,
    Number(building.toolRemainingSeconds ?? 0),
  );

  const duration = Math.max(1, Number(building.toolDurationSeconds ?? 1));

  const running = building.productionStatus?.status === "working";

  let state = toolTimerStates.get(buildingId);

  if (!state) {
    state = {
      serverRemaining,
      displayRemaining: serverRemaining,
      duration,
      running,
      holdSeconds: 0,
    };

    toolTimerStates.set(buildingId, state);
  } else {
    /*
     * remaining_seconds never increases during
     * one tool cohort.
     *
     * If the server value increases, a fresh
     * cohort has been equipped.
     */
    const newToolCohort = serverRemaining > state.serverRemaining;

    if (newToolCohort) {
      state.displayRemaining = serverRemaining;

      state.holdSeconds = 0;
    } else if (serverRemaining < state.displayRemaining) {
      /*
       * Server is authoritative if the local
       * timer happens to be behind it.
       */
      state.displayRemaining = serverRemaining;

      state.holdSeconds = 0;
    } else if (running && serverRemaining > state.displayRemaining) {
      /*
       * Browser counted slightly too far while
       * waiting to learn that production stopped.
       *
       * Don't jump backwards. Hold the display
       * until the server catches up.
       */
      state.holdSeconds = Math.ceil(serverRemaining - state.displayRemaining);
    }

    state.serverRemaining = serverRemaining;

    state.duration = duration;
    state.running = running;
  }
}

export function startToolTimer(getSelectedBuildingId) {
  setInterval(() => {
    // Update every stored countdown
    for (const [buildingId, state] of toolTimerStates) {
      if (state.running && state.displayRemaining > 0) {
        if (state.holdSeconds > 0) {
          state.holdSeconds -= 1;
        } else {
          state.displayRemaining = Math.max(0, state.displayRemaining - 1);
        }
      }
    }

    // Find the timer belonging to the selected building
    const selectedBuildingId = getSelectedBuildingId();
    const selectedState = toolTimerStates.get(selectedBuildingId);

    // Display only that timer
    renderToolTimer(selectedState);
  }, 1000);
}
