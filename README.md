# 💳 VaultPay  
> A modern, full-stack **Fintech Dashboard** for personal finance management featuring AI-powered insights, virtual card management, rich analytics, and real-time transaction tracking.

---

## 📸 Overview  
VaultPay is a premium personal finance web application built with **React, TypeScript, and Tailwind CSS**. It provides users with a clean and interactive interface to manage money, track spending habits, and receive AI-driven financial recommendations in a modern dark-mode UI.

---

## ✨ Features  

- 🔐 **Authentication** – Email/password login & registration with role-based access (User / Admin)  
- 🔑 **Google Sign-In** – One-click OAuth login via Google  
- 📊 **Analytics Dashboard** – Income vs expenses, category breakdown, and cash flow trends  
- 💳 **Virtual Card Management** – Create, freeze, and manage virtual/physical cards  
- 🤖 **VaultAI Chat** – AI assistant for financial insights and Q&A  
- 🧠 **AI Insights** – Smart recommendations based on spending patterns  
- 🔔 **Notifications** – Real-time alerts and security tips  
- 🌙 **Dark / Light Mode** – System-aware theme support  
- 🛡️ **Admin Panel** – User management and system analytics  
- 📄 **Transactions Module** – Full CRUD with search, filter, and pagination  
- 📦 **Offline-First Mode** – Works with localStorage when backend is unavailable  

---

## 🛠️ Tech Stack  

### Frontend  
- React 18  
- TypeScript  
- Vite  
- Tailwind CSS  
- Radix UI  
- Recharts  
- Framer Motion  
- React Hook Form + Zod  
- Lucide React  

### Backend  
- Express.js  
- TypeScript  
- Supabase (Auth + Database + Realtime, optional)  

---

## 📁 Project Structure  

```bash
Fintech-main/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── layout/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── App.tsx
├── server/
│   └── src/
│       └── index.ts
├── .env.example
└── vite.config.ts
````

---

## 🚀 Getting Started

### 📌 Prerequisites

* Node.js v18+
* npm v9+

---

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/vault-pay.git
cd vault-pay
```

---

### 2️⃣ Install dependencies

```bash
# Frontend
npm install

# Backend (optional)
cd server && npm install && cd ..
```

---

### 3️⃣ Setup environment variables

```bash
cp .env.example .env
```

Fill `.env`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

> ⚡ The app works in offline mode even without backend setup.

---

### 4️⃣ Run the project

```bash
# Frontend only
npm run dev
```

OR

```bash
# Frontend + Backend
npm run dev
npm run server
```

Open:
👉 [http://localhost:5173](http://localhost:5173)

---

## 🔑 Authentication

* Users can register and login normally
* Admin role can be assigned via Admin Panel

---

## 🏗️ Build for Production

```bash
npm run build
```

Output: `/dist`

---

## 🧪 Lint & Type Check

```bash
npm run lint
npm run typecheck
```

---

## 🌐 Deployment

### Frontend (Vercel / Netlify)

* Build command: `npm run build`
* Output folder: `dist`

### Backend (Railway / Render)

* Start command: `npm start`
* Port: `5000`

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgements

* shadcn/ui
* Radix UI
* Supabase
* Recharts

```
```
