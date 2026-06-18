import { useEffect, useState } from 'react';
import api from '../services/api';

export default function TestDebug() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/companies')
      .then(res => setData(res.data))
      .catch(err => console.error('API error', err));
  }, []);

  return (
    <div>
      <h1>Test Debug</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}