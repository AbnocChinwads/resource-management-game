export function setupMaintenanceControl(row, building) {
  const maintenanceCheckbox = row.querySelector(`#maintenance-${building.id}`);

  if (!maintenanceCheckbox) return;

  maintenanceCheckbox.addEventListener("change", async (event) => {
    const enabled = event.target.checked;

    const res = await fetch("/update-maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        buildingId: building.id,
        autoRepair: enabled,
      }),
    });

    await res.json();
  });
}

export function updateMaintenanceControl(row, building, maintenanceAvailable) {
  const maintenanceControl = row.querySelector("[data-maintenance-control]");

  if (maintenanceControl) {
    maintenanceControl.classList.toggle("d-none", !maintenanceAvailable);
  }

  const maintenanceCheckbox = row.querySelector(`#maintenance-${building.id}`);

  if (maintenanceCheckbox) {
    maintenanceCheckbox.checked = Boolean(building.auto_repair);
  }
}
