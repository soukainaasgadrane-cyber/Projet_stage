import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { exportAdminReports, getAdminReports } from '../../services/adminService';
import { formatCurrency } from '../../utils/currency';

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export default function AdminReports() {
  const [filters, setFilters] = useState({ period: 'month', date_from: '', date_to: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    const params = filters.date_from || filters.date_to
      ? { date_from: filters.date_from || filters.date_to, date_to: filters.date_to || filters.date_from }
      : { period: filters.period };
    getAdminReports(params).then((response) => setData(response.data)).catch(() => toast.error('Impossible de charger le rapport Admin.')).finally(() => setLoading(false));
  }, [filters]);

  const exportReport = async (format) => {
    setExporting(format);
    try {
      const params = filters.date_from || filters.date_to
        ? { date_from: filters.date_from || filters.date_to, date_to: filters.date_to || filters.date_from, format }
        : { period: filters.period, format };
      const response = await exportAdminReports(params);
      const extension = format === 'pdf' ? 'pdf' : 'csv';
      saveBlob(response.data, `rapport-admin-${data?.start || 'periode'}.${extension}`);
    } catch {
      toast.error(`Export ${format.toUpperCase()} indisponible.`);
    } finally { setExporting(''); }
  };

  const summary = [
    ['Devis', data?.quotes ?? 0], ['Commandes', data?.orders ?? 0], ['Factures', data?.invoices ?? 0],
    ['CA facturé', formatCurrency(data?.revenue ?? 0)], ['Encaissé', formatCurrency(data?.collected ?? 0)], ['Nouveaux clients', data?.new_clients ?? 0],
  ];

  return <div className="space-y-5">
    <section className="rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-900 p-6 text-white shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Pilotage</p><h2 className="mt-2 text-2xl font-bold">Rapports commerciaux</h2>
      <p className="mt-1 text-sm text-slate-200">Comparaison par période, commercial et indicateurs issus des documents réels.</p>
    </section>
    <section className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-xs font-semibold text-slate-500">Période prédéfinie<select value={filters.period} onChange={(event) => setFilters({ period: event.target.value, date_from: '', date_to: '' })} className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"><option value="day">Aujourd’hui</option><option value="month">Mois en cours</option><option value="year">Année en cours</option></select></label>
      <label className="text-xs font-semibold text-slate-500">Du<input type="date" value={filters.date_from} onChange={(event) => setFilters((current) => ({ ...current, period: 'custom', date_from: event.target.value }))} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
      <label className="text-xs font-semibold text-slate-500">Au<input type="date" value={filters.date_to} onChange={(event) => setFilters((current) => ({ ...current, period: 'custom', date_to: event.target.value }))} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm" /></label>
      <button type="button" disabled={!data || exporting !== ''} onClick={() => exportReport('pdf')} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{exporting === 'pdf' ? 'Export…' : 'Exporter PDF'}</button>
      <button type="button" disabled={!data || exporting !== ''} onClick={() => exportReport('csv')} className="rounded-lg border border-cyan-700 px-4 py-2 text-sm font-semibold text-cyan-800 disabled:opacity-50">{exporting === 'csv' ? 'Export…' : 'Exporter CSV / Excel'}</button>
    </section>
    <p className="text-sm text-slate-500">{loading ? 'Mise à jour…' : data ? `Période analysée : ${data.start} – ${data.end}` : ''}</p>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{summary.map(([label, value]) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-950">{loading ? '…' : value}</p></article>)}</section>

    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-950">Devis et commandes par mois</h3><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={data?.orders_by_month || []}><CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" /><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend /><Bar dataKey="quotes" name="Devis" fill="#0891b2" radius={[4, 4, 0, 0]} /><Bar dataKey="orders" name="Commandes" fill="#0f172a" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></article>
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h3 className="font-semibold text-slate-950">Classement par commandes</h3><p className="mt-1 text-xs text-slate-500">Conversion = devis ayant généré une commande ÷ devis créés sur la période.</p><div className="mt-4 space-y-2">{(data?.performance || []).slice(0, 8).map((row, index) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-900">{index + 1}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{row.name}</p><p className="text-xs text-slate-500">{row.quotes_count} devis · {row.orders_count} commandes</p></div></div><span className="shrink-0 text-sm font-bold text-slate-900">{row.conversion_rate}%</span></div>)}{!loading && !(data?.performance || []).length && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Aucune activité commerciale sur cette période.</p>}</div></article>
    </section>
  </div>;
}
