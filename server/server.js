import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, remove } from "firebase/database";
import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.auth_domain,
  projectId: process.env.project_id,
  storageBucket: process.env.storage_bucket,
  messagingSenderId: process.env.messaging_sender_id,
  appId: process.env.app_id,
  measurementId: process.env.measurement_id,
  databaseURL: process.env.DATABASE_URL,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

// Initialize Realtime Database with todo.json if empty (ONE TIME ONLY)
async function initializeRealtimeDBWithTodos() {
  try {
    const todosRef = ref(db, "todos");
    const snapshot = await get(todosRef);

    if (!snapshot.exists()) {
      console.log("Realtime Database is empty. Initializing with todo.json...");
      const todosData = JSON.parse(fs.readFileSync("./todo.json", "utf-8"));

      // Convert nested structure to flat list with all todos
      const todosList = {};
      for (const status of Object.keys(todosData)) {
        for (const category of Object.keys(todosData[status])) {
          for (const todo of todosData[status][category]) {
            todosList[todo.id] = {
              id: todo.id,
              title: todo.title,
              description: todo.description || "",
              status: status,
              category: category,
            };
          }
        }
      }

      await set(todosRef, todosList);
      console.log("✅ Realtime Database initialized with todos from todo.json");
    } else {
      console.log(
        "✅ Realtime Database already contains data. Skipping initialization."
      );
    }
  } catch (error) {
    console.error("❌ Error initializing Realtime Database:", error);
  }
}

// Call the initialization function
initializeRealtimeDBWithTodos();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Get all todos from Realtime Database
app.get("/todos", async (req, res) => {
  try {
    const todosRef = ref(db, "todos");
    const snapshot = await get(todosRef);
    const todosObj = snapshot.val() || {};
    const todos = Object.values(todosObj);
    res.json(todos);
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Get a single todo by id from Realtime Database
app.get("/todos/:id", async (req, res) => {
  try {
    const todoRef = ref(db, `todos/${req.params.id}`);
    const snapshot = await get(todoRef);

    if (snapshot.exists()) {
      res.json(snapshot.val());
    } else {
      res.status(404).json({ error: "Todo not found" });
    }
  } catch (error) {
    console.error("Error fetching todo:", error);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Add a new todo to Realtime Database
app.post("/todos", async (req, res) => {
  try {
    const { title, description, category, status } = req.body;

    // Get all todos to find the max ID
    const todosRef = ref(db, "todos");
    const snapshot = await get(todosRef);
    const todosObj = snapshot.val() || {};
    const todos = Object.values(todosObj);
    let maxId = 0;
    todos.forEach((todo) => {
      if (todo.id > maxId) {
        maxId = todo.id;
      }
    });

    const newTodo = {
      id: maxId + 1,
      title,
      description: description || "",
      category: category || "general",
      status: status || "in-progress",
    };

    const newTodoRef = ref(db, `todos/${newTodo.id}`);
    await set(newTodoRef, newTodo);

    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error creating todo:", error);
    res.status(500).json({ error: "Failed to create todo" });
  }
});

// Update a todo in Realtime Database
app.put("/todos/:id", async (req, res) => {
  try {
    const todoRef = ref(db, `todos/${req.params.id}`);
    const snapshot = await get(todoRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const { title, description, category, status } = req.body;
    const currentData = snapshot.val();

    const updatedTodo = {
      ...currentData,
      title: title !== undefined ? title : currentData.title,
      description:
        description !== undefined ? description : currentData.description,
      category: category !== undefined ? category : currentData.category,
      status: status !== undefined ? status : currentData.status,
    };

    await set(todoRef, updatedTodo);
    res.json(updatedTodo);
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Delete a todo from Realtime Database
app.delete("/todos/:id", async (req, res) => {
  try {
    const todoRef = ref(db, `todos/${req.params.id}`);
    const snapshot = await get(todoRef);

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "Todo not found" });
    }

    const deletedTodo = snapshot.val();
    await remove(todoRef);
    res.json(deletedTodo);
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Filter todos by status or category from Realtime Database
app.get("/filter", async (req, res) => {
  try {
    const { status, category } = req.query;
    const todosRef = ref(db, "todos");
    const snapshot = await get(todosRef);
    const todosObj = snapshot.val() || {};
    let todos = Object.values(todosObj);

    if (status) {
      todos = todos.filter((t) => t.status === status);
    }
    if (category) {
      todos = todos.filter((t) => t.category === category);
    }

    res.json(todos);
  } catch (error) {
    console.error("Error filtering todos:", error);
    res.status(500).json({ error: "Failed to filter todos" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
