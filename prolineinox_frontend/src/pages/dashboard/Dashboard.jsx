import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import StatsCards from './StatsCards';
import Charts from './Charts';

const defaultDashboard = {
  chiffre_affaires: 248500,
  recettes: 216900,
  depenses: 139300,
  resultat: 77600,
  marge_percent: 31.2,
  monthly_ca: [12000, 18500, 22000, 25000, 31500, 28000, 33700, 40200, 37400, 0, 0, 0],
  top_articles: [
    { name: 'Garde-corps inox', total_quantity: 42 },
    { name: 'Escalier inox', total_quantity: 28 },
    { name: 'Table inox', total_quantity: 23 },
    { name: 'Rampe inox', total_quantity: 18 },
  ],
  counters: {
    comptes: 36,
    contacts: 84,
    devis: 19,
    factures: 14,
    cheques_pending: 7,
    articles: 128,
  },
};

export default function Dashboard() {
  const [data, setData] = useState(defaultDashboard);
  const [loading, setLoading] = useState(true);
  const [apiReady, setApiReady] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => {
        setData({ ...defaultDashboard, ...res.data });
        setApiReady(true);
      })
      .catch(() => {
        setData(defaultDashboard);
        setApiReady(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const counters = useMemo(
    () => [
      { label: 'Comptes CRM', value: data.counters?.comptes || 0 },
      { label: 'Contacts', value: data.counters?.contacts || 0 },
      { label: 'Devis ouverts', value: data.counters?.devis || 0 },
      { label: 'Factures', value: data.counters?.factures || 0 },
      { label: 'Chèques en attente', value: data.counters?.cheques_pending || 0 },
      { label: 'Articles catalogue', value: data.counters?.articles || 0 },
    ],
    [data],
  );

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">InoxProline ERP</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">Tableau de bord</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Vue globale sur le chiffre d'affaires, les recettes, les dépenses, le résultat et la marge.
            </p>
          </div>

          <span
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              apiReady ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
            }`}
          >
            {apiReady ? 'API connectée' : 'Mode aperçu'}
          </span>
        </div>
      </section>

      <StatsCards stats={data} />

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        {counters.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-950">{item.value}</p>
            <p className="mt-1 text-sm text-slate-500">{item.label}</p>
          </div>
        ))}
      </section>

      <Charts monthlyCA={data.monthly_ca} topArticles={data.top_articles} />
    </div>
  );
}
