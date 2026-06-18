import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Grow() {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ user_id: '', objective: '', target_value: '', start_date: '', end_date: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchObjectives();
    api.get('/users').then(res => setUsers(res.data.data));
  }, []);

  const fetchObjectives = async () => {
    try {
      const res = await api.get('/grow');
      setObjectives(res.data.data);
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await api.put(`/grow/${editing.id}`, form);
      toast.success('Modifié');
    } else {
      await api.post('/grow', form);
      toast.success('Créé');
    }
    setShowModal(false);
    fetchObjectives();
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cet objectif ?')) {
      await api.delete(`/grow/${id}`);
      toast.success('Supprimé');
      fetchObjectives();
    }
  };

  const columns = [
    { header: 'Employé', accessor: (row) => row.user?.full_name },
    { header: 'Objectif', accessor: 'objective' },
    { header: 'Cible', accessor: (row) => `${row.target_value} MAD` },
    { header: 'Progression', accessor: (row) => `${row.current_value} / ${row.target_value}` },
    { header: 'Statut', accessor: 'status' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button onClick={() => { setEditing(row); setForm(row); setShowModal(true); }} className="text-blue-600"><PencilIcon className="w-5 h-5" /></button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex justify-between">
        <h2 className="text-xl font-bold">Objectifs collaborateurs (Grow)</h2>
        <button onClick={() => { setEditing(null); setForm({ user_id: '', objective: '', target_value: '', start_date: '', end_date: '' }); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Ajouter objectif
        </button>
      </div>
      <div className="p-4">
        <DataTable columns={columns} data={objectives} loading={loading} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Modifier' : 'Nouvel'} objectif</h3>
            <form onSubmit={handleSubmit}>
              <select className="w-full border rounded px-3 py-2 mb-3" value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} required>
                <option value="">Choisir un utilisateur</option>
                {users.map(u => <option value={u.id}>{u.first_name} {u.last_name}</option>)}
              </select>
              <input type="text" placeholder="Objectif (ex: CA mensuel)" value={form.objective} onChange={e => setForm({...form, objective: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              <input type="number" step="0.01" placeholder="Valeur cible (MAD)" value={form.target_value} onChange={e => setForm({...form, target_value: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full border rounded px-3 py-2 mb-4" required />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}