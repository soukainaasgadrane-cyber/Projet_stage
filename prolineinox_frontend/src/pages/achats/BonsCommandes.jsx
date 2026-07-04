import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowPathIcon, DocumentArrowDownIcon, EyeIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/tables/DataTable';
import { convertDocument, getDocumentPDF, getDocuments } from '../../services/salesService';
import { formatCurrency } from '../../utils/currency';
import { downloadPDF } from '../../utils/pdfExport';

export default function BonsCommandes() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDocuments({ type: 'purchase_order', search });
      setItems(res.data.data || []);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handlePDF = async (row) => {
    try {
      await downloadPDF(getDocumentPDF(row.id, row.type), `bon_commande_achat_${row.id}.pdf`);
    } catch (err) {
      toast.error('Erreur telechargement PDF');
    }
  };

  const handleConvert = async (row) => {
    try {
      const res = await convertDocument(row.id, 'receipt_note', {
        document_date: new Date().toISOString().slice(0, 10),
        subject: row.subject || null,
      });
      const document = res.data.data || res.data;
      toast.success('Bon de commande converti en bon de reception');
      navigate(`/achats/bon-reception/${document.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Conversion impossible');
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
          <Link to={`/achats/bons-commandes/${row.id}`} className="text-blue-600" title="Consulter">
            <EyeIcon className="h-5 w-5" />
          </Link>
          <button type="button" onClick={() => handleConvert(row)} className="text-cyan-600" title="Convertir en bon de reception">
            <ArrowPathIcon className="h-5 w-5" />
          </button>
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
        <h2 className="text-xl font-semibold">Bons de commande achat</h2>
        <Link to="/achats/bons-commandes/nouveau" className="flex items-center gap-2 rounded bg-indigo-600 px-4 py-2 text-white">
          <PlusIcon className="h-5 w-5" /> Nouveau bon
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
