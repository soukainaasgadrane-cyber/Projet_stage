import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Rapprochement() {
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reconciliations').then(res => {
      setReconciliations(res.data.data);
      setLoading(false);
    });
  }, []);

  const handleAutoMatch = async (id) => {
    await api.post(`/reconciliations/${id}/auto-match`);
    toast.success('Rapprochement automatique effectué');
    // recharger
  };

  const columns = [
    { header: 'Compte', accessor: (row) => row.bank_account?.bank_name },
    { header: 'Période', accessor: (row) => `${row.start_date} → ${row.end_date}` },
    { header: 'Solde relevé', accessor: (row) => `${row.statement_balance} MAD` },
    { header: 'Solde système', accessor: (row) => `${row.system_balance} MAD` },
    { header: 'Statut', accessor: 'status' },
    {
      header: 'Actions',
      accessor: (row) => (
        <button onClick={() => handleAutoMatch(row.id)} className="bg-green-600 text-white px-3 py-1 rounded">Auto-match</button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Rapprochements bancaires</h2>
      <DataTable columns={columns} data={reconciliations} loading={loading} />
    </div>
  );
}