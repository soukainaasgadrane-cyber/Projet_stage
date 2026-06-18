import { useEffect, useState } from 'react';
import api from '../api/axios';
import { DocumentIcon, DocumentTextIcon, TruckIcon, CreditCardIcon, ArrowPathIcon, DocumentDuplicateIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const documentTypes = [
  { key: 'quote', label: 'Devis', icon: DocumentTextIcon },
  { key: 'proforma', label: 'Facture Proforma', icon: DocumentDuplicateIcon },
  { key: 'order', label: 'Commandes', icon: DocumentIcon },
  { key: 'delivery_note', label: 'Bons livraison', icon: TruckIcon },
  { key: 'invoice', label: 'Factures', icon: CreditCardIcon },
  { key: 'credit_note', label: 'Avoirs', icon: ArrowPathIcon },
  { key: 'recurring_invoice', label: 'Factures récurrentes', icon: DocumentDuplicateIcon },
];

export default function Ventes() {
  const [activeType, setActiveType] = useState('quote');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, [activeType]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/documents?type=${activeType}`);
      setDocuments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = { draft: 'bg-gray-200', sent: 'bg-blue-200', approved: 'bg-green-200', partial: 'bg-yellow-200', paid: 'bg-indigo-200', cancelled: 'bg-red-200' };
    return <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || 'bg-gray-200'}`}>{status}</span>;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="border-b p-4 flex gap-2 flex-wrap">
        {documentTypes.map((type) => (
          <button
            key={type.key}
            onClick={() => setActiveType(type.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeType === type.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            <type.icon className="w-5 h-5" /> {type.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{documentTypes.find(t => t.key === activeType)?.label}</h2>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded">+ Nouveau</button>
        </div>

        {loading ? (
          <div>Chargement...</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr><th>Référence</th><th>Société</th><th>Date</th><th>Total</th><th>Statut</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {documents.map(doc => (
                <tr key={doc.id}>
                  <td>{doc.reference}</td>
                  <td>{doc.company?.name}</td>
                  <td>{doc.document_date}</td>
                  <td>{doc.total} MAD</td>
                  <td>{getStatusBadge(doc.status)}</td>
                  <td><button className="text-indigo-600">Voir</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}