import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import ProjectForm from "../components/ProjectForm";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Rolle beim ersten Login erkennen und in DB schreiben
  const assignRoleIfMissing = async (user) => {
    const { data: existing, error: roleError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (roleError || !existing) {
      const email = user.email || "";
      const newRole = email.includes("@web.de") ? "tutor" : "student";

      const { error: insertError } = await supabase.from("user_roles").insert([
        {
          user_id: user.id,
          role: newRole,
        },
      ]);

      if (insertError) {
        console.error("Fehler beim Rollen-Insert:", insertError.message);
      } else {
        setRole(newRole);
      }
    } else {
      setRole(existing.role);
    }
  };

  // Session und Rolle holen
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
      await assignRoleIfMissing(currentUser);
    };

    fetchSession();
  }, []);

  // Projekte laden (für Studenten nur eigene)
  const fetchProjects = async () => {
    if (!role || !user?.id) return;

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

  useEffect(() => {
    fetchProjects();
  }, [role, user]);

  // Account und Daten löschen (ohne Admin-Zugang kein DeleteUser möglich!)
  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    // 1. Projekte löschen
    await supabase.from("projects").delete().eq("owner_id", user.id);

    // 2. Dateien löschen (nur falls du Bucket hast)
    await supabase.storage.from("project-files").remove([`user/${user.id}/`]);

    // 3. user_roles löschen
    await supabase.from("user_roles").delete().eq("user_id", user.id);

    // 4. Benutzer-Session invalidieren (Löschen geht nur mit Service Key!)
    alert("Account-Inhalte gelöscht. Bitte manuell aus Supabase löschen.");
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {role && (
        <p className="mb-2">
          Angemeldet als: <strong>{role}</strong>
        </p>
      )}

      {user && (
        <>
          <ProjectForm user={user} onProjectSaved={fetchProjects} />
          <button
            onClick={handleDeleteAccount}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
          >
            🚨 Account löschen
          </button>
        </>
      )}

      {projects.length > 0 ? (
        <ul className="space-y-4 mt-6">
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
                {new Date(proj.created_at).toLocaleString("de-DE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4">🔎 Keine Projekte gefunden.</p>
      )}
    </div>
  );
};

export default Dashboard;
