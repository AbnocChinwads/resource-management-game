export function setupMaintenanceControl(checkbox, getSelectedBuildingId, onMaintenanceChanged) {
  if (!checkbox) return;

  checkbox.addEventListener("change", async () => {
    const buildingId = getSelectedBuildingId();

    if (buildingId === null) return;

    const enabled = checkbox.checked;

    const res = await fetch("/update-maintenance", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        buildingId,
        autoRepair: enabled,
      }),
    });

    const data = await res.json();

    if (data.success) {
      onMaintenanceChanged(buildingId, data.autoRepair);
    } else if (getSelectedBuildingId() === buildingId) {
      checkbox.checked = !enabled;
    }
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
