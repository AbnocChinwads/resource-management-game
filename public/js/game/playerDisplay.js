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

function getPopulationTimer(data) {
  const now = Date.now();

  if (data.starvationStartedAt && data.population > data.populationFloor) {
    const seconds =
      data.starvationConsequenceSeconds -
      (now - new Date(data.starvationStartedAt).getTime()) / 1000;

    if (seconds <= 0) {
      return null;
    }

    return {
      type: "loss",
      seconds,
    };
  }

  if (data.foodSurplusStartedAt && data.population < data.populationCapacity) {
    const seconds =
      data.populationGrowthSeconds -
      (now - new Date(data.foodSurplusStartedAt).getTime()) / 1000;

    if (seconds <= 0) {
      return null;
    }

    return {
      type: "gain",
      seconds,
    };
  }
}

function updatePopulationTimer(data) {
  const statusEl = document.getElementById("population-status");

  if (!statusEl) return;

  const timer = getPopulationTimer(data);

  if (timer?.type === "loss") {
    statusEl.textContent = `Population loss in: ${formatTimer(timer.seconds)}`;
    statusEl.setAttribute(
      "aria-label",
      `Population loss in ${formatTimer(timer.seconds)}`,
    );
  } else if (timer?.type === "gain") {
    statusEl.textContent = `Population gain in: ${formatTimer(timer.seconds)}`;
    statusEl.setAttribute(
      "aria-label",
      `Population gain in ${formatTimer(timer.seconds)}`,
    );
  } else {
    statusEl.textContent = "";
    statusEl.removeAttribute("aria-label");
  }
}

function updateFoodStatus(data) {
  const foodEl = document.getElementById("food-count");
  const foodNetEl = document.getElementById("player-food-net");

  if (foodEl) {
    const food = Number(data.food ?? 0).toFixed(1);

    foodEl.textContent = `Food: ${food}`;
    foodEl.setAttribute("aria-label", `Stored food nutrition: ${food}`);
  }

  if (foodNetEl) {
    const foodNetFlow = Number(data.foodNetFlowPerMinute ?? 0);

    updateNetFlowElement(foodNetEl, foodNetFlow);
    foodNetEl.setAttribute(
      "aria-label",
      `Net food balance: ${foodNetFlow.toFixed(1)} per minute`,
    );
  }
}

function updatePopulation(data) {
  const populationEl = document.getElementById("player-population");
  const workersEl = document.getElementById("player-workers");

  if (populationEl) {
    populationEl.textContent = `Population: ${data.population} / ${data.populationCapacity}`;
  }

  if (workersEl) {
    workersEl.textContent = `Workers: ${data.availableWorkers} idle / ${data.assignedWorkers} assigned`;
  }

  updatePopulationTimer(data);
}

function getResourceFlowIndicator(netPerMinute) {
  const flow = Number(netPerMinute);

  if (flow > 0) {
    return `
      <span aria-hidden="true" class="text-success">▲</span>
      <span class="visually-hidden">Increasing</span>
    `;
  }

  if (flow < 0) {
    return `
      <span aria-hidden="true" class="text-danger">▼</span>
      <span class="visually-hidden">Decreasing</span>
    `;
  }

  return `
    <span aria-hidden="true" class="text-muted">—</span>
    <span class="visually-hidden">No change</span>
  `;
}

function updateResources(data) {
  const resourcesEl = document.getElementById("player-resources");

  if (!resourcesEl) return;

  resourcesEl.innerHTML = data.resources
    .map((resource) => {
      const flow = getResourceFlowIndicator(resource.netPerMinute);

      return ` <div> ${resource.name}: ${Number(resource.amount)} ${flow} </div> `;
    })
    .join("");
}

function getStorageWarning(storage) {
  const percentage = Number(storage.used) / Number(storage.capacity);

  if (percentage >= 1) {
    return `<span class="text-danger ms-2"><i class="bi bi-exclamation-triangle-fill"></i> Full</span>`;
  } else if (percentage >= 0.8) {
    return `<span class="text-warning ms-2"><i class="bi bi-exclamation-triangle-fill"></i> Nearly full</span>`;
  }

  return "";
}

function updateStorage(data) {
  const storageEl = document.getElementById("player-storage");

  if (!storageEl) return;

  const feedbackEl = document.getElementById("storage-feedback");

  if (feedbackEl) {
    feedbackEl.textContent = "";
    feedbackEl.classList.add("d-none");
  }

  storageEl.innerHTML = data.storage
    .map((storage) => {
      const warning = getStorageWarning(storage);

      return `<span class="me-3"> ${storage.storage_category}: ${Number(storage.used)} / ${Number(storage.capacity)} ${warning} </span>`;
    })
    .join("");
}

export function updatePlayerDisplay(data) {
  latestPlayerData = data;

  updateFoodStatus(data);
  updatePopulation(data);
  updateResources(data);
  updateStorage(data);
}

setInterval(() => {
  if (latestPlayerData) {
    updatePopulationTimer(latestPlayerData);
  }
}, 1000);
