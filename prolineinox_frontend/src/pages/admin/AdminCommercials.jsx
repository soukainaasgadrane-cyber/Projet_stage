import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { activateCommercial, blockCommercialWithReason, getAdminCommercials, suspendCommercial } from '../../services/adminService';

const statusMeta = {
  active: { label: 'Actif', classes: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  suspended: { label: 'Suspendu', classes: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  blocked: { label: 'Bloqué', classes: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
};

export default function AdminCommercials() {
  const [commercials, setCommercials] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1 });
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ''));
    getAdminCommercials(params)
      .then(({ data }) => { setCommercials(data.data || []); setPagination(data); })
      .catch(() => toast.error('Impossible de charger la liste des commerciaux.'))
      .finally(() => setLoading(false));
  }, [filters]);

  const openAction = (user, nextAction) => { setSelected(user); setAction(nextAction); setReason(''); };
  const closeAction = () => { if (!saving) { setSelected(null); setAction(null); setReason(''); } };
  const confirmAction = async (event) => {
    event.preventDefault();
    if (!selected || !action) return;
    setSaving(true);
    try {
      if (action === 'block') await blockCommercialWithReason(selected.id, reason.trim());
      else if (action === 'suspend') await suspendCommercial(selected.id, reason.trim());
      else await activateCommercial(selected.id);
      toast.success(action === 'active' ? 'Compte réactivé.' : action === 'block' ? 'Compte bloqué et sessions révoquées.' : 'Compte suspendu et sessions révoquées.');
      closeAction();
      setFilters((current) => ({ ...current }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action impossible.');
    } finally {
      setSaving(false);
    }
  };

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  const displayName = (user) => user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
  const actionTitle = action === 'block' ? 'Bloquer le compte' : action === 'suspend' ? 'Suspendre le compte' : 'Réactiver le compte';

  return <div className="space-y-5">
    <section className="rounded-2xl bg-gradient-to-r from-slate-950 to-cyan-900 p-6 text-white shadow-lg">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200">Équipe commerciale</p>
      <h2 className="mt-2 text-2xl font-bold">Gestion des commerciaux</h2>
      <p className="mt-1 text-sm text-slate-200">Consultez les comptes, les performances et les dernières connexions. Les actions de statut sont auditées.</p>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <input type="search" value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Rechercher un nom, un email ou un téléphone…" className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" />
        <select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
          <option value="">Tous les statuts</option><option value="active">Actif</option><option value="suspended">Suspendu</option><option value="blocked">Bloqué</option>
        </select>
      </div>
    </section>
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="p-3">Commercial</th><th className="p-3">Statut</th><th className="p-3">Dernière connexion</th><th className="p-3">Devis</th><th className="p-3">Commandes</th><th className="p-3">Taux de conversion</th><th className="p-3">Actions</th></tr></thead>
        <tbody>{loading ? <tr><td colSpan="7" className="p-8 text-center text-slate-500">Chargement…</td></tr> : commercials.length ? commercials.map((user) => {
          const status = statusMeta[user.account_status] || statusMeta.active;
          return <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <td className="p-3"><button type="button" onClick={() => setSelected(user)} className="text-left"><span className="block font-semibold text-slate-900 hover:text-cyan-800">{displayName(user)}</span><span className="text-xs text-slate-500">{user.email}</span></button></td>
            <td className="p-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.classes}`}>{status.label}</span></td>
            <td className="p-3 text-slate-600">{user.last_login_at ? new Date(user.last_login_at).toLocaleString('fr-FR') : 'Jamais connecté'}</td>
            <td className="p-3 tabular-nums">{user.quotes_count}</td><td className="p-3 tabular-nums">{user.orders_count}</td><td className="p-3 tabular-nums">{user.conversion_rate}%</td>
            <td className="p-3"><div className="flex gap-2">{user.account_status === 'active' ? <><button type="button" onClick={() => openAction(user, 'suspend')} className="rounded-lg border border-amber-300 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-50">Suspendre</button><button type="button" onClick={() => openAction(user, 'block')} className="rounded-lg border border-rose-300 px-2.5 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-50">Bloquer</button></> : <button type="button" onClick={() => openAction(user, 'active')} className="rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800">Réactiver</button>}</div></td>
          </tr>;
        }) : <tr><td colSpan="7" className="p-8 text-center text-slate-500">Aucun commercial ne correspond aux filtres.</td></tr>}</tbody>
      </table></div>
      {pagination && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm"><span className="text-slate-500">{pagination.total} commercial(aux) · page {pagination.current_page} / {pagination.last_page}</span><div className="flex gap-2"><button type="button" disabled={pagination.current_page <= 1 || loading} onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Précédent</button><button type="button" disabled={pagination.current_page >= pagination.last_page || loading} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Suivant</button></div></div>}
    </section>

    {selected && !action && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="commercial-detail-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-cyan-700">Fiche commercial</p><h3 id="commercial-detail-title" className="mt-1 text-xl font-bold text-slate-950">{displayName(selected)}</h3></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100">Fermer</button></div>
      <dl className="mt-5 grid gap-3 sm:grid-cols-2">{[['Email', selected.email], ['Téléphone', selected.phone || '—'], ['Statut', statusMeta[selected.account_status]?.label || 'Actif'], ['Dernière connexion', selected.last_login_at ? new Date(selected.last_login_at).toLocaleString('fr-FR') : 'Jamais connecté'], ['Devis', selected.quotes_count], ['Commandes', selected.orders_count], ['Taux de conversion', `${selected.conversion_rate}%`], ['Motif', selected.account_status_reason || '—']].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd></div>)}</dl>
    </section></div>}

    {selected && action && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"><form onSubmit={confirmAction} role="dialog" aria-modal="true" aria-labelledby="commercial-action-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-700">Confirmation requise</p><h3 id="commercial-action-title" className="mt-1 text-xl font-bold text-slate-950">{actionTitle}</h3><p className="mt-2 text-sm text-slate-600">{displayName(selected)} · {selected.email}</p>
      {action !== 'active' && <label className="mt-4 block text-sm font-medium text-slate-700">Motif (obligatoire)<textarea required minLength="3" maxLength="1000" value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-cyan-700 focus:ring-2 focus:ring-cyan-100" placeholder="Indiquez le motif de cette décision" /></label>}
      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">{action === 'active' ? 'Le commercial pourra se connecter à nouveau.' : 'Toutes les sessions actives seront révoquées et l’action sera inscrite dans l’audit.'}</p>
      <div className="mt-5 flex justify-end gap-2"><button type="button" onClick={closeAction} disabled={saving} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Annuler</button><button type="submit" disabled={saving || (action !== 'active' && reason.trim().length < 3)} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Enregistrement…' : 'Confirmer'}</button></div>
    </form></div>}
  </div>;
}
