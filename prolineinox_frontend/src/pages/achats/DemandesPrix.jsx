import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DocumentArrowDownIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/tables/DataTable';
import { getDocumentPDF, getDocuments } from '../../services/salesService';
import { formatCurrency } from '../../utils/currency';
import { downloadPDF } from '../../utils/pdfExport';

export default function DemandesPrix() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDocuments({ type: 'purchase_request', search });
      setItems(res.data.data || []);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async (row) => {
    try {
      await downloadPDF(getDocumentPDF(row.id, row.type), `demande_prix_${row.id}.pdf`);
    } catch (err) {
      toast.error('Erreur telechargement PDF');
    }
  };

  const columns = [
    { header: 'Reference', accessor: 'reference' },
    { header: 'Fournisseur', accessor: (row) => row.company?.name || '-' },
    { header: 'Date', accessor: 'document_date' },
    { header: 'Total', accessor: (row) => formatCurrency(row.total) },
    { header: 'Statut', accessor: 'status' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Link to={`/achats/demandes-prix/${row.id}`} className="text-blue-600" title="Consulter">
            <EyeIcon className="h-5 w-5" />
          </Link>
          <button type="button" onClick={() => handlePDF(row)} className="text-indigo-600" title="Telecharger PDF">
            <DocumentArrowDownIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded bg-white shadow">
      <div className="flex justify-between border-b p-4">
        <h2 className="text-xl font-semibold">Demandes de prix</h2>
        <Link to="/achats/demandes-prix/nouveau" className="flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-white">
          <PlusIcon className="h-5 w-5" /> Nouvelle demande
        </Link>
      </div>
      <div className="p-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="mb-4 w-full rounded border px-3 py-2"
        />
        <DataTable columns={columns} data={items} loading={loading} />
      </div>
    </div>
  );
}
