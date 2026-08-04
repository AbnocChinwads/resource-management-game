let lastTaskState = null;

export async function updateTasks(tasks) {
  const taskState = JSON.stringify(tasks);

  if (taskState === lastTaskState) {
    return;
  }

  lastTaskState = taskState;

  await refreshActiveTasks();
}
