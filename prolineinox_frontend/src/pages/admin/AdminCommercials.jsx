import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/tables/DataTable';
import { activateCommercial, blockCommercial, getAdminCommercials } from '../../services/adminService';

export default function AdminCommercials() {
  const [commercials, setCommercials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCommercials = async () => {
    setLoading(true);
    try {
      const res = await getAdminCommercials({ search });
      setCommercials(res.data || []);
    } catch (err) {
      toast.error('Erreur chargement commercials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommercials();
  }, [search]);

  const setActive = async (user) => {
    try {
      if (user.is_active) {
        await blockCommercial(user.id);
        toast.success('Commercial bloque');
      } else {
        await activateCommercial(user.id);
        toast.success('Commercial active');
      }
      fetchCommercials();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action impossible');
    }
  };

  const columns = [
    { header: 'Nom', accessor: (row) => row.name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || '-' },
    { header: 'Email', accessor: 'email' },
    { header: 'Derniere connexion', accessor: (row) => row.last_login_at || '-' },
    {
      header: 'Statut',
      accessor: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {row.is_active ? 'Actif' : 'Bloque'}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <button
          type="button"
          onClick={() => setActive(row)}
          className={`rounded-md px-3 py-1.5 text-sm font-semibold text-white ${row.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
        >
          {row.is_active ? 'Bloquer' : 'Activer'}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Liste des commercials</h2>
        <p className="mt-1 text-sm text-slate-500">Bloquer ou activer les comptes commerciaux.</p>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher un commercial..."
          className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none"
        />
      </div>
      <DataTable columns={columns} data={commercials} loading={loading} />
    </div>
  );
}
