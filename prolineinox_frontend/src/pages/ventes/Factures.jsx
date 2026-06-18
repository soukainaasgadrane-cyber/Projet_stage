import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DocumentArrowDownIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/tables/DataTable';
import { deleteDocument, getDocumentPDF, getDocuments } from '../../services/salesService';
import { formatCurrency } from '../../utils/currency';
import { downloadPDF } from '../../utils/pdfExport';

const statusLabels = {
  brouillon: 'Brouillon',
  validee: 'Validée',
  acceptee: 'Acceptée',
  partielle: 'Partielle',
  livree: 'Livrée',
  expiree: 'Expirée',
  facturee: 'Facturée',
  annulee: 'Annulée',
};

export default function Factures() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [search]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await getDocuments({ type: 'invoice', search });
      setDocuments(res.data.data);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette facture ?')) {
      await deleteDocument(id);
      toast.success('Facture supprimée');
      fetchDocuments();
    }
  };

  const handlePDF = (id) => {
    downloadPDF(getDocumentPDF(id, 'invoice'), `facture_${id}.pdf`);
  };

  const columns = [
    { header: 'Référence', accessor: 'reference' },
    { header: 'Client', accessor: (row) => row.company?.name || '-' },
    { header: 'Date', accessor: 'document_date' },
    { header: 'Total', accessor: (row) => formatCurrency(row.total) },
    { header: 'Statut', accessor: (row) => statusLabels[row.status] || row.status || '-' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/ventes/factures/${row.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50"
            title="Modifier"
          >
            <PencilIcon className="h-4 w-4" />
            Modifier
          </Link>
          <button type="button" onClick={() => handlePDF(row.id)} className="text-indigo-600" title="Télécharger PDF">
            <DocumentArrowDownIcon className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => handleDelete(row.id)} className="text-red-600" title="Supprimer">
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-950">Factures</h2>
          <Link
            to="/ventes/factures/nouveau"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5" /> Nouvelle facture
          </Link>
        </div>
        <input
          type="text"
          placeholder="Rechercher par référence, client ou statut..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none"
        />
      </div>
      <div className="p-4">
        <DataTable columns={columns} data={documents} loading={loading} />
      </div>
    </div>
  );
}
