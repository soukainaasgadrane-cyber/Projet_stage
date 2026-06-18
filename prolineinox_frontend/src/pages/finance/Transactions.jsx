import { useEffect, useState } from 'react';
import api from "../../services/api";
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'virement',
    reference: '',
    description: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.data);
    } catch (error) {
      toast.error('Erreur chargement transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/transactions/${editing.id}`, formData);
        toast.success('Transaction modifiée');
      } else {
        await api.post('/transactions', formData);
        toast.success('Transaction créée');
      }
      setShowModal(false);
      setEditing(null);
      fetchTransactions();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      toast.error(firstError || error.response?.data?.message || 'Erreur sauvegarde');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer cette transaction ?')) {
      await api.delete(`/transactions/${id}`);
      toast.success('Supprimée');
      fetchTransactions();
    }
  };

  const openEdit = (transaction) => {
    setEditing(transaction);
    setFormData({
      type: transaction.type,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date,
      payment_method: transaction.payment_method,
      reference: transaction.reference || '',
      description: transaction.description || ''
    });
    setShowModal(true);
  };

  if (loading) return <div className="text-center">Chargement...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transactions financières</h2>
        <button onClick={() => { setEditing(null); setFormData({ type: 'income', amount: '', transaction_date: new Date().toISOString().split('T')[0], payment_method: 'virement', reference: '', description: '' }); setShowModal(true); }} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <PlusIcon className="w-5 h-5" /> Ajouter
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Moyen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td className="px-6 py-4">{tx.transaction_date}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'income' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {tx.type === 'income' ? 'Recette' : 'Dépense'}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{tx.amount.toLocaleString()} MAD</td>
                <td className="px-6 py-4">{tx.payment_method}</td>
                <td className="px-6 py-4 text-sm">{tx.reference || '-'}</td>
                <td className="px-6 py-4 text-sm truncate max-w-xs">{tx.description || '-'}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => openEdit(tx)} className="text-blue-600 hover:text-blue-800"><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(tx.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal formulaire */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">{editing ? 'Modifier' : 'Nouvelle'} transaction</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full border rounded px-3 py-2">
                  <option value="income">Recette</option>
                  <option value="expense">Dépense</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Montant (MAD)</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={formData.transaction_date} onChange={(e) => setFormData({...formData, transaction_date: e.target.value})} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Moyen de paiement</label>
                <select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})} className="w-full border rounded px-3 py-2">
                  <option value="virement">Virement</option>
                  <option value="especes">Espèces</option>
                  <option value="cheque">Chèque</option>
                  <option value="carte">Carte bancaire</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Référence</label>
                <input type="text" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border rounded px-3 py-2"></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">Annuler</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
