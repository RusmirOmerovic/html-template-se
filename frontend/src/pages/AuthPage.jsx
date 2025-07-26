import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginRoute = location.pathname === "/login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const { error } = isLoginRoute
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4">
          {isLoginRoute ? "Login" : "Registrieren"}
        </h2>

        {error && <p className="text-red-500 mb-3">{error}</p>}

        <label className="block mb-3">
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border mt-1 rounded"
            required
          />
        </label>

        <label className="block mb-4">
          Passwort:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border mt-1 rounded"
            required
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          {isLoginRoute ? "Einloggen" : "Registrieren"}
        </button>

        <p className="mt-4 text-center">
          {isLoginRoute ? "Noch kein Account?" : "Schon registriert?"}{" "}
          <button
            type="button"
            className="text-blue-600 underline"
            onClick={() => navigate(isLoginRoute ? "/register" : "/login")}
          >
            {isLoginRoute ? "Registrieren" : "Login"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
