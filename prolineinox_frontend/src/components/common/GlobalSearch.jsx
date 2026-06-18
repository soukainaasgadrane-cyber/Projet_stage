import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${query}`);
        setResults(res.data);
        setOpen(true);
      } catch (err) {
        setResults(null);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const documentPath = (document) => {
    const paths = {
      quote: 'devis',
      proforma: 'proforma',
      order: 'commandes',
      delivery_note: 'bons-livraison',
      invoice: 'factures',
      credit_note: 'avoirs',
    };

    return `/ventes/${paths[document.type] || 'devis'}/${document.id}`;
  };

  const closeSearch = () => setOpen(false);
  const hasResults =
    results?.companies?.length || results?.contacts?.length || results?.articles?.length || results?.documents?.length;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 rtl:left-auto rtl:right-3" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-cyan-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100 rtl:pl-4 rtl:pr-10"
        />
      </div>

      {open && results && (
        <div className="absolute left-0 z-50 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
          {results.companies?.length > 0 && (
            <div className="border-b border-slate-100 p-3">
              <div className="text-sm font-semibold text-slate-900">Sociétés</div>
              {results.companies.map((company) => (
                <Link
                  key={company.id}
                  to={`/crm/accounts/${company.id}`}
                  onClick={closeSearch}
                  className="block rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                >
                  {company.name}
                </Link>
              ))}
            </div>
          )}

          {results.contacts?.length > 0 && (
            <div className="border-b border-slate-100 p-3">
              <div className="text-sm font-semibold text-slate-900">Contacts</div>
              {results.contacts.map((contact) => (
                <Link
                  key={contact.id}
                  to={`/crm/contacts/${contact.id}`}
                  onClick={closeSearch}
                  className="block rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                >
                  {contact.first_name} {contact.last_name}
                </Link>
              ))}
            </div>
          )}

          {results.articles?.length > 0 && (
            <div className="border-b border-slate-100 p-3">
              <div className="text-sm font-semibold text-slate-900">Articles</div>
              {results.articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/catalogue/articles/${article.id}`}
                  onClick={closeSearch}
                  className="block rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                >
                  {article.name}
                </Link>
              ))}
            </div>
          )}

          {results.documents?.length > 0 && (
            <div className="p-3">
              <div className="text-sm font-semibold text-slate-900">Documents</div>
              {results.documents.map((document) => (
                <Link
                  key={document.id}
                  to={documentPath(document)}
                  onClick={closeSearch}
                  className="block rounded px-2 py-1 text-sm text-slate-700 hover:bg-slate-100"
                >
                  {document.reference}
                </Link>
              ))}
            </div>
          )}

          {!hasResults && <div className="p-4 text-center text-sm text-slate-500">Aucun résultat</div>}
        </div>
      )}
    </div>
  );
}
