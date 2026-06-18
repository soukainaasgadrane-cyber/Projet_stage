import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [form, setForm] = useState({ 
    first_name: '', 
    last_name: '', 
    email: '', 
    password: '', 
    phone: '', 
    role: 'employee' 
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fullName = `${form.first_name} ${form.last_name}`.trim();

      const dataToSend = {
        first_name: form.first_name,
        last_name: form.last_name,
        name: fullName,
        email: form.email,
        phone: form.phone || '',
        role: form.role
      };

      if (!editing || form.password) {
        dataToSend.password = form.password;
      }

      if (editing) {
        await api.put(`/users/${editing.id}`, dataToSend);
        toast.success('Modifié avec succès');
      } else {
        await api.post('/users', dataToSend);
        toast.success('Créé avec succès');
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(errorMsg);
      console.error(err.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('Supprimé');
        fetchUsers();
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const columns = [
    { header: 'Nom', accessor: (row) => `${row.first_name} ${row.last_name}` },
    { header: 'Email', accessor: 'email' },
    { header: 'Téléphone', accessor: 'phone' },
    { header: 'Rôle', accessor: 'role' },
    { header: 'Actif', accessor: (row) => row.is_active ? 'Oui' : 'Non' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => { 
              setEditing(row); 
              setForm({
                first_name: row.first_name || '',
                last_name: row.last_name || '',
                email: row.email || '',
                phone: row.phone || '', 
                password: '', 
                role: row.role || 'employee'
              }); 
              setShowModal(true); 
            }} 
            className="text-blue-600 hover:text-blue-800"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button type="button" onClick={() => handleDelete(row.id)} className="text-red-600 hover:text-red-800">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      {/* الهيدر مع زر الإضافة المعدل */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Utilisateurs</h2>
        <button 
          type="button"
          onClick={(e) => { 
            e.preventDefault();
            setEditing(null); 
            setForm({ first_name: '', last_name: '', email: '', password: '', phone: '', role: 'employee' }); 
            setShowModal(true); 
          }} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
        >
          <PlusIcon className="w-5 h-5 pointer-events-none" /> 
          <span className="pointer-events-none">Ajouter</span>
        </button>
      </div>
      
      <div className="p-4">
        <DataTable columns={columns} data={users} loading={loading} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Modifier' : 'Nouvel'} utilisateur</h3>
            
            <form onSubmit={handleSubmit}>
              <input type="text" placeholder="Prénom" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              <input type="text" placeholder="Nom" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              
              <input 
                type="tel" 
                placeholder="Téléphone (Optionnel)" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})} 
                className="w-full border rounded px-3 py-2 mb-3" 
              />

              <input 
                type="password" 
                placeholder="Mot de passe" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})} 
                className="w-full border rounded px-3 py-2 mb-3" 
                minLength={10}
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{10,}"
                title="10 caracteres minimum avec majuscule, minuscule et chiffre"
                required={!editing}
              />
              <p className="mb-3 text-xs text-slate-500">
                Minimum 10 caracteres avec majuscule, minuscule et chiffre.
              </p>
              
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded px-3 py-2 mb-4">
                <option value="employee">Employé</option>
                <option value="admin">Administrateur</option>
              </select>
              
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
