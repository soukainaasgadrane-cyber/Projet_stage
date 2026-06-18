import { useEffect, useState } from 'react';
import { getCompanies, createCompany, deleteCompany } from '../../services/crmService';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const emptyCompany = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Maroc',
  tax_number: '',
};

export default function Accounts() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyCompany);

  useEffect(() => {
    fetchCompanies();
  }, [search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await getCompanies({ search });
      setCompanies(res.data.data || []);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyCompany);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      await createCompany(form);
      toast.success('Compte ajoute');
      closeModal();
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ?')) {
      await deleteCompany(id);
      toast.success('Supprime');
      fetchCompanies();
    }
  };

  const columns = [
    { header: 'Nom', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Telephone', accessor: 'phone' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button className="text-blue-600"><PencilIcon className="w-5 h-5" /></button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Comptes (Sociétés)</h2>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Ajouter
        </button>
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />
        <DataTable columns={columns} data={companies} loading={loading} />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Ajouter un compte</h3>
            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Nom societe" className="rounded border px-3 py-2 md:col-span-2" required />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="rounded border px-3 py-2" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telephone" className="rounded border px-3 py-2" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="Ville" className="rounded border px-3 py-2" />
              <input name="country" value={form.country} onChange={handleChange} placeholder="Pays" className="rounded border px-3 py-2" />
              <input name="tax_number" value={form.tax_number} onChange={handleChange} placeholder="ICE / Identifiant fiscal" className="rounded border px-3 py-2 md:col-span-2" />
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="Adresse" rows={3} className="rounded border px-3 py-2 md:col-span-2" />

              <div className="mt-2 flex justify-end gap-2 md:col-span-2">
                <button type="button" onClick={closeModal} className="rounded border px-4 py-2">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:opacity-60">
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
