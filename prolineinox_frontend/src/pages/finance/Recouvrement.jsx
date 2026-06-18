import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { formatCurrency } from '../../utils/currency';
import { BellAlertIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Recouvrement() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnpaidInvoices();
  }, []);

  const fetchUnpaidInvoices = async () => {
    try {
      const res = await api.get('/recouvrement/unpaid');
      setInvoices(res.data);
    } catch (err) {
      toast.error('Erreur chargement factures impayées');
    } finally {
      setLoading(false);
    }
  };

  const handleRelance = async (id) => {
    try {
      await api.post(`/recouvrement/relance/${id}`);
      toast.success('Relance envoyée');
      fetchUnpaidInvoices(); // rafraîchir
    } catch {
      toast.error('Erreur lors de la relance');
    }
  };

  const columns = [
    { header: 'Référence', accessor: 'reference' },
    { header: 'Client', accessor: (row) => row.company?.name || '-' },
    { header: 'Date facture', accessor: 'document_date' },
    { header: 'Date échéance', accessor: 'due_date' },
    { header: 'Montant dû', accessor: (row) => formatCurrency(row.total) },
    { header: 'Statut', accessor: 'status' },
    {
      header: 'Action',
      accessor: (row) => (
        <button
          onClick={() => handleRelance(row.id)}
          className="bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 hover:bg-red-700"
        >
          <BellAlertIcon className="w-4 h-4" /> Relancer
        </button>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Recouvrement – Factures impayées</h2>
      <DataTable columns={columns} data={invoices} loading={loading} />
    </div>
  );
}