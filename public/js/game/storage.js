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
        <td id="storage-${item.storage_category}-used"></td>
        <td id="storage-${item.storage_category}-capacity"></td>
      `;

      container.appendChild(row);
    }

    document.getElementById(
      `storage-${item.storage_category}-used`,
    ).textContent = formatResourceAmount(item.used);

    document.getElementById(
      `storage-${item.storage_category}-capacity`,
    ).textContent = formatResourceAmount(item.capacity);
  });
}
