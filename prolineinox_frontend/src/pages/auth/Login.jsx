import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import toast from 'react-hot-toast';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const fallbackLoginErrors = {
  fr: {
    network: 'Serveur indisponible. Verifiez que Laravel et MySQL sont demarres.',
    server: 'Erreur serveur. Verifiez la connexion a la base de donnees.',
  },
  ar: {
    network: 'الخادم غير متاح. تحقق من تشغيل Laravel و MySQL.',
    server: 'خطأ في الخادم. تحقق من الاتصال بقاعدة البيانات.',
  },
  en: {
    network: 'Server unavailable. Check that Laravel and MySQL are running.',
    server: 'Server error. Check the database connection.',
  },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { language, setLanguage, dir, t } = useSettings();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      toast.error(getLoginErrorMessage(err));
    }
  };

  const getLoginErrorMessage = (err) => {
    const status = err.response?.status;
    const apiMessage = err.response?.data?.message;
    const apiValidationMessage = err.response?.data?.errors?.email?.[0];
    const fallback = fallbackLoginErrors[language] ?? fallbackLoginErrors.fr;

    if (status === 401 || status === 422) {
      return apiValidationMessage || apiMessage || t.loginError;
    }

    if (!err.response) {
      return fallback.network;
    }

    return apiMessage || fallback.server;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900" dir={dir}>
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.24),transparent_34%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#164e63_100%)] px-4 py-8">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl shadow-slate-950/40 lg:grid-cols-[1fr_440px]">
          <div className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-20 w-20 items-center justify-center rounded-md border border-cyan-300/40 bg-white/10 shadow-lg shadow-cyan-950/30">
                <div className="text-center font-black leading-none text-white">
                  <span className="block text-2xl">PL</span>
                  <span className="block text-sm text-cyan-200">INOX</span>
                </div>
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold uppercase text-cyan-200">InoxProline</p>
                <h1 className="mt-3 max-w-sm text-4xl font-bold leading-tight">
                  Gestion commerciale et atelier
                </h1>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-cyan-300 via-slate-200 to-emerald-300" />
          </div>

          <div className="p-6 sm:p-8">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-md border border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-100 shadow-sm lg:hidden">
                  <div className="text-center font-black leading-none text-slate-900">
                    <span className="block text-lg">PL</span>
                    <span className="block text-[10px] text-cyan-700">INOX</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-950">InoxProline ERP</h2>
                  <p className="mt-1 text-sm text-slate-500">Espace administration</p>
                </div>
              </div>
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              >
                <option value="fr">FR</option>
                <option value="ar">AR</option>
                <option value="en">EN</option>
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{t.email}</span>
                <div className="relative">
                  <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 shadow-sm transition focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 rtl:pl-3 rtl:pr-10"
                    autoComplete="email"
                    required
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">{t.password}</span>
                <div className="relative">
                  <LockClosedIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 shadow-sm transition focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 rtl:pl-3 rtl:pr-10"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </label>
              <button
                type="submit"
                className="w-full rounded-md bg-cyan-700 py-3 font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
              >
                {t.login}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
