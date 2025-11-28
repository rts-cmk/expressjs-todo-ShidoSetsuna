const API_BASE_URL = "http://localhost:3000";

export const todoAPI = {
  // Get all todos
  getAllTodos: async () => {
    const response = await fetch(`${API_BASE_URL}/todos`);
    if (!response.ok) throw new Error("Failed to fetch todos");
    return response.json();
  },

  // Get a single todo by id
  getTodoById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`);
    if (!response.ok) throw new Error("Failed to fetch todo");
    return response.json();
  },

  // Create a new todo
  createTodo: async (todoData) => {
    const response = await fetch(`${API_BASE_URL}/todos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) throw new Error("Failed to create todo");
    return response.json();
  },

  // Update a todo
  updateTodo: async (id, todoData) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todoData),
    });
    if (!response.ok) throw new Error("Failed to update todo");
    return response.json();
  },

  // Delete a todo
  deleteTodo: async (id) => {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete todo");
    return response.json();
  },

  // Filter todos by status or category
  filterTodos: async (filters) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/filter?${params}`);
    if (!response.ok) throw new Error("Failed to filter todos");
    return response.json();
  },
};
