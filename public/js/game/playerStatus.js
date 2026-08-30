export function updatePlayerStatus(data) {
  updatePopulation(data);
  updateResources(data);
  updateStorage(data);
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

      return ` <div> ${resource.name}: ${Number(resource.amount).toFixed(2)} ${flow} </div> `;
    })
    .join("");
}

function updateStorage(data) {
  const storageEl = document.getElementById("player-storage");

  if (!storageEl) return;

  storageEl.innerHTML = data.storage
    .map((storage) => {
      return ` <span class="me-3"> ${storage.storage_category}: ${Number(storage.used).toFixed(2)} / ${Number(storage.capacity).toFixed(2)} </span> `;
    })
    .join("");
}
