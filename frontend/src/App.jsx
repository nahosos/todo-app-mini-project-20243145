import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/todos";

// ─── 유틸 ─────────────────────────────────────────────────────
const formatDate = (date) =>
  date
    .toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" })
    .replace(/\.\s?/g, "-")
    .slice(0, 10);

const calcDday = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { label: "D-day", color: "bg-blue-500 text-white" };
  if (diff < 0) return { label: `D+${Math.abs(diff)}`, color: "bg-gray-200 text-gray-500" };
  if (diff <= 3) return { label: `D-${diff}`, color: "bg-red-100 text-red-600" };
  return { label: `D-${diff}`, color: "bg-blue-100 text-blue-600" };
};

const FILTERS = ["전체", "진행중", "완료"];
const SORTS = ["마감일순", "최신순"];

// ─── TodoItem ─────────────────────────────────────────────────
function TodoItem({ todo, onToggle, onDelete }) {
  const dday = calcDday(todo.date);
  return (
    <li className={`flex items-center gap-3 bg-white px-4 py-3 rounded-xl border transition-all group
      ${todo.completed ? "border-gray-100 opacity-60" : "border-blue-100 hover:border-blue-300 hover:shadow-sm"}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo._id, todo.completed)}
        className="w-5 h-5 accent-blue-500 cursor-pointer shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${todo.completed ? "line-through text-gray-400" : "text-gray-700"}`}>
          {todo.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{todo.date}</p>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${dday.color}`}>
        {dday.label}
      </span>
      <button
        onClick={() => onDelete(todo._id)}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-xl leading-none pb-0.5"
        title="삭제"
      >
        ×
      </button>
    </li>
  );
}

// ─── AddTodoModal ─────────────────────────────────────────────
function AddTodoModal({ onAdd, onClose }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(formatDate(new Date()));

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), date);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-bold text-gray-700 mb-4">새 할 일 추가</h2>
        <input
          autoFocus
          className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="할 일을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <div className="mb-5">
          <label className="text-xs text-gray-400 mb-1 block">마감일</label>
          <input
            type="date"
            className="w-full border border-blue-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-500 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium transition"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────
function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("전체");
  const [sort, setSort] = useState("마감일순");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    axios.get(API_URL)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.todos;
        setTodos(data);
      })
      .catch((err) => console.error("GET 오류:", err))
      .finally(() => setLoading(false));
  }, []);

  const addTodo = useCallback(async (title, date) => {
    try {
      const res = await axios.post(API_URL, { title, date });
      setTodos((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("POST 오류:", err);
    }
  }, []);

  const toggleTodo = useCallback(async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      const updated = Array.isArray(res.data) ? res.data[0] : res.data;
      setTodos((prev) => prev.map((t) => (t._id === id ? updated : t)));
    } catch (err) {
      console.error("PUT 오류:", err);
    }
  }, []);

  const deleteTodo = useCallback(async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      console.error("DELETE 오류:", err);
    }
  }, []);

  // 통계
  const todayStr = formatDate(new Date());
  const todayTodos = todos.filter((t) => t.date === todayStr);
  const doneTodayCount = todayTodos.filter((t) => t.completed).length;
  const urgentCount = todos.filter((t) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const target = new Date(t.date); target.setHours(0,0,0,0);
    const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
    return !t.completed && diff >= 0 && diff <= 3;
  }).length;

  // 필터 + 검색 + 정렬
  let displayed = todos.filter((t) => {
    if (filter === "진행중") return !t.completed;
    if (filter === "완료") return t.completed;
    return true;
  });
  if (search.trim()) {
    displayed = displayed.filter((t) =>
      t.title.toLowerCase().includes(search.trim().toLowerCase())
    );
  }
  displayed = [...displayed].sort((a, b) => {
    if (sort === "마감일순") return new Date(a.date) - new Date(b.date);
    return b._id.localeCompare(a._id);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-md">

        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-blue-600">To</span><span className="text-blue-400">do</span>
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">{todayStr}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-1"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5,10.5h-3v-3a1.5,1.5,0,0,0-3,0v3h-3a1.5,1.5,0,0,0,0,3h3v3a1.5,1.5,0,0,0,3,0v-3h3a1.5,1.5,0,0,0,0-3Z"/>
            </svg>
            추가
          </button>
        </div>

        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-blue-100 p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">전체</p>
            <p className="text-xl font-bold text-blue-600">{todos.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">오늘 완료</p>
            <p className="text-xl font-bold text-blue-600">
              {doneTodayCount}
              <span className="text-sm font-normal text-gray-300">/{todayTodos.length}</span>
            </p>
          </div>
          <div className={`rounded-xl border p-3 text-center ${urgentCount > 0 ? "bg-red-50 border-red-100" : "bg-white border-blue-100"}`}>
            <p className="text-xs text-gray-400 mb-1">임박 (3일)</p>
            <p className={`text-xl font-bold ${urgentCount > 0 ? "text-red-500" : "text-blue-600"}`}>{urgentCount}</p>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative mb-4">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 pointer-events-none" viewBox="0 0 513.749 513.749" fill="currentColor">
            <path d="M504.352,459.061l-99.435-99.477c74.402-99.427,54.115-240.344-45.312-314.746S119.261-9.277,44.859,90.15S-9.256,330.494,90.171,404.896c79.868,59.766,189.565,59.766,269.434,0l99.477,99.477c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L504.352,459.061z M225.717,385.696c-88.366,0-160-71.634-160-160s71.634-160,160-160s160,71.634,160,160C385.623,314.022,314.044,385.602,225.717,385.696z"/>
          </svg>
          <input
            className="w-full bg-white border border-blue-100 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* 필터 + 정렬 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-white text-gray-500 border border-blue-100 hover:border-blue-300"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="text-xs text-gray-500 border border-blue-100 rounded-lg px-2 py-1.5 bg-white focus:outline-none cursor-pointer"
          >
            {SORTS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* 목록 */}
        {loading ? (
          <p className="text-blue-300 text-sm text-center py-10 animate-pulse">불러오는 중...</p>
        ) : displayed.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-400 text-sm">
              {search ? "검색 결과가 없어요" : filter === "완료" ? "완료된 항목이 없어요" : "할 일을 추가해보세요!"}
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {displayed.map((todo) => (
              <TodoItem key={todo._id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
            ))}
          </ul>
        )}
      </div>

      {showModal && <AddTodoModal onAdd={addTodo} onClose={() => setShowModal(false)} />}
    </div>
  );
}

export default App;
