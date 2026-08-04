import { formatResourceAmount } from "./helpers.js";

export function updateStorage(storage) {
    if (!storage) return;

    storage.forEach(item => {
        const usedEl = document.getElementById(
            `storage-${item.storage_category}-used`
        );

        const capacityEl = document.getElementById(
            `storage-${item.storage_category}-capacity`
        );

        if (usedEl) {
            usedEl.textContent = formatResourceAmount(item.used);
        }

        if (capacityEl) {
            capacityEl.textContent = formatResourceAmount(item.capacity);
        }
    });
}
