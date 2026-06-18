import { useEffect, useState } from 'react';
import { getDocuments, deleteDocument, getDocumentPDF } from '../../services/salesService';
import DataTable from '../../components/tables/DataTable';
import { PlusIcon, DocumentArrowDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';
import { downloadPDF } from '../../utils/pdfExport';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Avoirs() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [search]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await getDocuments({ type: 'credit_note', search });
      setDocuments(res.data.data);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cet avoir ?')) {
      await deleteDocument(id);
      toast.success('Supprimée');
      fetchDocuments();
    }
  };

  const handlePDF = (id) => {
    downloadPDF(getDocumentPDF(id, 'credit_note'), `credit_note_${id}.pdf`);
  };

  const columns = [
    { header: 'Référence', accessor: 'reference' },
    { header: 'Client', accessor: (row) => row.company?.name || '-' },
    { header: 'Date', accessor: 'document_date' },
    { header: 'Total', accessor: (row) => formatCurrency(row.total) },
    { header: 'Statut', accessor: 'status' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <Link to={`/ventes/avoirs/${row.id}`} className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-2 py-1 text-sm font-medium text-blue-700 hover:bg-blue-50"><PencilIcon className="h-4 w-4" /> Modifier</Link>
          <button onClick={() => handlePDF(row.id)} className="text-indigo-600"><DocumentArrowDownIcon className="w-5 h-5" /></button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Avoirs</h2>
        <Link to="/ventes/avoirs/nouveau" className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Nouvel avoir
        </Link>
      </div>
      <div className="p-4">
        <input
          type="credit_note"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />
        <DataTable columns={columns} data={documents} loading={loading} />
      </div>
    </div>
  );
}
