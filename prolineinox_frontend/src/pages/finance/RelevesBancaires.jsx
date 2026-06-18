import { useEffect, useState } from 'react';
import { BuildingLibraryIcon, DocumentArrowUpIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function RelevesBancaires() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [file, setFile] = useState(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: '', account_number: '', balance: 0 });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const res = await api.get('/bank-accounts');
    setAccounts(res.data.data || []);
  };

  const handleImport = async () => {
    if (!selectedAccount || !file) {
      toast.error('Selectionnez un compte et un fichier CSV');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    await api.post(`/bank-accounts/${selectedAccount}/import-statement`, formData);
    toast.success('Releve importe');
    setFile(null);
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    await api.post('/bank-accounts', accountForm);
    toast.success('Compte bancaire ajoute');
    setAccountForm({ name: '', account_number: '', balance: 0 });
    setShowAccountForm(false);
    fetchAccounts();
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">Finance</p>
          <h2 className="text-xl font-semibold text-slate-950">Releves bancaires</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAccountForm(true)}
          className="inline-flex items-center gap-2 rounded-md border border-cyan-200 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50"
        >
          <PlusIcon className="h-5 w-5" /> Ajouter compte bancaire
        </button>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Compte bancaire</span>
          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
          >
            <option value="">Choisir un compte</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.bank_name || acc.name} - {acc.account_number}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Fichier CSV</span>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          onClick={handleImport}
          className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          <DocumentArrowUpIcon className="h-5 w-5" /> Importer
        </button>
      </div>

      {showAccountForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleCreateAccount} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-2">
              <BuildingLibraryIcon className="h-6 w-6 text-cyan-700" />
              <h3 className="text-lg font-semibold">Nouveau compte bancaire</h3>
            </div>
            <input
              value={accountForm.name}
              onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
              placeholder="Nom banque / compte"
              className="mb-3 w-full rounded-md border px-3 py-2"
              required
            />
            <input
              value={accountForm.account_number}
              onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })}
              placeholder="Numero compte"
              className="mb-3 w-full rounded-md border px-3 py-2"
              required
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={accountForm.balance}
              onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
              placeholder="Solde initial"
              className="mb-4 w-full rounded-md border px-3 py-2"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowAccountForm(false)} className="rounded-md border px-4 py-2">
                Annuler
              </button>
              <button type="submit" className="rounded-md bg-cyan-600 px-4 py-2 font-medium text-white">
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
