import { useEffect, useState } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RapportsCatalogue() {
  const [lowStock, setLowStock] = useState([]);
  const [topStock, setTopStock] = useState([]);

  useEffect(() => {
    api.get('/reports/inventory').then(res => {
      setLowStock(res.data.low_stock);
      setTopStock(res.data.top_stock);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Articles en stock faible</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lowStock}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock_quantity" fill="#ff7300" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Top articles (stock)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topStock}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="stock_quantity" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}