import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminReports } from '../../services/adminService';

export default function AdminReports() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);

  useEffect(() => {
    getAdminReports({ period })
      .then((res) => setData(res.data))
      .catch(() => toast.error('Erreur chargement rapports'));
  }, [period]);

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Rapports</h2>
            <p className="mt-1 text-sm text-slate-500">Rapport journalier ou mensuel.</p>
          </div>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value="day">Jour</option>
            <option value="month">Mois</option>
          </select>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ['Commandes', data?.orders || 0],
          ['Devis', data?.quotes || 0],
          ['Nouveaux clients', data?.new_clients || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-slate-950">{value}</p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">Top commercials par commandes</h3>
          <div className="mt-4 space-y-2">
            {(data?.top_commercials || []).map((row) => (
              <div key={row.commercial} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span>{row.commercial}</span>
                <span className="font-semibold">{row.total}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-slate-950">Commandes par mois</h3>
          <div className="mt-4 space-y-2">
            {(data?.orders_by_month || []).map((row) => (
              <div key={row.month} className="flex justify-between rounded-md bg-slate-50 p-3 text-sm">
                <span>Mois {row.month}</span>
                <span className="font-semibold">{row.total}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
