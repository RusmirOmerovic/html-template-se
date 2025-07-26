import { useState } from 'react';
import { supabase } from '../supabaseClient';

const ProjectForm = ({ user }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [status, setStatus] = useState('in Arbeit');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.from('projects').insert([
      {
        repo_url: repoUrl,
        status: status,
        owner_id: user.id,
      },
    ]);

    if (error) {
      console.error('Fehler beim Einfügen:', error.message);
      setSuccess(false);
    } else {
      setRepoUrl('');
      setStatus('in Arbeit');
      setSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Neues Projekt hinzufügen</h2>

      <label className="block mb-2">
        Repository URL:
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
          required
        />
      </label>

      <label className="block mb-2">
        Status:
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          <option value="in Arbeit">in Arbeit</option>
          <option value="abgeschlossen">abgeschlossen</option>
        </select>
      </label>

      <button
        type="submit"
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Projekt speichern
      </button>

      {success && <p className="text-green-600 mt-2">✅ Projekt wurde gespeichert.</p>}
    </form>
  );
};

export default ProjectForm;

