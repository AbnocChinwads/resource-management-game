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

export function updateMaintenanceControl(
  section,
  checkbox,
  building,
  maintenanceAvailable,
) {
  if (!section || !checkbox) return;

  section.classList.toggle("d-none", !building || !maintenanceAvailable);

  checkbox.checked = Boolean(building?.auto_repair);
}
