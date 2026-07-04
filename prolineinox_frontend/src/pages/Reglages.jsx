import { useMemo, useState } from 'react';
import {
  BanknotesIcon,
  Bars3BottomLeftIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  PhotoIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import logoImage from '../assets/images/Logo.jpeg';

const tabs = ['Options', 'Colonnes', 'Modeles'];

const optionGroups = [
  {
    title: 'Affichage',
    options: [
      { key: 'logo', label: 'Logo', enabled: true },
      { key: 'referenceClient', label: 'Reference client', enabled: false },
      { key: 'piedPage', label: 'Pied de page', enabled: true },
      { key: 'papierEntete', label: 'Papier en-tete', enabled: true },
      { key: 'contact', label: 'Contact', enabled: false },
      { key: 'composants', label: 'Composants', enabled: false },
      { key: 'lesMontants', label: 'Les montants', enabled: true },
      { key: 'transactions', label: 'Transactions', enabled: true },
      { key: 'taxes', label: 'Taxes', enabled: true },
      { key: 'champsPersonnalises', label: 'Champs personnalises', enabled: false },
      { key: 'cachet', label: 'Cachet', enabled: false },
      { key: 'articlesOptionnels', label: 'Articles optionnels', enabled: false },
      { key: 'dateEcheance', label: 'Date echeance', enabled: true },
      { key: 'dateLivraison', label: 'Date de livraison', enabled: false },
      { key: 'calculMarges', label: 'Calcul de marges', enabled: false },
    ],
  },
  {
    title: 'Coordonnees bancaires',
    options: [
      { key: 'rib', label: 'Banque', enabled: false },
      { key: 'iban', label: 'Ne pas afficher', enabled: false },
    ],
  },
  {
    title: 'Modes de paiements',
    options: [
      { key: 'virement', label: 'Virement', enabled: true },
      { key: 'cheque', label: 'Cheque', enabled: true },
      { key: 'especes', label: 'Especes', enabled: false },
    ],
  },
];

const columnOptions = [
  { key: 'reference', label: 'Reference', enabled: false },
  { key: 'codeBarres', label: 'Code a barres', enabled: false },
  { key: 'hsCode', label: 'HS Code', enabled: false },
  { key: 'image', label: 'Image', enabled: false },
  { key: 'designation', label: 'Designation', enabled: true },
  { key: 'description', label: 'Description', enabled: true },
  { key: 'marque', label: 'Marque', enabled: false },
  { key: 'quantite', label: 'Quantite', enabled: true },
  { key: 'unite', label: 'Unite', enabled: false },
  { key: 'puHT', label: 'PU HT', enabled: true },
  { key: 'puHTRemise', label: 'PU HT remise', enabled: false },
  { key: 'puTTC', label: 'PU TTC', enabled: false },
  { key: 'tva', label: 'TVA', enabled: true },
  { key: 'ptHT', label: 'PT HT', enabled: true },
  { key: 'ptTTC', label: 'PT TTC', enabled: false },
];

const modelOptions = [
  { key: 'compact', label: 'Mode compact', enabled: false },
  { key: 'timeline', label: 'Statut document', enabled: true },
  { key: 'conditions', label: 'Conditions', enabled: true },
  { key: 'signature', label: 'Signature client', enabled: false },
];

const buildInitialOptions = () => {
  const entries = [...optionGroups.flatMap((group) => group.options), ...columnOptions, ...modelOptions];
  return entries.reduce((acc, option) => ({ ...acc, [option.key]: option.enabled }), {});
};

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-7 w-14 items-center rounded-full border transition ${
        checked ? 'border-cyan-600 bg-cyan-600' : 'border-slate-300 bg-slate-200'
      }`}
      aria-pressed={checked}
    >
      <span
        className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[10px] font-bold shadow-sm transition ${
          checked ? 'translate-x-7 text-cyan-700' : 'translate-x-0.5 text-slate-400'
        }`}
      >
        {checked ? 'ON' : ''}
      </span>
      {!checked ? <span className="absolute right-2 text-[10px] font-bold text-slate-500">OFF</span> : null}
    </button>
  );
}

