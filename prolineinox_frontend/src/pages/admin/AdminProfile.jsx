import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminProfile, updateAdminProfile } from '../../services/adminService';

export default function AdminProfile() {
  const [form, setForm] = useState({ first_name: '', last_name: '', name: '', email: '', phone: '', password: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminProfile()
      .then((res) => {
        const user = res.data;
        setForm({
          first_name: user.first_name || '',
          last_name: user.last_name || '',
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          password: '',
        });
      })
      .catch(() => toast.error('Erreur chargement profil'));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await updateAdminProfile(payload);
      setForm((current) => ({ ...current, password: '' }));
      toast.success('Profil modifie');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Modification impossible');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Profil admin</h2>
      <p className="mt-1 text-sm text-slate-500">Modifier les informations et le mot de passe.</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} placeholder="Prenom" className="rounded-md border px-3 py-2" />
        <input value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} placeholder="Nom" className="rounded-md border px-3 py-2" />
        <input value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Nom affiche" className="rounded-md border px-3 py-2 md:col-span-2" />
        <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Email" className="rounded-md border px-3 py-2" required />
        <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="Telephone" className="rounded-md border px-3 py-2" />
        <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Nouveau mot de passe" className="rounded-md border px-3 py-2 md:col-span-2" />
      </div>

      <button type="submit" disabled={saving} className="mt-5 rounded-md bg-cyan-600 px-4 py-2 font-semibold text-white disabled:opacity-60">
        {saving ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </form>
  );
}
