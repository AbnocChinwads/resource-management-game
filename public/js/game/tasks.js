let lastTaskState = null;

export function updateTasks(tasks) {
  const taskState = JSON.stringify(tasks);

  if (taskState === lastTaskState) {
    return;
  }

  lastTaskState = taskState;

  const container = document.getElementById("manual-tasks-body");

  if (!container) {
    return;
  }

  const currentTaskIds = new Set(tasks.map((task) => String(task.id)));

  // Remove tasks that no longer exist
  container.querySelectorAll("[data-task-id]").forEach((row) => {
    if (!currentTaskIds.has(row.dataset.taskId)) {
      row.remove();
    }
  });

  tasks.forEach((task) => {
    let row = container.querySelector(`[data-task-id="${task.id}"]`);

    // Create row if it does not exist
    if (!row) {
      row = document.createElement("tr");
      row.dataset.taskId = task.id;

      row.innerHTML = `
                <td class="task-name"></td>
                <td>
                    <div class="progress">
                        <div 
                            class="progress-bar task-progress-bar"
                            role="progressbar"
                            style="width:0%">
                        </div>
                    </div>
                </td>
                <td class="task-status"></td>
            `;

      const progressBar = row.querySelector(".task-progress-bar");

      progressBar.dataset.startedAt = new Date(task.started_at).getTime();

      progressBar.dataset.craftTime = task.duration_seconds;

      container.appendChild(row);
    }

    // Update task name
    const nameElement = row.querySelector(".task-name");

    if (nameElement) {
      nameElement.textContent = task.recipe_name;
    }

    // Update task status
    const statusElement = row.querySelector(".task-status");

    if (statusElement) {
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
        statusElement.textContent = "In Progress";
      }
    }
  });
}
