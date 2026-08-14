import { formatResourceAmount } from "./helpers.js";

export function updateNetFlowElement(element, amount) {
  const value = Number(amount);

  element.classList.remove("text-success", "text-danger", "text-muted");

  if (value > 0) {
    element.innerHTML = `<span aria-hidden="true">▲</span><span class="visually-hidden">Increasing by</span> ${value.toFixed(1)}/min`;
    element.classList.add("text-success");
  } else if (value < 0) {
    element.innerHTML = `<span aria-hidden="true">▼</span><span class="visually-hidden">Decreasing by</span> ${Math.abs(value).toFixed(1)}/min`;
    element.classList.add("text-danger");
  } else {
    element.innerHTML = `<span aria-hidden="true">—</span><span class="visually-hidden">No change</span> 0/min`;
    element.classList.add("text-muted");
  }
}

export function renderResources(resources) {
  const container = document.querySelector("#resource-table-body");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  resources.forEach((resource) => {
    const row = document.createElement("tr");

    row.dataset.resourceId = resource.resource_type_id;

    row.innerHTML = `
      <td>${resource.name}</td>
      <td id="resource-${resource.resource_type_id}-amount"></td>
      <td id="resource-${resource.resource_type_id}-net" aria-live="polite"></td>
    `;

    container.appendChild(row);
  });
}

export function updateResources(resources) {
  resources.forEach((r) => {
    const amountEl = document.getElementById(
      `resource-${r.resource_type_id}-amount`,
    );

    const netEl = document.getElementById(`resource-${r.resource_type_id}-net`);

    if (amountEl) {
      amountEl.textContent = formatResourceAmount(r.amount);
    }

    if (netEl) {
      updateNetFlowElement(netEl, r.netPerMinute);
    }
  });
}
