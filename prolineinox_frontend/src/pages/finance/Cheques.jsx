import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { formatCurrency } from '../../utils/currency';

export default function Cheques() {
  const [cheques, setCheques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cheques').then(res => {
      setCheques(res.data.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'N° chèque', accessor: 'cheque_number' },
    { header: 'Émetteur', accessor: (row) => row.company?.name },
    { header: 'Montant', accessor: (row) => formatCurrency(row.amount) },
    { header: 'Date échéance', accessor: 'due_date' },
    { header: 'Statut', accessor: 'status' },
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Chèques</h2>
      <DataTable columns={columns} data={cheques} loading={loading} />
    </div>
  );
}