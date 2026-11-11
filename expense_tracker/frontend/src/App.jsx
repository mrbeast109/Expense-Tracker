import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Categories from "./pages/Categories";
import Layout from "./components/Layout.jsx";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const navigate = useNavigate();

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    navigate("/signup");
  };

  const isLoggedIn = !!token;

  return (
    <Routes>
      <Route
        path="/signup"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Signup onLogin={handleLogin} />}
      />
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/"
        element={isLoggedIn ? <Layout onLogout={handleLogout} user={user} /> : <Navigate to="/signup" replace />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="income" element={<Income />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="budgets" element={<Budgets />} />
        <Route path="categories" element={<Categories />} />
        <Route path="profile" element={<Profile user={user} onLogout={handleLogout} />} />
      </Route>
      <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/signup"} replace />} />
    </Routes>
  );
}

export default App;
