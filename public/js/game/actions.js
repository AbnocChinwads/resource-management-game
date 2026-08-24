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

    if (form.matches(".complete-form")) {
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
          alert(data.error);
        }
      } catch (err) {
        console.error("Complete task error:", err);
        alert("Could not complete task.");
      }

      return;
    }

    if (form.matches(".start-task-form")) {
      e.preventDefault();

      const formData = new FormData(form);
      const recipeId = formData.get("recipeId");

      const recipeItem = form.closest("[data-recipe-id]");

      const buildingType = recipeItem?.dataset.buildingType;
      const populationGain = Number(recipeItem?.dataset.populationGain);

      const population = Number(
        document.getElementById("population-current-max")?.dataset.population ??
          0,
      );

      if (
        population === 0 &&
        buildingType === "housing" &&
        populationGain > 0
      ) {
        const confirmed = confirm(
          `This will establish ${populationGain} population when completed.\n\n` +
            `They will require ${populationGain} nutrition per minute.\n\n` +
            `Make sure you have enough food stored before continuing.`,
        );

        if (!confirmed) {
          return;
        }
      }

      try {
        const res = await fetch("/start-task", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            recipeId,
          }),
        });

        const data = await res.json();

        if (data.success) {
          await refreshStats();
        } else {
          console.error(data.error);
        }
      } catch (err) {
        console.error("Start task error:", err);
      }
    }
  });
}
