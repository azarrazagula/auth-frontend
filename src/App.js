import React, { useState, useEffect } from "react";
import "./App.css";
import AuthForm from "./components/AuthForm";
import LandingPage from "./foodApp/LandingPage";
import { getUserProfile } from "./utils/api";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (e.g., from a previous session)
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
      getUserProfile()
        .then((data) => setUser(data.user || data.admin || data))
        .catch(() => {
          localStorage.removeItem("accessToken");
          setIsLoggedIn(false);
        });
    }
  }, []);

  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
  };

  return (
    <div className="App overflow-x-hidden min-h-screen">
      {isLoggedIn ? (
        <LandingPage onLogout={handleLogout} user={user} />
      ) : (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
