import { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar.css";

const API_URL = import.meta.env.VITE_API_URL;

// 한국 시간 기준 YYYY-MM-DD 포맷 함수
const formatDate = (date) => {
  return date
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\.\s?/g, "-") // "2026. 04. 07." → "2026-04-07"
    .slice(0, 10);
};

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 목록 불러오기
  useEffect(() => {
    axios.get(API_URL)
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.todos;
        setTodos(data);
      })
      .catch(err => console.error("GET 오류:", err));
  }, []);

  // 추가
  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      const dateStr = formatDate(selectedDate);
      const res = await axios.post(API_URL, { title, date: dateStr });
      const newTodo = res.data;
      setTodos([...todos, newTodo]);
      setTitle("");
    } catch (err) {
      console.error("POST 오류:", err);
    }
  };


  // 체크 토글
  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      const updated = Array.isArray(res.data) ? res.data[0] : res.data;
      setTodos(todos.map(t => (t._id === id ? updated : t)));
    } catch (err) {
      console.error("PUT 오류:", err);
    }
  };

  // 삭제
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(t => t._id !== id));
    } catch (err) {
      console.error("DELETE 오류:", err);
    }
  };

  // 날짜별 필터링
  const selectedDateStr = formatDate(selectedDate);
  const filteredTodos = todos.filter(todo => todo.date === selectedDateStr);

  // 오늘/이번주 요약
  const todayStr = formatDate(new Date());
  const todayCount = todos.filter(todo => todo.date === todayStr).length;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - (startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1)); // 월요일
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const weekCount = todos.filter(todo => {
    const todoDate = new Date(todo.date);
    return todoDate >= startOfWeek && todoDate <= endOfWeek;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex flex-col items-center p-8">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-8 drop-shadow-lg">Todo App</h1>

      {/* 달력 */}
      
      <div className="mb-4">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          className="rounded-xl shadow-lg border border-blue-200 p-2"
          tileContent={({ date, view }) => {
            if (view === "month") {
              const dateStr = formatDate(date);
              const hasTodo = todos.some(todo => todo.date === dateStr);
              return hasTodo ? (
                <div className="flex justify-center mt-0">
                  <span className="text-blue-500">•</span>
                </div>
              ) : null;
            }
          }}
        />
        <p className="mt-1 text-blue-600 font-medium">
          선택한 날짜: {selectedDateStr}
        </p>
      </div>

      {/* 요약 */}
      <div className="mb-6 text-center">
        <p className="text-lg text-blue-700 font-semibold">오늘 할 일: {todayCount}개</p>
        <p className="text-lg text-blue-700 font-semibold">이번 주 할 일: {weekCount}개</p>
      </div>

      {/* 입력창 + 버튼 */}
      <div className="flex gap-2 mb-6 w-full max-w-md">
        <input
          className="border border-blue-300 p-3 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="할 일을 입력하세요"
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg transform hover:scale-105 transition"
          onClick={addTodo}
        >
          추가
        </button>
      </div>

      {/* 선택한 날짜의 Todo 목록 */}
      <ul className="w-full max-w-md space-y-3">
        {filteredTodos.map(todo => (
          <li
            key={todo._id}
            className="flex items-center bg-white p-4 rounded-lg shadow-md border border-blue-100"
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo._id, todo.completed)}
              className="w-5 h-5 accent-blue-500 mr-3"
            />
            <span className={`flex-1 ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}>
              {todo.title}
            </span>
            <button
              className="ml-auto bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full shadow-md transform hover:scale-105 transition"
              onClick={() => deleteTodo(todo._id)}
            >
              삭제
            </button>
          </li>
        ))}
        {filteredTodos.length === 0 && (
          <p className="text-gray-500 text-center">이 날짜에는 할 일이 없습니다.</p>
        )}
      </ul>
    </div>
  );
}

export default App;
