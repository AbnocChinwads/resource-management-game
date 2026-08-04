import { formatResourceAmount } from "./helpers.js";

function updateNetFlowElement(element, amount) {
  const value = Number(amount);

  element.classList.remove("text-success", "text-danger", "text-muted");

  if (value > 0) {
    element.innerHTML = `<span aria-hidden="true">▲</span><span class="visually-hidden">Increasing by</span> ${value.toFixed(1)}/min<span class="visually-hidden">per minute</span>`;
    element.classList.add("text-success");
  } else if (value < 0) {
    element.innerHTML = `<span aria-hidden="true">▼</span><span class="visually-hidden">Decreasing by</span> ${Math.abs(value).toFixed(1)}/min<span class="visually-hidden">per minute</span>`;
    element.classList.add("text-danger");
  } else {
    element.innerHTML = `<span aria-hidden="true">—</span><span class="visually-hidden">No change</span> 0/min <span class="visually-hidden">per minute</span>`;
    element.classList.add("text-muted");
  }
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
