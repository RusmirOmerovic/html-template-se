import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Nutzer direkt beim Start holen
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listener für Login / Logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Aufräumen beim Verlassen der Komponente
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard />
              ) : (
                <p className="text-center mt-10 text-red-500">
                  🔒 Zugriff nur mit Login
                </p>
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
