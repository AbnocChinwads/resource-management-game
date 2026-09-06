export function updateRecipes(data) {
  const recipes = data.recipes;
  const recipeInputs = data.recipeInputs;
  const resources = data.resources;
  const buildings = data.buildings;

  document.querySelectorAll("[data-recipe-id]").forEach((recipeElement) => {
    const recipeId = Number(recipeElement.dataset.recipeId);

    const recipe = recipes.find((r) => r.id === recipeId);

    if (!recipe) {
      return;
    }

    const inputs = recipeInputs.filter((input) => input.recipe_id === recipeId);

    const inputsElement = recipeElement.querySelector(".recipe-inputs");

    if (inputsElement) {
      inputsElement.innerHTML =
        inputs.length > 0
          ? "Needs: " +
            inputs
              .map((input) => {
                const resourceName =
                  resources.find(
                    (r) => r.resource_type_id === input.resource_type_id,
                  )?.name || "?";

                return `${input.amount} ${resourceName}`;
              })
              .join(", ")
          : "";
    }

    const storageElement = recipeElement.querySelector(".recipe-storage");

    if (storageElement) {
      const storageCapacity = Number(recipe.storage_capacity ?? 0);

      if (recipe.storage_category && storageCapacity > 0) {
        storageElement.textContent = `+${storageCapacity} ${recipe.storage_category} storage capacity`;

        storageElement.classList.remove("d-none");
      } else {
        storageElement.textContent = "";
        storageElement.classList.add("d-none");
      }
    }

    let canStart = true;

    inputs.forEach((input) => {
      const resource = resources.find(
        (r) => r.resource_type_id === input.resource_type_id,
      );

      const amount = resource?.amount ?? 0;

      if (amount < input.amount) {
        canStart = false;
      }
    });

    if (recipe.required_building_id) {
      const hasBuilding = buildings.some(
        (b) => b.building_id === recipe.required_building_id,
      );

      if (!hasBuilding) {
        canStart = false;
      }
    }

    const task = data.tasks.find((task) => task.recipe_id === recipeId);

    const button = recipeElement.querySelector(".recipe-button");
    const statusElement = recipeElement.querySelector(".recipe-task-status");

    if (button) {
      button.disabled = !canStart;
    }

    if (task) {
      if (button) {
        button.classList.add("d-none");
      }

      if (statusElement) {
        statusElement.classList.remove("d-none");

        if (task.is_finished) {
          statusElement.innerHTML = `
        <form class="complete-form">
          <input type="hidden" name="taskId" value="${task.id}">
          <button type="submit" class="btn btn-success">
            Complete
          </button>
        </form>
      `;
        } else {
          let progressBar = statusElement.querySelector(".recipe-progress-bar");

          if (!progressBar) {
            statusElement.innerHTML = `
          <div class="progress">
            <div
              class="progress-bar recipe-progress-bar"
              role="progressbar"
              style="width: 0%"
            ></div>
          </div>
        `;

            progressBar = statusElement.querySelector(".recipe-progress-bar");
          }

          progressBar.dataset.startedAt = new Date(task.started_at).getTime();
          progressBar.dataset.craftTime = task.duration_seconds;
        }
      }
    } else {
      if (button) {
        button.classList.remove("d-none");
      }

      if (statusElement) {
        statusElement.classList.add("d-none");
      }
    }

    recipeElement.classList.toggle("text-muted", !canStart);

    if (recipe.hide_until_available && !canStart) {
      recipeElement.style.display = "none";
    } else {
      recipeElement.style.display = "";
    }
  });
}
