import { updateNetFlowElement } from "./resources.js";

export function updatePlayerDisplay(data) {
  document.getElementById("population-count").textContent = data.population;

  document.getElementById("population-capacity").textContent =
    data.populationCapacity;

  document.getElementById("worker-count").textContent = data.workers;

  document.getElementById("assigned-worker-count").textContent =
    data.assignedWorkers;

  document.getElementById("available-workers").textContent =
    data.availableWorkers;

  document.getElementById("food-count").textContent = Number(
    data.food ?? 0,
  ).toFixed(1);

  document.getElementById("player-food-required").textContent =
    `${Number(data.foodRequiredPerMinute).toFixed(1)}/min`;

  document.getElementById("player-food-supplied").textContent =
    `${Number(data.foodSuppliedPerMinute).toFixed(1)}/min`;

  const foodNetEl = document.getElementById("player-food-net");

  if (foodNetEl) {
    updateNetFlowElement(foodNetEl, data.foodNetFlowPerMinute ?? 0);
  }
}
