const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const dueDateInput = document.getElementById("due-date-input");
const categoryInput = document.getElementById("category-input");
const addTaskForm = document.querySelector("#add-task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const remainingTasks = document.querySelector("#remaining-tasks");
let tasks = [];

const BASE_URL = "http://localhost:4000";

// Fetch tasks from the API and render them
async function fetchTasks(userId) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await response.json();
  tasks = data;
  renderTasks();
}

// Add a new task using the API
async function addTask({ name, description, status, userId }) {
  const response = await fetch(`${BASE_URL}/task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      description,
      status,
      userId,
    }),
  });
  const data = await response.json();
  tasks.push(data);
  renderTasks();
}

// Update an existing task using the API
async function updateTask({ name, description, status, taskId }) {
  const response = await fetch(`${BASE_URL}/task`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      description,
      status,
      taskId,
    }),
  });
  const data = await response.json();
  tasks = tasks.map((task) => {
    if (task.id === taskId) {
      return data;
    } else {
      return task;
    }
  });
  renderTasks();
}

// Delete a task using the API
async function deleteTask(taskId) {
  const response = await fetch(`${BASE_URL}/task`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId,
    }),
  });
  const data = await response.json();
  tasks = tasks.filter((task) => task.id !== data.id);
  renderTasks();
}

addTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const taskDescription = taskInput.value;
  if (taskDescription) {
    const task = {
      name: taskDescription,
      description: taskDescription,
      status: "NOT_COMPLETED",
      userId: 1,
    };
    addTask(task);
    taskInput.value = "";
  }
});

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.toLowerCase();
  const tasks = taskList.querySelectorAll("li");
  tasks.forEach((task) => {
    const taskText = task.textContent.toLowerCase();
    if (taskText.includes(searchTerm)) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
});

taskList.addEventListener("click", (event) => {
  if (event.target.classList.contains("complete-button")) {
    const taskIndex = event.target.parentElement.dataset.index;
    const task = tasks[taskIndex];
    const updates = {
      status: task.status === "COMPLETED" ? "NOT_COMPLETED" : "COMPLETED",
    };
    updateTask({ taskId: task.id, ...updates });
  }
  if (event.target.classList.contains("delete-button")) {
    const taskIndex = event.target.parentElement.dataset.index;
    const task = tasks[taskIndex];
    deleteTask(task.id);
  }
});

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    const listItem = document.createElement("li");
    listItem.classList.add("task-item");
    listItem.dataset.index = index;
    const descriptionSpan = document.createElement("span");
    descriptionSpan.textContent = task.description;
    if (task.status === "COMPLETED") {
      descriptionSpan.classList.add("completed");
    }
    listItem.appendChild(descriptionSpan);
    const completeButton = document.createElement("button");
    completeButton.textContent = "Mark as Completed";
    completeButton.classList.add("complete-button");
    listItem.appendChild(completeButton);
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("delete-button");
    listItem.appendChild(deleteButton);
    taskList.appendChild(listItem);
  });
  remainingTasks.textContent = tasks.filter(
    (task) => task.status === "NOT_COMPLETED"
  ).length;
}
