import { useEffect, useState } from 'react';
import { getCompanies, getContacts, createCompany, createContact, deleteContact } from '../../services/crmService';
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const emptyContact = {
  company_id: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  mobile: '',
  position: '',
};

const emptyCompany = {
  name: '',
  email: '',
  phone: '',
  city: '',
};

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addingCompany, setAddingCompany] = useState(false);
  const [form, setForm] = useState(emptyContact);
  const [companyForm, setCompanyForm] = useState(emptyCompany);

  useEffect(() => {
    fetchContacts();
  }, [search]);

  useEffect(() => {
    getCompanies()
      .then((res) => setCompanies(res.data.data || []))
      .catch(() => setCompanies([]));
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await getContacts({ search });
      setContacts(res.data.data || []);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCompanyChange = (event) => {
    const { name, value } = event.target;
    setCompanyForm((current) => ({ ...current, [name]: value }));
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyContact);
    setCompanyForm(emptyCompany);
    setAddingCompany(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      let companyId = form.company_id;

      if (addingCompany) {
        const companyResponse = await createCompany(companyForm);
        const newCompany = companyResponse.data.data || companyResponse.data;
        companyId = newCompany.id;
        setCompanies((current) => [newCompany, ...current]);
      }

      await createContact({ ...form, company_id: companyId });
      toast.success('Contact ajoute');
      closeModal();
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ce contact ?')) {
      await deleteContact(id);
      toast.success('Contact supprime');
      fetchContacts();
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cyan-700">CRM</p>
            <h2 className="text-2xl font-semibold text-slate-950">Contacts</h2>
            <p className="mt-1 text-sm text-slate-500">{contacts.length} contact(s)</p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5" />
            Ajouter
          </button>
        </div>

        <div className="mt-5 max-w-md">
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Contact</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Compte</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Telephone</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                  Chargement...
                </td>
              </tr>
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-500">
                  Aucun contact trouve
                </td>
              </tr>
            ) : (
              contacts.map((contact) => {
                const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || '-';
                const initials = fullName
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join('')
                  .toUpperCase();

                return (
                  <tr key={contact.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
                          {initials || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{fullName}</p>
                          <p className="text-sm text-slate-500">{contact.position || 'Contact'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">
                      <div className="inline-flex items-center gap-2">
                        <BuildingOfficeIcon className="h-4 w-4 text-slate-400" />
                        {contact.company?.name || '-'}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{contact.phone || contact.mobile || '-'}</td>
                    <td className="px-5 py-4 text-sm text-slate-700">{contact.email || '-'}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-md border border-slate-200 p-2 text-blue-600 transition hover:bg-blue-50" title="Modifier">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="rounded-md border border-slate-200 p-2 text-red-600 transition hover:bg-red-50"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-slate-950">Ajouter un contact</h3>
            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">Compte</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingCompany((current) => !current);
                      setForm((current) => ({ ...current, company_id: '' }));
                      setCompanyForm(emptyCompany);
                    }}
                    className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-50"
                  >
                    <PlusIcon className="h-4 w-4" />
                    {addingCompany ? 'Selectionner un compte' : 'Nouveau compte'}
                  </button>
                </div>

                {!addingCompany ? (
                  <select name="company_id" value={form.company_id} onChange={handleChange} className="w-full rounded-md border border-slate-300 px-3 py-2" required>
                    <option value="">Selectionner un compte</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="grid gap-3 rounded-md border border-indigo-100 bg-indigo-50/40 p-3 md:grid-cols-2">
                    <input name="name" value={companyForm.name} onChange={handleCompanyChange} placeholder="Nom du compte" className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" required />
                    <input type="email" name="email" value={companyForm.email} onChange={handleCompanyChange} placeholder="Email compte" className="rounded-md border border-slate-300 px-3 py-2" />
                    <input name="phone" value={companyForm.phone} onChange={handleCompanyChange} placeholder="Telephone compte" className="rounded-md border border-slate-300 px-3 py-2" />
                    <input name="city" value={companyForm.city} onChange={handleCompanyChange} placeholder="Ville" className="rounded-md border border-slate-300 px-3 py-2 md:col-span-2" />
                  </div>
                )}
              </div>
              <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="Prenom" className="rounded-md border border-slate-300 px-3 py-2" required />
              <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Nom" className="rounded-md border border-slate-300 px-3 py-2" required />
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="rounded-md border border-slate-300 px-3 py-2" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Telephone" className="rounded-md border border-slate-300 px-3 py-2" />
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile" className="rounded-md border border-slate-300 px-3 py-2" />
              <input name="position" value={form.position} onChange={handleChange} placeholder="Fonction" className="rounded-md border border-slate-300 px-3 py-2" />

              <div className="mt-2 flex justify-end gap-2 md:col-span-2">
                <button type="button" onClick={closeModal} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                  {saving ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
