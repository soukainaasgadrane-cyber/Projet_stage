import { useEffect, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';

export default function Historique() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/activity-logs').then(res => {
      setLogs(res.data.data);
      setLoading(false);
    });
  }, []);

  const columns = [
    { header: 'Utilisateur', accessor: (row) => row.user?.first_name + ' ' + row.user?.last_name },
    { header: 'Action', accessor: 'action' },
    { header: 'Modèle', accessor: 'model_type' },
    { header: 'ID enregistrement', accessor: 'model_id' },
    { header: 'IP', accessor: 'ip_address' },
    { header: 'Date', accessor: (row) => new Date(row.created_at).toLocaleString() },
  ];

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-xl font-bold mb-4">Historique des actions</h2>
      <DataTable columns={columns} data={logs} loading={loading} />
    </div>
  );
}