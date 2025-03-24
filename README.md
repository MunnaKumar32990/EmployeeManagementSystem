# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Employee Management System (EMS)

A modern, real-time employee management system built with React, Node.js, and Socket.IO. This system enables efficient task management, employee tracking, and real-time communication between administrators and employees.

## 🌟 Features

### For Administrators
- **Dashboard Overview**
  - Real-time statistics of employees and tasks
  - Visual representation of active and completed tasks
  - Employee management interface
  - Task management system

- **Employee Management**
  - View all employees with their status (online/offline)
  - Search and filter employees
  - Real-time employee status tracking
  - Employee performance monitoring

- **Task Management**
  - Create and assign tasks to employees
  - Set task priorities and deadlines
  - Track task progress
  - Real-time task status updates

### For Employees
- **Personal Dashboard**
  - View assigned tasks
  - Update task status
  - Track task progress
  - Real-time notifications

### General Features
- **Real-time Updates**
  - Live status updates using Socket.IO
  - Instant notifications for task assignments
  - Real-time employee online/offline status

- **User Authentication**
  - Secure login system
  - Role-based access control
  - Session management

- **Modern UI/UX**
  - Responsive design
  - Dark mode interface
  - Smooth animations
  - Intuitive navigation

## 🛠️ Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (for animations)
- Socket.IO Client
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.IO
- JWT Authentication

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/ems.git
cd ems
```

2. Install dependencies for both frontend and backend
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# In backend directory
cp .env.example .env
# Edit .env with your configuration

# In frontend directory
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run dev
```

## 📁 Project Structure

```
ems/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
└── README.md
```

## 🔒 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Munna Kumar

## 🙏 Acknowledgments

- React.js community
- Tailwind CSS team
- Socket.IO team
- All contributors and supporters

## 📞 Support

For support, email munnakushw7@gmail.com or create an issue in the repository.

---

Made with ❤️ by [Munna](https://github.com/MunnaKumar32990)
