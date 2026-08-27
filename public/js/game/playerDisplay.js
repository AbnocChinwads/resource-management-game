import { updateNetFlowElement } from "./resources.js";

let latestPlayerData = null;

function formatTimer(seconds) {
  seconds = Math.floor(seconds);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

function populationStatus(data) {
  const now = Date.now();
  const statusEl = document.getElementById("population-status");

  if (data.starvationStartedAt && data.population > data.populationFloor) {
    const starvationTimer = Math.max(
      0,
      data.starvationConsequenceSeconds -
        (now - new Date(data.starvationStartedAt).getTime()) / 1000,
    );

    statusEl.textContent = `Population loss in: ${formatTimer(starvationTimer)}`;
    statusEl.setAttribute(
      "aria-label",
      `Population loss in ${formatTimer(starvationTimer)}`,
    );
  } else if (
    data.foodSurplusStartedAt &&
    data.population < data.populationCapacity
  ) {
    const surplusTimer = Math.max(
      0,
      data.populationGrowthSeconds -
        (now - new Date(data.foodSurplusStartedAt).getTime()) / 1000,
    );

    statusEl.textContent = `Population gain in: ${formatTimer(surplusTimer)}`;
    statusEl.setAttribute(
      "aria-label",
      `Population gain in ${formatTimer(surplusTimer)}`,
    );
  } else {
    statusEl.textContent = "";
    statusEl.removeAttribute("aria-label");
  }
}

export function updatePlayerDisplay(data) {
  latestPlayerData = data;
  populationStatus(data);

  const populationEl = document.getElementById("population-current-max");

  if (populationEl) {
    populationEl.textContent = `${data.population} / ${data.populationCapacity}`;
    populationEl.setAttribute(
      "aria-label",
      `Population ${data.population} out of ${data.populationCapacity}`,
    );
    populationEl.dataset.population = data.population;
  }

  const workerEl = document.getElementById("worker-count");

  if (workerEl) {
    workerEl.textContent = data.workers;
    workerEl.setAttribute("aria-label", `Total workers: ${data.workers}`);
  }

  const workerAssignmentEl = document.getElementById(
    "idle-vs-assigned-workers",
  );

  if (workerAssignmentEl) {
    workerAssignmentEl.textContent = `${data.availableWorkers} / ${data.assignedWorkers}`;
    workerAssignmentEl.setAttribute(
      "aria-label",
      `${data.availableWorkers} idle workers and ${data.assignedWorkers} assigned workers`,
    );
  }

  const foodEl = document.getElementById("food-count");

  if (foodEl) {
    const food = Number(data.food ?? 0).toFixed(1);
    foodEl.textContent = food;
    foodEl.setAttribute("aria-label", `Stored food nutrition: ${food}`);
  }

  const foodSupplyDemandEl = document.getElementById(
    "player-food-supply-demand",
  );

  if (foodSupplyDemandEl) {
    const supplied = Number(data.foodSuppliedPerMinute).toFixed(1);
    const required = Number(data.foodRequiredPerMinute).toFixed(1);

    foodSupplyDemandEl.textContent = `${supplied} / ${required} per min`;
    foodSupplyDemandEl.setAttribute(
      "aria-label",
      `Food supply ${supplied} per minute and food demand ${required} per minute`,
    );
  }

  const foodNetEl = document.getElementById("player-food-net");

  if (foodNetEl) {
    updateNetFlowElement(foodNetEl, data.foodNetFlowPerMinute ?? 0);
    foodNetEl.setAttribute(
      "aria-label",
      `Net food balance: ${Number(data.foodNetFlowPerMinute ?? 0).toFixed(1)} per minute`,
    );
  }
}

setInterval(() => {
  if (latestPlayerData) {
    populationStatus(latestPlayerData);
  }
}, 1000);
