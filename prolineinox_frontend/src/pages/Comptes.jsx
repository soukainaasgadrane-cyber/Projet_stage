import { useEffect, useState } from 'react';
import api from '../services/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Comptes() {
  const [comptes, setComptes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // الـ State الخاص بالفورم ديال الشركات
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/companies');
      // التعامل مع اختلاف بنية الترجيع من الباكيند
      setComptes(res.data.data || res.data || []);
    } catch (err) {
      toast.error('Erreur lors du chargement des comptes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/companies/${editing.id}`, form);
        toast.success('Compte modifié avec succès');
      } else {
        await api.post('/companies', form);
        toast.success('Compte créé avec succès');
      }
      setShowModal(false);
      fetchCompanies(); // إعادة تحميل البيانات بعد الحفظ
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur lors de l'enregistrement";
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce compte ?')) {
      try {
        await api.delete(`/companies/${id}`);
        toast.success('Compte supprimé');
        fetchCompanies();
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  // تصفية الشركات بناءً على البحث بالاسم أو الإيميل أو الهاتف
  const filteredComptes = comptes.filter(compte => 
    compte.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compte.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    compte.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded shadow-md p-6">
      
      {/* 1. الهيدر مع العنوان وزر إضافة شركة جديد */}
      <div className="border-b pb-4 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Comptes (Sociétés)</h2>
          <p className="text-sm text-slate-500">Gérer la liste des entreprises</p>
        </div>
        
        {/* زر Ajouter المعدل والمقاوم لأخطاء التفاعل */}
        <button 
          type="button"
          onClick={() => { 
            setEditing(null); 
            setForm({ name: '', email: '', phone: '' }); 
            setShowModal(true); 
          }} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors cursor-pointer"
        >
          <PlusIcon className="w-5 h-5 pointer-events-none" /> 
          <span className="pointer-events-none font-medium">Ajouter</span>
        </button>
      </div>

      {/* 2. شريط البحث الفعال */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Rechercher par nom, email ou téléphone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-slate-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* 3. جدول عرض البيانات */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-3 text-left font-semibold text-slate-600 text-sm">Nom</th>
              <th className="p-3 text-left font-semibold text-slate-600 text-sm">Email</th>
              <th className="p-3 text-left font-semibold text-slate-600 text-sm">Téléphone</th>
              <th className="p-3 text-center font-semibold text-slate-600 text-sm">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-slate-500">Chargement...</td>
              </tr>
            ) : filteredComptes.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-6 text-slate-500">Aucun résultat trouvé</td>
              </tr>
            ) : (
              filteredComptes.map((compte) => (
                <tr key={compte.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-3 text-slate-800 font-medium">{compte.name}</td>
                  <td className="p-3 text-slate-600">{compte.email || '-'}</td>
                  <td className="p-3 text-slate-600">{compte.phone || '-'}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          setEditing(compte);
                          setForm({
                            name: compte.name || '',
                            email: compte.email || '',
                            phone: compte.phone || ''
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Modifier"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(compte.id)} 
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Supprimer"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. الـ Modal المنبثق لإدخال البيانات وتعديلها */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96 shadow-lg transform transition-all">
            <h3 className="text-lg font-bold mb-4 text-slate-800">{editing ? 'Modifier' : 'Nouvel'} Entreprise</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Nom de l'entreprise</label>
                <input 
                  type="text" 
                  placeholder="Nom de l'entreprise" 
                  value={form.name} 
                  onChange={e => setForm({...form, name: e.target.value})} 
                  className="w-full border rounded px-3 py-2" 
                  required 
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email de contact</label>
                <input 
                  type="email" 
                  placeholder="Email (Ex: contact@entreprise.com)" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Numéro de téléphone</label>
                <input 
                  type="tel" 
                  placeholder="Téléphone" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  className="w-full border rounded px-3 py-2" 
                />
              </div>
              
              <div className="flex justify-end gap-2 border-t pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
                >
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