import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function Rapports() {
  const [rapport, setRapport] = useState(null);

  useEffect(() => {
    api.get('/reports/crm').then((res) => setRapport(res.data));
  }, []);

  if (!rapport) return <div className="p-6">Chargement...</div>;

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-bold">Rapports CRM</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Comptes</p>
          <p className="text-2xl font-bold">{rapport.companies_count}</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Contacts</p>
          <p className="text-2xl font-bold">{rapport.contacts_count}</p>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <p className="text-sm text-gray-500">Nouveaux clients 30j</p>
          <p className="text-2xl font-bold">{rapport.new_clients_30d}</p>
        </div>
      </div>
    </div>
  );
}
