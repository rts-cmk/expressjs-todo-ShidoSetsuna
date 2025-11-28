export default function TodoItemCard({ todo, onStatusChange, onDelete }) {
  return (
    <article className="bg-white border border-[#ddd] p-4 mb-4 rounded-lg shadow">
      <div className="flex items-center gap-2.5 mb-2.5">
        <h3 className="m-0 flex-1">{todo.title}</h3>
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            todo.status === "not started"
              ? "bg-gray-500 text-white"
              : todo.status === "in-progress"
              ? "bg-yellow-400 text-white"
              : "bg-green-400 text-white"
          }`}>
          {todo.status}
        </span>
        <span className="px-2 py-1 rounded text-xs font-bold bg-cyan-700 text-white">
          {todo.category}
        </span>
      </div>
      <p>{todo.description}</p>
      <div className="flex gap-2.5 mt-2.5 justify-between">
        <select
          value={todo.status}
          onChange={(e) => onStatusChange(todo.id, e.target.value)}>
          <option value="not started">Not Started</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <button
          onClick={() => onDelete(todo.id)}
          className="bg-red-600 text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-red-800	">
          Delete
        </button>
      </div>
    </article>
  );
}
