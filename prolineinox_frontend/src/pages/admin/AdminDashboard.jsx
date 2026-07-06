import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminDashboard } from '../../services/adminService';

const defaultStats = {
  commercials: 0,
  clients: 0,
  orders: 0,
  quotes: 0,
  recent_activities: [],
};

export default function AdminDashboard() {
  const [data, setData] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then((res) => setData({ ...defaultStats, ...res.data }))
      .catch(() => toast.error('Erreur chargement dashboard admin'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="rounded-lg bg-white p-6 text-slate-600">Chargement...</div>;

  const cards = [
    { label: 'Commercials', value: data.commercials },
    { label: 'Clients', value: data.clients },
    { label: 'Commandes', value: data.orders },
    { label: 'Devis', value: data.quotes },
    { label: 'Commandes terminees', value: data.orders_done },
    { label: 'Commandes en attente', value: data.orders_pending },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Admin</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Vue simple pour suivre les commerciaux, clients, devis et commandes.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-3xl font-bold text-slate-950">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-950">Notifications</h3>
          <div className="mt-4 space-y-3">
            {(data.notifications || []).length ? data.notifications.map((item) => (
              <div key={item.id} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-800">{item.action}</p>
                <p className="text-slate-500">{item.commercial} - {item.date}</p>
              </div>
            )) : <p className="text-sm text-slate-500">Aucune notification</p>}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-950">Dernieres operations</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border border-slate-200 text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="border border-slate-200 p-2">Commercial</th>
                <th className="border border-slate-200 p-2">Action</th>
                <th className="border border-slate-200 p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_activities.length ? data.recent_activities.map((item) => (
                <tr key={item.id}>
                  <td className="border border-slate-200 p-2">{item.commercial}</td>
                  <td className="border border-slate-200 p-2">{item.action}</td>
                  <td className="border border-slate-200 p-2">{item.date}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="p-4 text-center text-slate-500">Aucune activite</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </section>
    </div>
  );
}
