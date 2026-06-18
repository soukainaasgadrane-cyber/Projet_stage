import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function FacturesRecurrentes() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    document_id: '',
    frequency: 'monthly',
    interval_count: 1,
    next_generation_date: '',
    end_date: '',
  });
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchSettings();
    fetchDocumentsList();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/recurring-invoices');
      setSettings(res.data.data);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentsList = async () => {
    const res = await api.get('/documents?type=invoice');
    setDocuments(res.data.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recurring-invoices', form);
      toast.success('Facture récurrente configurée');
      setShowModal(false);
      fetchSettings();
    } catch (err) {
      toast.error('Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette récurrence ?')) {
      await api.delete(`/recurring-invoices/${id}`);
      toast.success('Supprimée');
      fetchSettings();
    }
  };

  const columns = [
    { header: 'Facture modèle', accessor: (row) => row.document?.reference },
    { header: 'Fréquence', accessor: 'frequency' },
    { header: 'Intervalle', accessor: 'interval_count' },
    { header: 'Prochaine génération', accessor: 'next_generation_date' },
    { header: 'Fin', accessor: 'end_date' || 'Illimitée' },
    {
      header: 'Actions',
      accessor: (row) => <button onClick={() => handleDelete(row.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>,
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex justify-between">
        <h2 className="text-xl font-semibold">Factures récurrentes</h2>
        <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Configurer
        </button>
      </div>
      <div className="p-4">
        <DataTable columns={columns} data={settings} loading={loading} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-96">
            <h3 className="text-lg font-bold mb-4">Nouvelle récurrence</h3>
            <form onSubmit={handleSubmit}>
              <select
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.document_id}
                onChange={(e) => setForm({ ...form, document_id: e.target.value })}
                required
              >
                <option value="">Choisir une facture modèle</option>
                {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.reference}</option>)}
              </select>
              <select
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
              >
                <option value="monthly">Mensuelle</option>
                <option value="quarterly">Trimestrielle</option>
                <option value="yearly">Annuelle</option>
              </select>
              <input
                type="number"
                placeholder="Intervalle (ex: 1)"
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.interval_count}
                onChange={(e) => setForm({ ...form, interval_count: e.target.value })}
              />
              <input
                type="date"
                className="w-full border rounded px-3 py-2 mb-3"
                value={form.next_generation_date}
                onChange={(e) => setForm({ ...form, next_generation_date: e.target.value })}
                required
              />
              <input
                type="date"
                className="w-full border rounded px-3 py-2 mb-4"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                placeholder="Date de fin (optionnel)"
              />
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