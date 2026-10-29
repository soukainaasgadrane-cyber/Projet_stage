import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowTrendingUpIcon, BanknotesIcon, BuildingOfficeIcon, DocumentTextIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAdminDashboard } from '../../services/adminService';
import { formatCurrency } from '../../utils/currency';

const emptyData = { sales_by_month: [], recent_activities: [], alerts: { expiring_quotes: [], overdue_orders: [], overdue_invoices: [] } };

export default function AdminDashboard() {
  const [data, setData] = useState(emptyData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then((response) => setData({ ...emptyData, ...response.data }))
      .catch(() => toast.error('Impossible de charger les indicateurs Admin.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600">Chargement des indicateurs réels…</div>;

  const kpis = [
    { label: 'Commerciaux actifs', value: data.commercials_active ?? 0, note: `${data.commercials_suspended ?? 0} suspendu(s) · ${data.commercials_blocked ?? 0} bloqué(s)`, icon: UserGroupIcon, color: 'text-cyan-700 bg-cyan-50' },
    { label: 'Clients', value: data.clients ?? 0, note: 'Sociétés enregistrées', icon: BuildingOfficeIcon, color: 'text-blue-700 bg-blue-50' },
    { label: 'Devis', value: data.quotes ?? 0, note: 'Tous statuts', icon: DocumentTextIcon, color: 'text-indigo-700 bg-indigo-50' },
    { label: 'Commandes', value: data.orders ?? 0, note: `${data.orders_pending ?? 0} en cours`, icon: ArrowTrendingUpIcon, color: 'text-violet-700 bg-violet-50' },
    { label: 'CA facturé', value: formatCurrency(data.revenue ?? 0), note: `${data.invoices ?? 0} facture(s) hors annulation`, icon: BanknotesIcon, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Paiements encaissés', value: formatCurrency(data.collected ?? 0), note: 'Transactions de type revenu', icon: BanknotesIcon, color: 'text-teal-700 bg-teal-50' },
  ];
  const alerts = [
    ...(data.alerts?.expiring_quotes || []),
    ...(data.alerts?.overdue_orders || []),
    ...(data.alerts?.overdue_invoices || []),
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-sky-950 to-cyan-900 p-6 text-white shadow-lg md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">INOXPROLINE · Supervision</p>
        <h2 className="mt-2 text-3xl font-bold">Vue d’ensemble de l’entreprise</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-200">Indicateurs calculés depuis les clients, documents et paiements enregistrés dans l’ERP.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((item) => {
          const Icon = item.icon;
          return <article key={item.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-medium text-slate-500">{item.label}</p><span className={`rounded-lg p-2 ${item.color}`}><Icon className="h-5 w-5" /></span></div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p><p className="mt-1 text-xs text-slate-500">{item.note}</p>
          </article>;
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4"><h3 className="font-semibold text-slate-950">Facturation et encaissements</h3><p className="text-sm text-slate-500">Six derniers mois, à partir des dates de facture et de transaction.</p></div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.sales_by_month || []} margin={{ top: 8, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} /><Legend />
                <Line type="monotone" dataKey="sales" name="Facturé" stroke="#0e7490" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="collected" name="Encaissé" stroke="#10b981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3"><span className="rounded-lg bg-amber-50 p-2 text-amber-700"><ExclamationTriangleIcon className="h-5 w-5" /></span><div><h3 className="font-semibold text-slate-950">Centre d’alertes</h3><p className="text-sm text-slate-500">Échéances à surveiller</p></div></div>
          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
            {alerts.length ? alerts.map((alert) => <div key={`${alert.title}-${alert.id}`} className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
              <p className="text-sm font-semibold text-slate-800">{alert.title} · {alert.reference}</p>
              <p className="mt-1 text-xs text-slate-600">{alert.client} · échéance {alert.due_date || 'non renseignée'} · {formatCurrency(alert.amount)}</p>
            </div>) : <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">Aucune échéance urgente détectée.</p>}
            {(data.commercials_blocked || 0) > 0 && <p className="rounded-lg border border-rose-100 bg-rose-50 p-3 text-sm text-rose-800">{data.commercials_blocked} compte(s) commercial(aux) bloqué(s).</p>}
          </div>
        </article>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4"><h3 className="font-semibold text-slate-950">Activité récente</h3><p className="text-sm text-slate-500">Connexions, documents et changements de comptes.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><th className="p-3">Utilisateur concerné</th><th className="p-3">Action</th><th className="p-3">Effectuée par</th><th className="p-3">Date</th></tr></thead>
          <tbody>{(data.recent_activities || []).length ? data.recent_activities.map((item) => <tr key={item.id} className="border-b border-slate-100 last:border-0"><td className="p-3 font-medium text-slate-800">{item.commercial}</td><td className="p-3 text-slate-700">{item.action}{item.reason ? ` · ${item.reason}` : ''}</td><td className="p-3 text-slate-600">{item.actor}</td><td className="p-3 text-slate-500">{item.date}</td></tr>) : <tr><td colSpan="4" className="p-6 text-center text-slate-500">Aucune activité enregistrée.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  );
}
