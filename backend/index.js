require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.log(err));

// Todo 스키마
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  date: { type: String, required: true }   // ✅ 날짜 필드 추가
});
const Todo = mongoose.model('Todo', todoSchema);


// ✅ 루트 라우트 추가
app.get("/", (req, res) => {
  res.send("Todo API 서버가 정상 작동 중입니다 🚀");
});

// API 엔드포인트
app.get('/api/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/api/todos', async (req, res) => {
  const newTodo = new Todo({ 
    title: req.body.title,
    date: req.body.date   // ✅ 프론트에서 보낸 날짜 저장
  });
  await newTodo.save();
  res.json(newTodo);
});


app.put('/api/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(
    req.params.id,
    { completed: req.body.completed },
    { new: true }
  );
  res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: '삭제 완료' });
});
// 날짜 없는 데이터 정리용 라우트
app.delete("/api/todos/cleanup", async (req, res) => {
  try {
    const result = await Todo.deleteMany({ date: { $exists: false } });
    res.json({ message: "날짜 없는 데이터 삭제 완료", deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 로컬 개발 환경에서만 listen 실행
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
}

// Vercel 배포용: app 객체 export
module.exports = app;
