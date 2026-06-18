import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // وضعنا قيم بدئية فارغة لتفادي أي مشاكل في الـ inputs
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

  const navigate = useNavigate();

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
    e.preventDefault(); // كتحبس الصفحة باش ما ديرش Refresh
    
    console.log("Submit clicked! Data to send:", form); // هاد السطر باش نتأكدو فـ الـ Console باللي الزر تضغط

    try {
      const fullName = `${form.first_name} ${form.last_name}`.trim();

      const dataToSend = {
        first_name: form.first_name,
        last_name: form.last_name,
        name: fullName,
        email: form.email,
        phone: form.phone || '', // صيفط قيمة فارغة على الأقل إذا ما دخلهاش المستخدم
        role: form.role
      };

      // كنصيفطو الباسورد فقط إلا كان مستخدم جديد أو كتب فيه شي حاجة فـ التعديل
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
      console.error("Axios Error Details:", err.response?.data);
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
            className="text-blue-600"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex justify-between">
        <h2 className="text-xl font-bold">Sociétés</h2>
        <button 
          onClick={() => navigate('/crm/companies/new')}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Ajouter
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
              {/* حقول الإدخال */}
              <input type="text" placeholder="Prénom" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              <input type="text" placeholder="Nom" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded px-3 py-2 mb-3" required />
              
              {/* حيدنا required من الهاتف باش ما يبلوكيش الزر إلا بغيتي تخليه خاوي */}
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
                required={!editing} // مطلوب فقط عند إنشاء مستخدم جديد
              />
              
              <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded px-3 py-2 mb-4">
                <option value="employee">Employé</option>
                <option value="admin">Administrateur</option>
              </select>
              
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                {/* تأكيد نوع الزر submit */}
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