export function updatePlayerDisplay(data) {
  document.getElementById("population-count").textContent = data.population;

  document.getElementById("worker-count").textContent = data.workers;

  document.getElementById("assigned-worker-count").textContent =
    data.assignedWorkers;

  document.getElementById("available-workers").textContent =
    data.availableWorkers;

  document.getElementById("food-count").textContent = Number(
    data.food ?? 0,
  ).toFixed(1);

  const foodConsumptionEl = document.getElementById("food-consumption");

  if (foodConsumptionEl) {
    foodConsumptionEl.textContent = `${Number(data.foodConsumptionRate ?? 0).toFixed(1)}/min`;
  }
}
