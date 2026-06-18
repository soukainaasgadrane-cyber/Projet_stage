import { useEffect, useState } from 'react';
import { DocumentArrowDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import DataTable from '../../components/tables/DataTable';
import api from '../../services/api';

const today = () => new Date().toISOString().split('T')[0];
const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

export default function RemisesCheques() {
  const [deposits, setDeposits] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showChequeForm, setShowChequeForm] = useState(false);
  const [cheques, setCheques] = useState([]);
  const [selectedCheques, setSelectedCheques] = useState([]);
  const [bankAccountId, setBankAccountId] = useState('');
  const [depositDate, setDepositDate] = useState(today());
  const [accounts, setAccounts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [accountForm, setAccountForm] = useState({ name: '', account_number: '', balance: 0 });
  const [chequeForm, setChequeForm] = useState({
    cheque_number: '',
    company_id: '',
    amount: '',
    issue_date: today(),
    due_date: tomorrow(),
    bank_name: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchDeposits();
    fetchCheques();
    fetchAccounts();
    fetchCompanies();
  }, []);

  const fetchDeposits = async () => {
    const res = await api.get('/cheque-deposits');
    setDeposits(res.data.data || []);
  };

  const fetchCheques = async () => {
    const res = await api.get('/cheques?status=pending');
    setCheques(res.data.data || []);
  };

  const fetchAccounts = async () => {
    const res = await api.get('/bank-accounts');
    setAccounts(res.data.data || []);
  };

  const fetchCompanies = async () => {
    const res = await api.get('/companies');
    setCompanies(res.data.data || []);
  };

  const handleCreateAccount = async (event) => {
    event.preventDefault();
    const res = await api.post('/bank-accounts', accountForm);
    const account = res.data.data || res.data;
    toast.success('Compte bancaire ajoute');
    setAccounts((current) => [account, ...current]);
    setBankAccountId(account.id);
    setAccountForm({ name: '', account_number: '', balance: 0 });
    setShowAccountForm(false);
  };

  const handleCreateCheque = async (event) => {
    event.preventDefault();

    try {
      const res = await api.post('/cheques', chequeForm);
      const cheque = res.data.data || res.data;
      toast.success('Cheque ajoute');
      setCheques((current) => [cheque, ...current]);
      setSelectedCheques((current) => [...current, cheque.id]);
      setChequeForm({
        cheque_number: '',
        company_id: '',
        amount: '',
        issue_date: today(),
        due_date: tomorrow(),
        bank_name: '',
        status: 'pending',
      });
      setShowChequeForm(false);
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      toast.error(firstError || error.response?.data?.message || 'Erreur ajout cheque');
    }
  };

  const handleCreateDeposit = async () => {
    if (!bankAccountId || selectedCheques.length === 0) {
      toast.error('Selectionnez un compte et des cheques');
      return;
    }

    try {
      await api.post('/cheque-deposits', { bank_account_id: bankAccountId, deposit_date: depositDate, cheque_ids: selectedCheques });
      toast.success('Remise creee');
      setShowModal(false);
      setSelectedCheques([]);
      setShowChequeForm(false);
      fetchDeposits();
      fetchCheques();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      toast.error(firstError || error.response?.data?.message || 'Erreur creation remise');
    }
  };

  const columns = [
    { header: 'Date', accessor: 'deposit_date' },
    { header: 'Compte', accessor: (row) => row.bank_account?.bank_name || row.bank_account?.name || '-' },
    { header: 'Montant total', accessor: (row) => `${row.total_amount} MAD` },
    { header: 'Statut', accessor: 'status' },
    {
      header: 'PDF',
      accessor: (row) => (
        <a href={`/api/cheque-deposits/${row.id}/pdf`} target="_blank" rel="noreferrer" className="text-cyan-700">
          <DocumentArrowDownIcon className="h-5 w-5" />
        </a>
      ),
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">Finance</p>
          <h2 className="text-xl font-semibold text-slate-950">Remises de cheques</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          <PlusIcon className="h-5 w-5" /> Nouvelle remise
        </button>
      </div>

      <DataTable columns={columns} data={deposits} />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Creer une remise de cheques</h3>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-medium text-slate-700">Date remise</label>
              <input type="date" value={depositDate} onChange={(e) => setDepositDate(e.target.value)} className="w-full rounded-md border px-3 py-2" required />
            </div>

            <div className="mb-3 flex gap-2">
              <select className="min-w-0 flex-1 rounded-md border px-3 py-2" value={bankAccountId} onChange={(e) => setBankAccountId(e.target.value)}>
                <option value="">Choisir un compte bancaire</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name || acc.name}
                  </option>
                ))}
              </select>
              <button type="button" onClick={() => setShowAccountForm(true)} className="rounded-md border border-cyan-200 px-3 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-50">
                + Compte
              </button>
            </div>

            {showAccountForm && (
              <form onSubmit={handleCreateAccount} className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                <input value={accountForm.name} onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })} placeholder="Nom banque / compte" className="mb-2 w-full rounded border px-3 py-2" required />
                <input value={accountForm.account_number} onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })} placeholder="Numero compte" className="mb-2 w-full rounded border px-3 py-2" required />
                <input type="number" min="0" step="0.01" value={accountForm.balance} onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })} placeholder="Solde initial" className="mb-2 w-full rounded border px-3 py-2" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAccountForm(false)} className="rounded border px-3 py-1">Annuler</button>
                  <button type="submit" className="rounded bg-cyan-600 px-3 py-1 text-white">Ajouter</button>
                </div>
              </form>
            )}

            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-semibold">Cheques disponibles :</p>
                <button type="button" onClick={() => setShowChequeForm((current) => !current)} className="rounded-md border border-cyan-200 px-3 py-1.5 text-sm font-medium text-cyan-700 hover:bg-cyan-50">
                  + Cheque
                </button>
              </div>
              {showChequeForm && (
                <form onSubmit={handleCreateCheque} className="mb-3 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
                  <input value={chequeForm.cheque_number} onChange={(e) => setChequeForm({ ...chequeForm, cheque_number: e.target.value })} placeholder="Numero cheque" className="rounded border px-3 py-2" required />
                  <input type="number" min="0.01" step="0.01" value={chequeForm.amount} onChange={(e) => setChequeForm({ ...chequeForm, amount: e.target.value })} placeholder="Montant" className="rounded border px-3 py-2" required />
                  <select value={chequeForm.company_id} onChange={(e) => setChequeForm({ ...chequeForm, company_id: e.target.value })} className="rounded border px-3 py-2 sm:col-span-2" required>
                    <option value="">Choisir l'emetteur</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                  <input type="date" value={chequeForm.issue_date} onChange={(e) => setChequeForm({ ...chequeForm, issue_date: e.target.value })} className="rounded border px-3 py-2" required />
                  <input type="date" value={chequeForm.due_date} onChange={(e) => setChequeForm({ ...chequeForm, due_date: e.target.value })} className="rounded border px-3 py-2" required />
                  <input value={chequeForm.bank_name} onChange={(e) => setChequeForm({ ...chequeForm, bank_name: e.target.value })} placeholder="Banque" className="rounded border px-3 py-2 sm:col-span-2" />
                  <div className="flex justify-end gap-2 sm:col-span-2">
                    <button type="button" onClick={() => setShowChequeForm(false)} className="rounded border px-3 py-1">Annuler</button>
                    <button type="submit" className="rounded bg-cyan-600 px-3 py-1 text-white">Ajouter cheque</button>
                  </div>
                </form>
              )}
              <div className="max-h-52 overflow-y-auto rounded-md border border-slate-200 p-2">
                {cheques.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun cheque disponible.</p>
                ) : (
                  cheques.map((cheque) => (
                    <label key={cheque.id} className="flex items-center gap-2 py-1 text-sm">
                      <input
                        type="checkbox"
                        value={cheque.id}
                        onChange={(event) => {
                          if (event.target.checked) setSelectedCheques([...selectedCheques, cheque.id]);
                          else setSelectedCheques(selectedCheques.filter((id) => id !== cheque.id));
                        }}
                      />
                      {cheque.cheque_number} - {cheque.amount} MAD - {cheque.company?.name || '-'}
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="rounded-md border px-4 py-2">Annuler</button>
              <button type="button" onClick={handleCreateDeposit} className="rounded-md bg-cyan-600 px-4 py-2 font-medium text-white">Creer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
