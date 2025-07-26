import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getUserRole } from "../utils/getUserRole";
import ProjectForm from "../components/ProjectForm";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Authentifizierten Nutzer + Rolle abrufen
  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        console.error("Keine gültige Session gefunden.");
        return;
      }

      const currentUser = session.user;
      setUser(currentUser);

      const fetchedRole = await getUserRole(currentUser.id);
      setRole(fetchedRole);
    };

    fetchSession();
  }, []);

  // Projekte basierend auf Rolle laden
  useEffect(() => {
    const fetchProjects = async () => {
      if (!role || !user) return;

      let query = supabase.from("projects").select("*");

      if (role === "student") {
        query = query.eq("owner_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fehler beim Abrufen der Projekte:", error.message);
      } else {
        setProjects(data);
      }
    };

    fetchProjects();
  }, [role, user]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {role && (
        <p className="mb-2">
          Angemeldet als: <strong>{role}</strong>
        </p>
      )}
      {projects.length > 0 ? (
        <ul className="space-y-4">
          {user && <ProjectForm user={user} />}
          {projects.map((proj) => (
            <li key={proj.id} className="bg-white rounded shadow p-4">
              <p>
                <strong>📁 Repo:</strong>{" "}
                <a
                  href={proj.repo_url}
                  className="text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {proj.repo_url}
                </a>
              </p>
              <p>
                <strong>📌 Status:</strong> {proj.status}
              </p>
              <p>
                <strong>🕓 Erstellt:</strong>{" "}
                {new Date(proj.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>🔎 Keine Projekte gefunden.</p>
      )}
    </div>
  );
};

export default Dashboard;
