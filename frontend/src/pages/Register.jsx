import { useState } from "react";
import { supabase } from "../supabaseClient";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error("Registrierung fehlgeschlagen:", error.message);
      setMessage("❌ Registrierung fehlgeschlagen");
      return;
    }

    if (data?.user) {
      const userId = data.user.id;
      const domain = email.split("@")[1];
      let role = "student";

      if (domain === "web.de") {
        role = "tutor"; // TESTROLLENLOGIK
      }

      const { error: insertError } = await supabase.from("user_roles").insert([
        {
          user_id: userId,
          role,
        },
      ]);

      if (insertError) {
        console.error(
          "Rolle konnte nicht gespeichert werden:",
          insertError.message
        );
        setMessage("⚠️ Registrierung erfolgreich, aber Rolle fehlt.");
      } else {
        setMessage(`✅ Registrierung erfolgreich – Rolle: ${role}`);
      }
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-10 bg-white p-6 shadow rounded"
    >
      <h2 className="text-xl font-bold mb-4">Registrieren</h2>

      <label className="block mb-2">
        E-Mail-Adresse:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-4">
        Passwort:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Registrieren
      </button>

      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </form>
  );
};

export default Register;
