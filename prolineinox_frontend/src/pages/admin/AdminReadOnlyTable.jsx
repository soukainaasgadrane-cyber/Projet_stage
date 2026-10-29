import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DataTable from '../../components/tables/DataTable';
import { getAdminActivities, getAdminClients, getAdminInvoices, getAdminOrders, getAdminPayments, getAdminQuotes } from '../../services/adminService';
import { getDocumentPDF } from '../../services/salesService';
import { formatCurrency } from '../../utils/currency';
import { downloadPDF } from '../../utils/pdfExport';

const config = {
  clients: { title: 'Clients', load: getAdminClients, columns: [
    { header: 'Nom', accessor: 'name' }, { header: 'Email', accessor: (row) => row.email || '—' },
    { header: 'Téléphone', accessor: (row) => row.phone || '—' }, { header: 'Ville', accessor: (row) => row.city || '—' },
    { header: 'Documents', accessor: (row) => row.documents_count ?? '—' },
  ] },
  devis: { title: 'Devis', load: getAdminQuotes, document: true, columns: [
    { header: 'Référence', accessor: 'reference' }, { header: 'Client', accessor: (row) => row.company?.name || '—' },
    { header: 'Date', accessor: (row) => row.document_date || '—' }, { header: 'Validité', accessor: (row) => row.due_date || '—' },
    { header: 'Total', accessor: (row) => formatCurrency(row.total) }, { header: 'Statut', accessor: 'status' },
    { header: 'Créé par', accessor: (row) => row.creator?.name || '—' },
    { header: 'Actions', accessor: (row) => <button type="button" onClick={() => downloadPDF(getDocumentPDF(row.id, row.type), `devis_${row.id}.pdf`).catch(() => toast.error('Téléchargement PDF impossible.'))} className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800">PDF</button> },
  ] },
  commandes: { title: 'Commandes', load: getAdminOrders, document: true, columns: [
    { header: 'Référence', accessor: 'reference' }, { header: 'Client', accessor: (row) => row.company?.name || '—' },
    { header: 'Date', accessor: (row) => row.document_date || '—' }, { header: 'Échéance', accessor: (row) => row.due_date || '—' },
    { header: 'Total', accessor: (row) => formatCurrency(row.total) }, { header: 'Statut', accessor: 'status' },
    { header: 'Créé par', accessor: (row) => row.creator?.name || '—' },
    { header: 'Actions', accessor: (row) => <button type="button" onClick={() => downloadPDF(getDocumentPDF(row.id, row.type), `commande_${row.id}.pdf`).catch(() => toast.error('Téléchargement PDF impossible.'))} className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800">PDF</button> },
  ] },
  factures: { title: 'Factures', load: getAdminInvoices, document: true, paymentStatus: true, columns: [
    { header: 'Référence', accessor: 'reference' }, { header: 'Client', accessor: (row) => row.company?.name || '—' },
    { header: 'Date', accessor: (row) => row.document_date || '—' }, { header: 'Échéance', accessor: (row) => row.due_date || '—' },
    { header: 'Total', accessor: (row) => formatCurrency(row.total) }, { header: 'Paiement', accessor: (row) => row.payment_status || '—' },
    { header: 'Créé par', accessor: (row) => row.creator?.name || '—' },
    { header: 'Actions', accessor: (row) => <button type="button" onClick={() => downloadPDF(getDocumentPDF(row.id, row.type), `facture_${row.id}.pdf`).catch(() => toast.error('Téléchargement PDF impossible.'))} className="rounded-lg bg-cyan-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800">PDF</button> },
  ] },
  paiements: { title: 'Paiements encaissés', load: getAdminPayments, columns: [
    { header: 'Date', accessor: (row) => row.transaction_date || '—' }, { header: 'Référence', accessor: (row) => row.reference || row.transactionable?.reference || '—' },
    { header: 'Client', accessor: (row) => row.transactionable?.company?.name || '—' }, { header: 'Montant', accessor: (row) => formatCurrency(row.amount) },
    { header: 'Mode', accessor: (row) => row.payment_method || '—' }, { header: 'Description', accessor: (row) => row.description || '—' },
  ] },
  historique: { title: 'Historique / Audit', load: getAdminActivities, columns: [
    { header: 'Utilisateur concerné', accessor: (row) => row.commercial || '—' }, { header: 'Action', accessor: 'action' },
    { header: 'Effectuée par', accessor: (row) => row.actor || '—' }, { header: 'Motif', accessor: (row) => row.reason || '—' },
    { header: 'Date et heure', accessor: 'date' }, { header: 'Adresse IP', accessor: (row) => row.ip_address || '—' },
  ] },
};

export default function AdminReadOnlyTable({ type }) {
  const page = config[type];
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', date_from: '', date_to: '', page: 1 });

  useEffect(() => {
    if (!page) return;
    page.load(Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')))
      .then((response) => {
        const result = response.data;
        setRows(result.data || result || []);
        setPagination(result.current_page ? result : null);
      })
      .catch(() => toast.error(`Impossible de charger ${page.title.toLowerCase()}.`))
      .finally(() => setLoading(false));
  }, [page, filters]);

  if (!page) return <div className="rounded-xl bg-white p-6">Page Admin inconnue.</div>;
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? value : 1 }));

  return <div className="space-y-4">
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">Consultation Admin</p>
      <h2 className="mt-1 text-xl font-bold text-slate-950">{page.title}</h2>
      <p className="mt-1 text-sm text-slate-500">Accès en lecture seule aux données existantes. Aucune opération commerciale n’est disponible ici.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Rechercher…" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" />
        {page.document && <input type="text" value={page.paymentStatus ? filters.payment_status : filters.status} onChange={(event) => updateFilter(page.paymentStatus ? 'payment_status' : 'status', event.target.value)} placeholder={page.paymentStatus ? 'Statut de paiement…' : 'Statut du document…'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-700" />}
        {(page.document || type === 'paiements' || type === 'historique') && <>
          <input type="date" value={filters.date_from} onChange={(event) => updateFilter('date_from', event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="Date de début" />
          <input type="date" value={filters.date_to} onChange={(event) => updateFilter('date_to', event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" aria-label="Date de fin" />
        </>}
      </div>
    </section>
    <DataTable columns={page.columns} data={rows} loading={loading} />
    {pagination && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <span className="text-slate-500">{pagination.total} résultat(s) · page {pagination.current_page} / {pagination.last_page}</span>
      <div className="flex gap-2"><button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => updateFilter('page', pagination.current_page - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Précédent</button><button type="button" disabled={pagination.current_page >= pagination.last_page || loading} onClick={() => updateFilter('page', pagination.current_page + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40">Suivant</button></div>
    </div>}
  </div>;
}
