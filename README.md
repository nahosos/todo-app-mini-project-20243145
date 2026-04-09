# todo-app-mini-project-20243145

마감일 관리와 D-day 기능을 갖춘 풀스택 Todo 웹 앱입니다.

**배포 URL**: https://todo-app-mini-project-20243145.vercel.app

---

## 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB Atlas (Mongoose) |
| 배포 | Vercel |

---

## 주요 기능

- 할 일 추가 / 완료 체크 / 삭제
- 마감일 설정 및 D-day 자동 계산
- 전체 / 진행중 / 완료 필터
- 제목 검색
- 마감일순 / 최신순 정렬
- 오늘 완료 현황 및 임박 항목(3일 이내) 요약

---

## 프로젝트 구조

```
todo-app-mini-project-20243145/
├── frontend/          # React + Vite
│   └── src/
│       ├── App.jsx
│       └── index.css
├── backend/           # Express REST API
│   └── index.js
├── vercel.json
└── README.md
```

---

## 로컬 실행

**1. 백엔드**
```bash
cd backend
npm install
npm run dev
```

**2. 프론트엔드**
```bash
cd frontend
npm install
npm run dev
```

프론트: http://localhost:5173 / 백엔드: http://localhost:5000/api/todos

---

## 배포

Vercel에 GitHub 레포를 연결하고, 환경변수에 `MONGODB_URI`를 추가하면 자동 배포됩니다.