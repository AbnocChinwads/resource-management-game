export function initialiseGameActions(refreshStats) {
  window.changeWorkers = async function (buildingId, delta) {
    try {
      const res = await fetch("/update-workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          buildingId,
          delta,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const workersEl = document.getElementById(
          `building-${buildingId}-workers`,
        );

        if (workersEl) {
          workersEl.textContent = data.workers_assigned;
        }

        const availableEl = document.getElementById("available-workers");

        if (availableEl) {
          availableEl.textContent = data.availableWorkers;
        }
      } else {
        alert(data.error || "Cannot change workers");
      }
    } catch (err) {
      console.error("Worker assignment error:", err);
    }
  };

  document.body.addEventListener("submit", async (e) => {
    const form = e.target;

    if (!form.matches(".complete-form")) {
      return;
    }

    e.preventDefault();

    const formData = new FormData(form);
    const taskId = formData.get("taskId");

    try {
      const res = await fetch("/complete-task", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          taskId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await refreshStats();
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Complete task error:", err);
    }
  });
}
