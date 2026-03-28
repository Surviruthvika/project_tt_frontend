# AU Exam Hall Locator — React Frontend

## Prerequisites
- Node.js 18+
- npm 9+

## Setup & Run

```bash
npm install
npm start
```

App runs on: http://localhost:3000

## Pages
| Route | Description |
|-------|-------------|
| /login | Role-based login (Student / Admin) |
| /signup | Registration for students and admins |
| /admin | Admin dashboard (hall allocations, notifications, student list) |
| /student | Student dashboard (view hall, notifications, profile) |

## Features
- JWT-based authentication with role protection
- Admin: view/filter students by branch, create/delete hall allocations, send notifications with SMS
- Student: view assigned exam hall, receive notifications, view profile
- Fully responsive UI

## Project Structure
```
src/
├── App.js
├── index.js
├── index.css
├── api/
│   └── axios.js          # Axios instance with JWT interceptors
├── context/
│   └── AuthContext.js    # Auth state management
└── pages/
    ├── LoginPage.jsx
    ├── SignupPage.jsx
    ├── AdminDashboard.jsx
    ├── StudentDashboard.jsx
    ├── Auth.css
    └── Dashboard.css
```

## Configuration
To change the backend URL, edit `src/api/axios.js`:
```js
baseURL: 'http://localhost:8080/api'
```
