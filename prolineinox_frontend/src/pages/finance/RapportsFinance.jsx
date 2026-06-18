// src/pages/finance/RapportsFinance.jsx
import { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { formatCurrency } from '../../utils/currency';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function RapportsFinance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchReport();
  }, [year]);

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports/finance', { params: { year } });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-10">Chargement des rapports financiers...</div>;
  if (!data) return <div className="text-center p-10 text-red-600">Erreur de chargement</div>;

  // Préparer les données pour les graphiques
  const monthlyCashflow = data.monthly_cashflow || [];
  const repartition = data.repartition || [];

  return (
    <div className="space-y-6">
      {/* Filtre année */}
      <div className="bg-white p-4 rounded shadow flex justify-between items-center">
        <h2 className="text-xl font-bold">Rapports financiers</h2>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Solde actuel</p>
          <p className="text-2xl font-bold text-indigo-600">{formatCurrency(data.current_balance)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Total encaissements (année)</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(data.total_income)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Total décaissements (année)</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(data.total_expense)}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 text-sm">Résultat net</p>
          <p className={`text-2xl font-bold ${data.net_result >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(data.net_result)}
          </p>
        </div>
      </div>

      {/* Graphique cashflow mensuel */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Cashflow mensuel (entrées / sorties)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={monthlyCashflow}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
            <Line type="monotone" dataKey="income" stroke="#10b981" name="Recettes" />
            <Line type="monotone" dataKey="expense" stroke="#ef4444" name="Dépenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Répartition par moyen de paiement */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Répartition des transactions par moyen de paiement</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={repartition}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {repartition.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(value)} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Historique des soldes */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Évolution du solde bancaire</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.balance_history || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="balance" fill="#3b82f6" name="Solde" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}