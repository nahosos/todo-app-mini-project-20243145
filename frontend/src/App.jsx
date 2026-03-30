import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  // 초기 상태는 반드시 배열로!
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");

  // 목록 불러오기
  useEffect(() => {
    axios.get("/api/todos")
      .then(res => {
        console.log("API 응답:", res.data);
        // 응답이 배열인지 객체인지 안전하게 처리
        const data = Array.isArray(res.data) ? res.data : res.data.todos;
        setTodos(data);
      })
      .catch(err => console.error(err));
  }, []);

  // 추가
  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      const res = await axios.post("/api/todos", { title });
      const newTodo = Array.isArray(res.data) ? res.data[0] : res.data;
      setTodos([...todos, newTodo]);
      setTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  // 체크 (완료 토글)
  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`/api/todos/${id}`, { completed: !completed });
      const updated = Array.isArray(res.data) ? res.data[0] : res.data;
      setTodos(todos.map(t => (t._id === id ? updated : t)));
    } catch (err) {
      console.error(err);
    }
  };

  // 삭제
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`/api/todos/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Todo App</h1>
      <div className="flex mb-4">
        <input
          className="border p-2 rounded-l"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
        />
        <button
          className="bg-blue-500 text-white px-4 rounded-r"
          onClick={addTodo}
        >
          추가
        </button>
      </div>
      <ul className="w-full max-w-md">
        {Array.isArray(todos) && todos.map(todo => (
          <li
            key={todo._id}
            className="flex justify-between items-center bg-white p-3 mb-2 rounded shadow"
          >
            <span
              className={`cursor-pointer ${todo.completed ? "line-through text-gray-400" : ""}`}
              onClick={() => toggleTodo(todo._id, todo.completed)}
            >
              {todo.title}
            </span>
            <button
              className="text-red-500"
              onClick={() => deleteTodo(todo._id)}
            >
              삭제
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
