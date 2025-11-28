import { useState, useEffect } from "react";
import { todoAPI } from "./services/api";

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

  const statusBadgeClasses = {
    "not started": "bg-[#6c757d] text-white",
    "in-progress": "bg-yellow-400 text-[#333]",
    completed: "bg-green-600 text-white",
  };

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
            <div
              key={todo.id}
              className="bg-white border border-[#ddd] p-4 mb-4 rounded-lg shadow">
              <div className="flex items-center gap-2.5 mb-2.5">
                <h3 className="m-0 flex-1">{todo.title}</h3>
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    statusBadgeClasses[todo.status]
                  }`}>
                  {todo.status}
                </span>
                <span className="px-2 py-1 rounded text-xs font-bold bg-cyan-700 text-white">
                  {todo.category}
                </span>
              </div>
              <p>{todo.description}</p>
              <div className="flex gap-2.5 mt-2.5">
                <select
                  value={todo.status}
                  onChange={(e) => handleStatusChange(todo.id, e.target.value)}
                  className="flex-1 p-2 border border-[#ddd] rounded">
                  <option value="not started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-red-800">
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default App;
