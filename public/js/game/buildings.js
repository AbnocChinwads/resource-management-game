export function updateBuildings(buildings) {
  if (!buildings) return;

  buildings.forEach((b) => {
    const productionEl = document.getElementById(`building-${b.id}-production`);
    const consumptionEl = document.getElementById(
      `building-${b.id}-consumption`,
    );

    if (productionEl) {
      updateProductionElement(productionEl, b);
    }

    if (consumptionEl) {
      updateConsumptionElement(consumptionEl, b);
    }
  });
}

function updateProductionElement(element, building) {
  const value = Number(building.productionRate ?? 0);

  element.classList.remove("text-success", "text-danger", "text-muted");

  if (value > 0) {
    element.innerHTML = `<span aria-hidden="true">▲</span><span class="visually-hidden">Increasing by</span> ${building.output_resource_name} ${value.toFixed(1)}/min<span class="visually-hidden">per minute</span>`;
    element.classList.add("text-success");
  } else if (value < 0) {
    element.innerHTML = `<span aria-hidden="true">▼</span><span class="visually-hidden">Decreasing by</span> ${building.output_resource_name} ${Math.abs(value).toFixed(1)}/min<span class="visually-hidden">per minute</span>`;
    element.classList.add("text-danger");
  } else {
    element.innerHTML = `<span aria-hidden="true">—</span><span class="visually-hidden">Not producing</span> 0/min`;
    element.classList.add("text-muted");
  }
}

function updateConsumptionElement(element, building) {
  element.classList.remove("text-danger", "text-muted");

  if (
    !building.consumptionRates ||
    building.consumptionRates.length === 0 ||
    building.workers_assigned === 0
  ) {
    element.innerHTML = `<span aria-hidden="true">—</span><span class="visually-hidden">No inputs</span>`;
    element.classList.add("text-muted");
    return;
  }

  element.innerHTML = building.consumptionRates
    .map(
      (input) =>
        `<span aria-hidden="true">▼</span><span class="visually-hidden">Consuming </span>${input.name} ${Number(input.amount).toFixed(1)} <span class="visually-hidden">per minute</span>`,
    )
    .join("<br>");
  element.classList.add("text-danger");
}
