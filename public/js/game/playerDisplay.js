import { updateNetFlowElement } from "./resources.js";

export function updatePlayerDisplay(data) {
  document.getElementById("population-current-max").textContent =
    `${data.population} / ${data.populationCapacity}`;

  document.getElementById("worker-count").textContent = data.workers;

  document.getElementById("idle-vs-assigned-workers").textContent =
    `${data.availableWorkers} / ${data.assignedWorkers}`;

  document.getElementById("food-count").textContent = Number(
    data.food ?? 0,
  ).toFixed(1);

  document.getElementById("player-food-supply-demand").textContent =
    `${Number(data.foodSuppliedPerMinute).toFixed(1)} / ${Number(data.foodRequiredPerMinute).toFixed(1)} per min`;

  const foodNetEl = document.getElementById("player-food-net");

  if (foodNetEl) {
    updateNetFlowElement(foodNetEl, data.foodNetFlowPerMinute ?? 0);
  }

  const populationEl = document.getElementById("population-current-max");

  if (populationEl) {
    populationEl.textContent = `${data.population} / ${data.populationCapacity}`;

    populationEl.dataset.population = data.population;
  }
}
