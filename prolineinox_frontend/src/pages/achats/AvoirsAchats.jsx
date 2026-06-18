import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, DocumentArrowDownIcon, EyeIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function AvoirsAchats() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      const res = await api.get('/supplier-credit-notes', { params: { search } });
      setItems(res.data.data);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Référence', accessor: 'reference' },
    { header: 'Fournisseur', accessor: (row) => row.supplier?.name || '-' },
    { header: 'Date', accessor: 'date' },
    { header: 'Total', accessor: (row) => formatCurrency(row.total) },
    { header: 'Statut', accessor: 'status' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Link to={`/achats/avoirs-achats/${row.id}`} className="text-blue-600"><EyeIcon className="w-5 h-5" /></Link>
          <button className="text-indigo-600"><DocumentArrowDownIcon className="w-5 h-5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex justify-between">
        <h2 className="text-xl font-semibold">Avoirs d'achat</h2>
        <Link to="/achats/avoirs-achats/nouveau" className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Nouvel avoit
        </Link>
      </div>
      <div className="p-4">
        <input type="text" placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" />
        <DataTable columns={columns} data={items} loading={loading} />
      </div>
    </div>
  );
}