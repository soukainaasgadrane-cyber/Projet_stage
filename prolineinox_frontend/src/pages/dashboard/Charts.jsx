import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Charts({ monthlyCA = [], topArticles = [] }) {
  const monthlyData = (monthlyCA || []).map((value, idx) => ({
    month: months[idx] || `M${idx + 1}`,
    ca: Number(value) || 0,
  }));

  const safeTopArticles = (topArticles || []).map((item) => ({
    name: item?.name || item?.designation || 'Article',
    total_quantity: Number(item?.total_quantity || item?.quantity || 0),
  }));

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">CA mensuel</h2>
            <p className="text-sm text-slate-500">Évolution du chiffre d'affaires</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip formatter={(value) => `${Number(value || 0).toLocaleString('fr-MA')} MAD`} />
            <Legend />
            <Line type="monotone" dataKey="ca" stroke="#0891b2" name="CA" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Top articles vendus</h2>
            <p className="text-sm text-slate-500">Articles les plus demandés</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={safeTopArticles}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
            <YAxis tick={{ fill: '#475569', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="total_quantity" fill="#10b981" name="Quantité" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