function OptionRow({ label, checked, onChange }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

function DocumentPreview({ options }) {
  const visibleColumns = useMemo(() => {
    const columns = [
      options.reference ? { key: 'reference', label: 'Reference' } : null,
      options.codeBarres ? { key: 'codeBarres', label: 'Code a barres' } : null,
      options.hsCode ? { key: 'hsCode', label: 'HS Code' } : null,
      options.image ? { key: 'image', label: 'Image' } : null,
      options.designation ? { key: 'designation', label: 'Designation' } : null,
      options.description ? { key: 'description', label: 'Description' } : null,
      options.marque ? { key: 'marque', label: 'Marque' } : null,
      options.quantite ? { key: 'quantite', label: 'Qte' } : null,
      options.unite ? { key: 'unite', label: 'Unite' } : null,
      options.puHT ? { key: 'puHT', label: 'PU HT' } : null,
      options.puHTRemise ? { key: 'puHTRemise', label: 'PU HT remise' } : null,
      options.puTTC ? { key: 'puTTC', label: 'PU TTC' } : null,
      options.tva ? { key: 'tva', label: 'TVA' } : null,
      options.ptHT ? { key: 'ptHT', label: 'PT HT' } : null,
      options.ptTTC ? { key: 'ptTTC', label: 'PT TTC' } : null,
    ];
    return columns.filter(Boolean);
  }, [options]);

  const sampleRows = [
    {
      reference: 'ART-001',
      codeBarres: '611204780012',
      hsCode: '7324.10',
      image: 'Image',
      designation: 'Siphon de sol Dim.250x250',
      description: 'Inox 304, evacuation centrale',
      marque: 'PROLINE',
      quantite: '1',
      unite: 'u',
      puHT: '2 500,00',
      puHTRemise: '2 350,00',
      puTTC: '3 000,00',
      tva: '20%',
      ptHT: '2 500,00',
      ptTTC: '3 000,00',
    },
    {
      reference: 'ART-002',
      codeBarres: '611204780029',
      hsCode: '8414.60',
      image: 'Image',
      designation: 'Hotte cent. speciale cuisine',
      description: 'Avec filtres et support',
      marque: 'INOX',
      quantite: '2',
      unite: 'u',
      puHT: '1 800,00',
      puHTRemise: '1 800,00',
      puTTC: '2 160,00',
      tva: '20%',
      ptHT: '3 600,00',
      ptTTC: '4 320,00',
    },
  ];

  return (
    <div className="h-full min-h-[650px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Consulter un document</p>
            <h2 className="text-lg font-semibold text-slate-950">Devis D-202606-277</h2>
          </div>
          <div className="text-right text-sm font-medium text-slate-500">
            <span>Brouillon</span>
            <span className="mx-2 text-cyan-600">Valide</span>
            <span>Accepte</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-[1fr_280px] gap-8">
          <div>
            {options.logo ? <img src={logoImage} alt="PRO LINE INOX" className="mb-6 h-auto w-44" /> : null}
            <div className="mb-8 text-sm leading-7 text-slate-700">
              <p>Date : 18/06/2026</p>
              {options.dateEcheance ? <p>Validite : 18/07/2026</p> : null}
              {options.dateLivraison ? <p>Date de livraison : 22/06/2026</p> : null}
              {options.contact ? <p>Contact : Jalal Zakaria</p> : null}
              <p>Responsable : Jalal Zakaria</p>
              <p>Objet : GROUPE MACHAA ALLAH</p>
            </div>
          </div>

          <div className="rounded-md border border-slate-200 p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Client</p>
            <p className="mt-2">GROUPE MACHAA ALLAH</p>
            <p>Casablanca</p>
            {options.referenceClient ? <p className="mt-2">Ref. client : BC-2026-41</p> : null}
          </div>
        </div>

        <table className="mt-4 w-full table-fixed border-collapse text-sm">
          <thead>
            <tr>
              {visibleColumns.map((column) => (
                <th key={column.key} className="border border-cyan-700 bg-cyan-600 px-3 py-3 text-left font-semibold text-white">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sampleRows.map((item, index) => (
              <tr key={item.reference} className={index % 2 ? 'bg-slate-50' : 'bg-white'}>
                {visibleColumns.map((column) => (
                  <td
                    key={column.key}
                    className={`border border-slate-200 px-3 py-4 text-slate-600 ${
                      ['quantite', 'puHT', 'puHTRemise', 'puTTC', 'tva', 'ptHT', 'ptTTC'].includes(column.key)
                        ? 'text-right'
                        : 'text-left'
                    } ${column.key === 'designation' ? 'font-medium text-slate-800' : ''}`}
                  >
                    {item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {options.lesMontants ? (
          <div className="mt-8 ml-auto w-72 text-sm text-slate-700">
            <div className="flex justify-between border-b py-2">
              <span>Total HT</span>
              <span>6 100,00</span>
            </div>
            {options.taxes ? (
              <div className="flex justify-between border-b py-2">
                <span>TVA (20%)</span>
                <span>1 220,00</span>
              </div>
            ) : null}
            <div className="flex justify-between border-b border-slate-400 py-2 font-semibold">
              <span>Montant NET TTC</span>
              <span>7 320,00</span>
            </div>
          </div>
        ) : null}

        {options.conditions ? (
          <div className="mt-10 text-sm text-slate-600">
            <p className="font-semibold uppercase text-slate-800">Conditions:</p>
            <p className="mt-2">50% d'avance et 50% a la livraison</p>
          </div>
        ) : null}

        {options.transactions ? (
          <div className="mt-8 text-sm text-slate-600">
            <p className="font-semibold uppercase text-slate-800">Paiements recus:</p>
            <p className="mt-2">2 340,00 MAD regle le 26/06/2026 par especes</p>
          </div>
        ) : null}

        {options.piedPage ? (
          <div className="mt-16 border-t border-slate-200 pt-4 text-center text-xs leading-5 text-slate-500">
            S.A.R.L A.U au capital de 100 000,00 Dhs - Casablanca - contact@inoxproline.ma
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Reglages() {
  const [activeTab, setActiveTab] = useState('Options');
  const [options, setOptions] = useState(buildInitialOptions);

  const setOption = (key) => {
    setOptions((current) => ({ ...current, [key]: !current[key] }));
  };

  const currentOptions = activeTab === 'Colonnes' ? [{ title: 'Colonnes du document', options: columnOptions }]
    : activeTab === 'Modeles' ? [{ title: 'Modeles et sections', options: modelOptions }]
      : optionGroups;

  const activeOptionKeys = currentOptions.flatMap((group) => group.options.map((option) => option.key));
  const allCurrentSelected = activeOptionKeys.every((key) => options[key]);

  const toggleAllCurrent = () => {
    setOptions((current) => {
      const nextValue = !allCurrentSelected;
      return activeOptionKeys.reduce((acc, key) => ({ ...acc, [key]: nextValue }), { ...current });
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Administration</p>
          <h1 className="text-2xl font-semibold text-slate-950">Reglages</h1>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700"
        >
          <CheckIcon className="h-4 w-4" />
          Enregistrer
        </button>
      </div>

      <div className="grid min-h-[720px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <DocumentPreview options={options} />

        <aside className="rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 pt-5">
            <div className="flex gap-6">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`border-b-2 pb-3 text-sm font-semibold transition ${
                    activeTab === tab ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[670px] overflow-y-auto px-5 py-5">
            {activeTab === 'Options' ? (
              <div className="mb-5 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                <div className="rounded-md border border-slate-200 p-3">
                  <PhotoIcon className="mb-2 h-5 w-5 text-cyan-600" />
                  Documents
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <SwatchIcon className="mb-2 h-5 w-5 text-cyan-600" />
                  Couleurs
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <BanknotesIcon className="mb-2 h-5 w-5 text-cyan-600" />
                  Paiement
                </div>
                <div className="rounded-md border border-slate-200 p-3">
                  <DocumentTextIcon className="mb-2 h-5 w-5 text-cyan-600" />
                  Mentions
                </div>
              </div>
            ) : null}

            <div className="space-y-7">
              {activeTab === 'Colonnes' ? (
                <section>
                  <div className="rounded-md border border-slate-100 px-3">
                    <OptionRow label="TOUT SELECTIONNER" checked={allCurrentSelected} onChange={toggleAllCurrent} />
                  </div>
                </section>
              ) : null}

              {currentOptions.map((group) => (
                <section key={group.title}>
                  <div className="mb-2 flex items-center gap-2">
                    <Bars3BottomLeftIcon className="h-4 w-4 text-cyan-600" />
                    <h2 className="text-base font-semibold text-slate-950">{group.title}</h2>
                  </div>
                  <div className="rounded-md border border-slate-100 px-3">
                    {group.options.map((option) => (
                      <OptionRow
                        key={option.key}
                        label={option.label}
                        checked={Boolean(options[option.key])}
                        onChange={() => setOption(option.key)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-7 rounded-md border border-cyan-100 bg-cyan-50 p-4 text-sm text-cyan-900">
              <div className="flex items-center gap-2 font-semibold">
                <ClipboardDocumentListIcon className="h-5 w-5" />
                Apercu direct
              </div>
              <p className="mt-2 text-cyan-800">Les changements sont visibles sur le document a gauche.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
