import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/tables/DataTable';
import { getAdminActivities, getAdminClients, getAdminOrders, getAdminQuotes } from '../../services/adminService';
import { getDocumentPDF } from '../../services/salesService';
import { formatCurrency } from '../../utils/currency';
import { downloadPDF } from '../../utils/pdfExport';

const config = {
  clients: {
    title: 'Clients',
    load: getAdminClients,
    columns: [
      { header: 'Nom', accessor: 'name' },
      { header: 'Email', accessor: (row) => row.email || '-' },
      { header: 'Telephone', accessor: (row) => row.phone || '-' },
      { header: 'Ville', accessor: (row) => row.city || '-' },
    ],
  },
  devis: {
    title: 'Devis',
    load: getAdminQuotes,
    columns: [
      { header: 'Reference', accessor: 'reference' },
      { header: 'Client', accessor: (row) => row.company?.name || '-' },
      { header: 'Date', accessor: 'document_date' },
      { header: 'Total', accessor: (row) => formatCurrency(row.total) },
      { header: 'Statut', accessor: 'status' },
      {
        header: 'PDF',
        accessor: (row) => (
          <button
            type="button"
            onClick={() => downloadPDF(getDocumentPDF(row.id, row.type), `devis_${row.id}.pdf`).catch(() => toast.error('Erreur PDF'))}
            className="rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white"
          >
            PDF
          </button>
        ),
      },
    ],
  },
  commandes: {
    title: 'Commandes',
    load: getAdminOrders,
    columns: [
      { header: 'Reference', accessor: 'reference' },
      { header: 'Client', accessor: (row) => row.company?.name || '-' },
      { header: 'Date', accessor: 'document_date' },
      { header: 'Total', accessor: (row) => formatCurrency(row.total) },
      { header: 'Statut', accessor: 'status' },
      { header: 'Cree par', accessor: (row) => row.creator?.name || row.created_by || '-' },
    ],
  },
  historique: {
    title: 'Historique',
    load: getAdminActivities,
    columns: [
      { header: 'Commercial', accessor: 'commercial' },
      { header: 'Action', accessor: 'action' },
      { header: 'Date', accessor: 'date' },
    ],
  },
};

export default function AdminReadOnlyTable({ type }) {
  const page = config[type];
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', date_from: '', date_to: '' });

  useEffect(() => {
    if (!page) return;

    setLoading(true);
    page.load(filters)
      .then((res) => setRows(res.data.data || res.data || []))
      .catch(() => toast.error('Erreur chargement'))
      .finally(() => setLoading(false));
  }, [page, filters]);

  if (!page) return <div className="rounded-lg bg-white p-6">Page inconnue</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">{page.title}</h2>
        <p className="mt-1 text-sm text-slate-500">Consultation uniquement.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            type="text"
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Rechercher..."
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          {(type === 'devis' || type === 'commandes') ? (
            <>
              <input
                type="text"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                placeholder="Statut..."
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={filters.date_from}
                onChange={(event) => setFilters((current) => ({ ...current, date_from: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={filters.date_to}
                onChange={(event) => setFilters((current) => ({ ...current, date_to: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </>
          ) : null}
        </div>
      </div>
      <DataTable columns={page.columns} data={rows} loading={loading} />
    </div>
  );
}
