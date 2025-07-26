import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { getUserRole } from "../utils/getUserRole";

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user;
      setUser(currentUser);
      if (currentUser) {
        const fetchedRole = await getUserRole(currentUser.id);
        setRole(fetchedRole);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!role || !user) return;

    const fetchProjects = async () => {
      let query = supabase.from("projects").select("*");

      if (role === "student") {
        query = query.eq("owner_id", user.id);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Fehler beim Abrufen der Projekte:", error);
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
        <p>
          Angemeldete Rolle: <strong>{role}</strong>
        </p>
      )}
      <ul className="mt-4 space-y-4">
        {projects.map((proj) => (
          <li key={proj.id} className="bg-gray-100 rounded p-4 shadow">
            <p>
              <strong>Repo:</strong> {proj.repo_url}
            </p>
            <p>
              <strong>Status:</strong> {proj.status}
            </p>
            <p>
              <strong>Erstellt am:</strong>{" "}
              {new Date(proj.created_at).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
