import { useState, useEffect } from "react";
import { todoAPI } from "./services/api";
import TodoItemCard from "./components/todo_item_card/todo_item_card";

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    category: "work",
    status: "not started",
  });

  // Fetch all todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoAPI.getAllTodos();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async (e) => {
    e.preventDefault();
    try {
      const createdTodo = await todoAPI.createTodo(newTodo);
      setTodos([...todos, createdTodo]);
      setNewTodo({
        title: "",
        description: "",
        category: "work",
        status: "not started",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTodo = async (id, updates) => {
    try {
      const updatedTodo = await todoAPI.updateTodo(id, updates);
      setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await todoAPI.deleteTodo(id);
      setTodos(todos.filter((todo) => todo.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await handleUpdateTodo(id, { status: newStatus });
  };

  if (loading)
    return <div className="text-center p-5 text-lg">Loading todos...</div>;
  if (error)
    return (
      <div className="text-center p-5 text-lg text-red-600">Error: {error}</div>
    );

  return (
    <>
      <header className="text-center">
        <h1 className="text-[#333] text-2xl font-bold">Todo List</h1>
        <p className="text-[#333]">
          Made with: React, Express, Firebase Realtime Database
        </p>
      </header>

      {/* Create Todo Form */}
      <form
        onSubmit={handleCreateTodo}
        className="bg-[#f5f5f5] p-5 rounded-lg mb-8">
        <h2 className="mt-0">Add New Todo</h2>
        <input
          className="w-full p-2.5 mb-2.5 border border-[#ddd] rounded text-base"
          type="text"
          placeholder="Title"
          name="title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          required
        />
        <textarea
          className="w-full p-2.5 mb-2.5 border border-[#ddd] rounded text-base min-h-80 resize-y"
          placeholder="Description"
          name="description"
          value={newTodo.description}
          onChange={(e) =>
            setNewTodo({ ...newTodo, description: e.target.value })
          }
        />
        <select
          className="w-full p-2.5 mb-2.5 border border-[#ddd] rounded text-base"
          value={newTodo.category}
          onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
          name="category">
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          <option value="shopping">Shopping</option>
        </select>
        <div className="flex justify-between">
          <select
            value={newTodo.status}
            onChange={(e) => setNewTodo({ ...newTodo, status: e.target.value })}
            name="status">
            <option value="not started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white border-none px-5 py-2.5 rounded cursor-pointer text-lg hover:bg-blue-800">
            Add Todo
          </button>
        </div>
      </form>

      {/* Todos List */}
      <div className="todos-list">
        <h2 className="mb-5">All Todos ({todos.length})</h2>
        {todos.length === 0 ? (
          <p>No todos yet. Create one above!</p>
        ) : (
          todos.map((todo) => (
            <TodoItemCard
              key={todo.id}
              todo={todo}
              onStatusChange={handleStatusChange}
              onDelete={handleDeleteTodo}
            />
          ))
        )}
      </div>
    </>
  );
}

export default App;
