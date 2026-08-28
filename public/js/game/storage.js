import { formatResourceAmount } from "./helpers.js";

export function updateStorage(storage) {
  const container = document.getElementById("storage-body");

  if (!container) return;

  storage.forEach((item) => {
    let row = container.querySelector(
      `[data-storage-category="${item.storage_category}"]`,
    );

    if (!row) {
      row = document.createElement("tr");
      row.dataset.storageCategory = item.storage_category;

      row.innerHTML = `
        <td>${item.storage_category}</td>
        <td id="storage-${item.storage_category}-used-capacity"></td>
        <td id="storage-${item.storage_category}-buildings"></td>
      `;

      container.appendChild(row);
    }

    row.querySelector(
      `#storage-${item.storage_category}-used-capacity`,
    ).textContent =
      `${formatResourceAmount(item.used)} / ${formatResourceAmount(item.capacity)}`;

    const buildingsEl = row.querySelector(
      `#storage-${item.storage_category}-buildings`,
    );

    if (item.buildings?.length > 0) {
      buildingsEl.innerHTML = item.buildings
        .map(
          (building) =>
            `${building.name} #${building.building_number} (+${formatResourceAmount(building.storage_capacity)})`,
        )
        .join("<br>");
    } else {
      buildingsEl.textContent = "—";
    }
  });
}
