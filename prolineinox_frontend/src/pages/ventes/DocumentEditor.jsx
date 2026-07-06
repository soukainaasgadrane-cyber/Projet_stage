import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  DocumentArrowDownIcon,
  PlusIcon,
  PrinterIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { convertDocument, createDocument, getDocumentPDF, getNextDocumentReference, updateDocument } from '../../services/salesService';
import { downloadPDF } from '../../utils/pdfExport';
import logoImage from '../../assets/images/Logo.jpeg';

const documentConfig = {
  devis: { type: 'quote', label: 'Devis', back: '/ventes/devis' },
  proforma: { type: 'proforma', label: 'Facture proforma', back: '/ventes/proforma' },
  commandes: { type: 'order', label: 'Commande', back: '/ventes/commandes' },
  'bons-livraison': { type: 'delivery_note', label: 'Bon de livraison', back: '/ventes/bons-livraison' },
  factures: { type: 'invoice', label: 'Facture', back: '/ventes/factures' },
  avoirs: { type: 'credit_note', label: 'Avoir', back: '/ventes/avoirs' },
  'purchase-request': { type: 'purchase_request', label: 'Demande de prix', back: '/achats/demandes-prix' },
  'purchase-order': { type: 'purchase_order', label: 'Bon de commande achat', back: '/achats/bons-commandes' },
  'receipt-note': { type: 'receipt_note', label: 'Bon de reception', back: '/achats/bon-reception' },
  'supplier-invoice': { type: 'supplier_invoice', label: 'Facture achat', back: '/achats/factures' },
  'supplier-credit-note': { type: 'supplier_credit_note', label: 'Avoir achat', back: '/achats/avoirs' },
};

const convertOptionsByType = {
  quote: [
    { value: 'order', label: 'Commande', path: '/ventes/commandes' },
    { value: 'proforma', label: 'Facture proforma', path: '/ventes/proforma' },
  ],
  proforma: [{ value: 'order', label: 'Commande', path: '/ventes/commandes' }],
  order: [
    { value: 'delivery_note', label: 'Bon de livraison', path: '/ventes/bons-livraison' },
    { value: 'invoice', label: 'Facture', path: '/ventes/factures' },
  ],
  delivery_note: [{ value: 'invoice', label: 'Facture', path: '/ventes/factures' }],
  purchase_request: [{ value: 'purchase_order', label: 'Bon de commande achat', path: '/achats/bons-commandes' }],
  purchase_order: [
    { value: 'receipt_note', label: 'Bon de reception', path: '/achats/bon-reception' },
    { value: 'supplier_invoice', label: 'Facture achat', path: '/achats/factures' },
  ],
  receipt_note: [{ value: 'supplier_invoice', label: 'Facture achat', path: '/achats/factures' }],
};

const today = new Date().toISOString().slice(0, 10);
const addDays = (date, days) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate.toISOString().slice(0, 10);
};
const defaultConditions = "Conditions de paiement : 50% d'avance et 50% a la livraison.";
const statusOptions = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'validee', label: 'Validée' },
  { value: 'acceptee', label: 'Acceptée' },
  { value: 'partielle', label: 'Partielle' },
  { value: 'livree', label: 'Livrée' },
  { value: 'expiree', label: 'Expirée' },
  { value: 'facturee', label: 'Facturée' },
  { value: 'annulee', label: 'Annulée' },
];

const emptyCompany = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  country: 'Maroc',
  tax_number: '',
};

const emptyItem = {
  article_id: '',
  line_type: 'article',
  reference: '',
  description: '',
  details: '',
  unit_price: '',
  unit: '',
  quantity: 1,
  tax_rate: 20,
};

export default function DocumentEditor({ documentKind }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const config = documentConfig[documentKind];
  const isNew = id === 'nouveau';
  const [companies, setCompanies] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [converting, setConverting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [items, setItems] = useState([emptyItem]);
  const [form, setForm] = useState({
    reference: '',
    client_reference: '',
    company_id: '',
    contact_id: '',
    responsible_name: '',
    subject: '',
    status: 'brouillon',
    document_date: today,
    due_date: addDays(today, 30),
    delivery_status: 'pending',
    payment_status: 'unpaid',
    advance_amount: 0,
    notes: defaultConditions,
  });
  const conversionOptions = convertOptionsByType[config?.type] || [];
  const [convertForm, setConvertForm] = useState({
    targetType: '',
    document_date: today,
    due_date: '',
    responsible_name: '',
    subject: '',
  });

  const title = useMemo(() => {
    if (!config) return 'Document';
    return isNew ? `Nouveau ${config.label.toLowerCase()}` : `Modifier ${config.label.toLowerCase()}`;
  }, [config, isNew]);
  const partyLabel = config?.type?.startsWith('purchase') || config?.type?.startsWith('supplier') ? 'Fournisseur' : 'Client';
  const isSalesDocument = ['quote', 'proforma', 'order', 'delivery_note', 'invoice', 'credit_note', 'recurring_invoice'].includes(config?.type);
  const dueDateLabel = config?.type === 'quote'
    ? 'Validite jusqu au'
    : ['order', 'delivery_note', 'purchase_order', 'receipt_note'].includes(config?.type)
      ? 'Date de livraison'
      : 'Date echeance';
  const subjectLabel = ['order', 'delivery_note', 'purchase_request', 'purchase_order', 'receipt_note'].includes(config?.type)
    ? 'Nom du projet'
    : 'Objet';
  const lineTotalHt = (item) => {
    if ((item.line_type || 'article') === 'section') return 0;
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    return quantity * unitPrice;
  };
  const selectedCompany = companies.find((company) => String(company.id) === String(form.company_id));
  const printableItems = items.filter((item) => item.description.trim());
  const subtotal = printableItems.reduce((sum, item) => sum + lineTotalHt(item), 0);
  const tax = printableItems.reduce((sum, item) => sum + (lineTotalHt(item) * ((Number(item.tax_rate) || 0) / 100)), 0);
  const totalTtc = subtotal + tax;
  const formatMoney = (value) => Number(value || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDate = (value) => (value ? value.split('-').reverse().join('/') : '');
  const printNote = form.notes && !form.notes.includes('50%') ? form.notes : 'Nous vous remercions de votre confiance';
  const printStyles = {
    page: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#333',
      lineHeight: 1.35,
    },
    header: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      columnGap: '26mm',
      alignItems: 'start',
      marginBottom: '8mm',
    },
    logoBox: {
      display: 'inline-block',
      width: '48mm',
      color: '#24456f',
      lineHeight: 1,
    },
    logoImage: {
      display: 'block',
      width: '48mm',
      height: 'auto',
    },
    logoMain: {
      display: 'block',
      fontSize: '13px',
      fontWeight: 700,
      letterSpacing: '3.5px',
    },
    logoRule: {
      display: 'block',
      width: '18mm',
      height: '1px',
      margin: '1.8mm 0 1mm',
      background: '#24456f',
    },
    logoSub: {
      display: 'block',
      marginLeft: '15mm',
      marginTop: '-4.2mm',
      fontSize: '9px',
      fontWeight: 700,
      letterSpacing: '5px',
      color: '#3f4f63',
    },
    logoTagline: {
      display: 'block',
      marginTop: '2.4mm',
      fontSize: '3.5px',
      fontWeight: 700,
      letterSpacing: '0.9px',
      color: '#4d5968',
      whiteSpace: 'nowrap',
    },
    title: {
      margin: '7mm 0 5mm',
      fontSize: '15px',
      fontWeight: 500,
      textTransform: 'uppercase',
    },
    metaTable: {
      width: '60mm',
      borderCollapse: 'collapse',
    },
    metaTh: {
      width: '24mm',
      padding: '1.5mm 0',
      border: 0,
      color: '#666',
      fontWeight: 400,
      textAlign: 'left',
    },
    metaTd: {
      padding: '1.5mm 0',
      border: 0,
      textAlign: 'left',
    },
    client: {
      marginTop: '28mm',
      minHeight: '24mm',
      padding: '3mm',
      border: '1px solid #ddd',
    },
    items: {
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
      fontSize: '10.5px',
    },
    itemHead: {
      padding: '2mm',
      background: '#262626',
      color: '#fff',
      border: 0,
      textAlign: 'left',
      textTransform: 'uppercase',
    },
    itemCell: {
      minHeight: '13mm',
      padding: '2mm',
      border: 0,
      borderBottom: '1px solid #d4d4d4',
      verticalAlign: 'top',
      whiteSpace: 'pre-wrap',
    },
    summary: {
      display: 'grid',
      gridTemplateColumns: '1fr 75mm',
      columnGap: '16mm',
      marginTop: '9mm',
      alignItems: 'start',
    },
    totals: {
      width: '75mm',
      borderCollapse: 'collapse',
    },
    totalCell: {
      padding: '2mm',
      border: 0,
    },
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/companies');
      setCompanies(res.data.data || res.data || []);
    } catch (error) {
      setCompanies([]);
    }
  };

  const fetchArticles = async () => {
    try {
      const res = await api.get('/articles');
      setArticles(res.data.data || res.data || []);
    } catch (error) {
      setArticles([]);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchArticles();
  }, []);

  useEffect(() => {
    if (!config || !isNew) return;

    getNextDocumentReference(config.type)
      .then((res) => {
        setForm((current) => ({ ...current, reference: res.data.reference || current.reference }));
      })
      .catch(() => {
        setForm((current) => ({ ...current, reference: 'Auto' }));
      });
  }, [config, isNew]);

  useEffect(() => {
    if (!config || isNew) return;

    setLoading(true);
    api
      .get(`/documents/${id}`)
      .then((res) => {
        const document = res.data.data || res.data;
        setForm({
          reference: document.reference || '',
          client_reference: document.client_reference || '',
          company_id: document.company?.id || '',
          contact_id: document.contact?.id || '',
          responsible_name: document.responsible_name || '',
          subject: document.subject || '',
          status: document.status || 'brouillon',
          document_date: document.document_date || today,
          due_date: document.due_date || addDays(document.document_date || today, 30),
          delivery_status: document.delivery_status || 'pending',
          payment_status: document.payment_status || 'unpaid',
          advance_amount: document.advance_amount || 0,
          notes: document.notes || defaultConditions,
        });
        setItems((document.items || []).length ? document.items.map((item) => ({
          id: item.id,
          article_id: item.article_id || item.article?.id || '',
          line_type: item.line_type || 'article',
          reference: item.reference || item.article?.code || '',
          description: item.description || '',
          details: item.details || '',
          unit_price: item.unit_price || '',
          unit: item.unit || item.article?.unit || '',
          quantity: item.quantity || 1,
          tax_rate: item.tax_rate ?? 20,
        })) : [emptyItem]);
      })
      .catch(() => toast.error('Document introuvable'))
      .finally(() => setLoading(false));
  }, [config, id, isNew]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCompanyChange = (event) => {
    const { name, value } = event.target;
    setCompanyForm((current) => ({ ...current, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((current) => current.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [field]: value } : item
    )));
  };

  const addItemLine = () => {
    setItems((current) => [...current, { ...emptyItem }]);
  };

  const addSectionLine = () => {
    setItems((current) => [
      ...current,
      {
        ...emptyItem,
        line_type: 'section',
        quantity: 1,
        unit_price: 0,
        tax_rate: 0,
      },
    ]);
  };

  const applyArticleToLine = (index, articleId) => {
    const article = articles.find((item) => String(item.id) === String(articleId));

    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (!article) return { ...item, article_id: '', reference: '', description: '', details: '', unit_price: '', unit: '' };

      return {
        ...item,
        article_id: article.id,
        line_type: 'article',
        reference: article.code || '',
        description: article.name || '',
        details: article.description || '',
        unit_price: article.selling_price || '',
        unit: article.unit || 'piece',
      };
    }));
  };

  const removeItemLine = (index) => {
    setItems((current) => (current.length === 1 ? [{ ...emptyItem }] : current.filter((_, itemIndex) => itemIndex !== index)));
  };

  const closeCompanyForm = () => {
    setShowCompanyForm(false);
    setCompanyForm(emptyCompany);
  };

  const handleCreateCompany = async (event) => {
    event.preventDefault();
    setSavingCompany(true);

    try {
      const res = await api.post('/companies', companyForm);
      const company = res.data.data || res.data;
      setCompanies((current) => [company, ...current.filter((item) => item.id !== company.id)]);
      setForm((current) => ({ ...current, company_id: company.id || '' }));
      closeCompanyForm();
      toast.success(`${partyLabel} ajoute`);
    } catch (error) {
      toast.error(error.response?.data?.message || `Erreur lors de l'ajout du ${partyLabel.toLowerCase()}`);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!config) return;

    setSaving(true);
    const payload = {
      ...form,
      type: config.type,
      company_id: form.company_id || null,
      contact_id: form.contact_id || null,
      due_date: form.due_date || null,
      advance_amount: Number(form.advance_amount) || 0,
      status: form.status || 'brouillon',
      reference: form.reference.trim() && form.reference.trim() !== 'Auto' ? form.reference.trim() : null,
      client_reference: form.client_reference.trim() || null,
      responsible_name: form.responsible_name.trim() || null,
      subject: form.subject.trim() || null,
      items: items
        .filter((item) => item.description.trim())
        .map((item) => ({
          article_id: item.article_id || null,
          line_type: item.line_type || 'article',
          reference: item.reference.trim() || null,
          description: item.description.trim(),
          details: item.details.trim() || null,
          unit_price: Number(item.unit_price) || 0,
          unit: item.unit.trim() || null,
          quantity: item.line_type === 'section' ? 1 : Number(item.quantity) || 0,
          tax_rate: Number(item.tax_rate) || 0,
        })),
    };

    try {
      if (isNew) {
        const res = await createDocument(payload);
        const document = res.data.data || res.data;
        setForm((current) => ({ ...current, reference: document.reference || current.reference }));
        toast.success('Document cree');
        navigate(`${config.back}/${document.id}`, { replace: true });
      } else {
        const res = await updateDocument(id, payload);
        const document = res.data.data || res.data;
        setForm((current) => ({
          ...current,
          reference: document.reference || current.reference,
          subject: document.subject || current.subject,
        }));
        toast.success('Document modifie');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (isNew || !config) return;

    setDownloadingPdf(true);
    try {
      await downloadPDF(getDocumentPDF(id, config.type), `${config.label.toLowerCase().replaceAll(' ', '_')}_${id}.pdf`);
    } catch (error) {
      toast.error('Erreur telechargement PDF');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const openConvertModal = () => {
    if (isNew || !conversionOptions.length) return;

    setConvertForm({
      targetType: conversionOptions[0].value,
      document_date: today,
      due_date: conversionOptions[0].value === 'invoice' || conversionOptions[0].value === 'supplier_invoice' ? addDays(today, 30) : '',
      responsible_name: form.responsible_name || '',
      subject: form.subject || '',
    });
    setShowConvertModal(true);
  };

  const handleConvertTargetChange = (event) => {
    const targetType = event.target.value;
    setConvertForm((current) => ({
      ...current,
      targetType,
      due_date: targetType === 'invoice' || targetType === 'supplier_invoice' ? (current.due_date || addDays(today, 30)) : '',
    }));
  };

  const handleConvertSubmit = async (event) => {
    event.preventDefault();
    if (isNew || !convertForm.targetType) return;

    const selectedOption = conversionOptions.find((option) => option.value === convertForm.targetType);
    setConverting(true);
    try {
      const res = await convertDocument(id, convertForm.targetType, {
        document_date: convertForm.document_date || today,
        due_date: convertForm.due_date || null,
        responsible_name: convertForm.responsible_name.trim() || null,
        subject: convertForm.subject.trim() || null,
      });
      const document = res.data.data || res.data;
      toast.success(`Document converti en ${selectedOption?.label?.toLowerCase() || 'document'}`);
      setShowConvertModal(false);
      navigate(`${selectedOption?.path || config.back}/${document.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Conversion impossible');
    } finally {
      setConverting(false);
    }
  };

  if (!config) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Type de document inconnu</h2>
        <Link to="/ventes" className="mt-4 inline-block text-cyan-700">
          Retour aux ventes
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">Chargement...</div>;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="no-print rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-700">Ventes</p>
            <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {!isNew && conversionOptions.length ? (
              <button
                type="button"
                onClick={openConvertModal}
                disabled={converting}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-sky-600 px-5 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Convertir
              </button>
            ) : null}
            {!isNew ? (
              <>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <PrinterIcon className="h-4 w-4" />
                  Imprimer
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={downloadingPdf}
                  className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
                >
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  {downloadingPdf ? 'Telechargement...' : 'Telecharger PDF'}
                </button>
              </>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <Link to={config.back} className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Retour
            </Link>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div className="block">
            <span className="text-sm font-medium text-slate-700">{partyLabel}</span>
            <div className="mt-1 flex gap-2">
              <select
                name="company_id"
                value={form.company_id}
                onChange={handleChange}
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
                required
              >
                <option value="">Selectionner un {partyLabel.toLowerCase()}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowCompanyForm(true)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cyan-600 text-white hover:bg-cyan-700"
                title={`Ajouter un ${partyLabel.toLowerCase()}`}
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowCompanyForm(true)}
              className="mt-2 text-sm font-medium text-cyan-700 hover:text-cyan-800"
            >
              {partyLabel} pas dans la liste ? Ajouter
            </button>
          </div>

          <div className="block">
            <span className="text-sm font-medium text-slate-700">Reference document</span>
            <input
              name="reference"
              value={form.reference}
              onChange={handleChange}
              readOnly={isNew}
              className="mt-1 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-slate-700 focus:border-cyan-600 focus:outline-none"
              placeholder="Auto"
            />
          </div>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">RC / Reference client {isSalesDocument ? <span className="text-red-500">*</span> : null}</span>
            <input
              name="client_reference"
              value={form.client_reference}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
              placeholder="RC / Reference client"
              required={isSalesDocument}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Responsable</span>
            <input
              name="responsible_name"
              value={form.responsible_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
              placeholder="Nom du responsable"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">{subjectLabel}</span>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
              placeholder={subjectLabel}
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Statut</span>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Date document</span>
            <input
              type="date"
              name="document_date"
              value={form.document_date}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">{dueDateLabel}</span>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Statut livraison</span>
            <select
              name="delivery_status"
              value={form.delivery_status}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
            >
              <option value="pending">En attente</option>
              <option value="in_progress">En preparation</option>
              <option value="partial">Livre partiel</option>
              <option value="delivered">Livre</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Statut paiement</span>
            <select
              name="payment_status"
              value={form.payment_status}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
            >
              <option value="unpaid">Non paye</option>
              <option value="advance">Avance payee</option>
              <option value="partial">Partiellement paye</option>
              <option value="paid">Paye</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Montant avance</span>
            <input
              type="number"
              name="advance_amount"
              value={form.advance_amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
            />
          </label>

          <div className="md:col-span-2">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">Articles</h3>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/catalogue/articles"
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  + Ajouter un article dans le catalogue
                </Link>
              </div>
            </div>
            <div className="overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-[1080px] w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-2 py-2">Catalogue</th>
                    <th className="px-2 py-2">Reference</th>
                    <th className="px-2 py-2">Designation</th>
                    <th className="px-2 py-2">PU HT</th>
                    <th className="px-2 py-2">Unite</th>
                    <th className="px-2 py-2">Quantite</th>
                    <th className="px-2 py-2">TVA %</th>
                    <th className="px-2 py-2">Total HT</th>
                    <th className="w-12 px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {items.map((item, index) => {
                    const isSection = (item.line_type || 'article') === 'section';

                    if (isSection) {
                      return (
                        <tr key={item.id || index} className="bg-slate-100">
                          <td className="px-2 py-2 align-top" colSpan={8}>
                            <input
                              value={item.description}
                              onChange={(event) => handleItemChange(index, 'description', event.target.value)}
                              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-bold uppercase tracking-wide text-slate-950 focus:border-cyan-600 focus:outline-none"
                              placeholder="Titre de section"
                            />
                            <textarea
                              value={item.details}
                              onChange={(event) => handleItemChange(index, 'details', event.target.value)}
                              rows={1}
                              className="mt-1.5 w-full resize-y rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 focus:border-cyan-600 focus:outline-none"
                              placeholder="Description de section"
                            />
                          </td>
                          <td className="px-2 py-2 text-center align-top">
                            <button type="button" onClick={() => removeItemLine(index)} className="text-red-600 hover:text-red-700" title="Supprimer la section">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={item.id || index}>
                        <td className="px-2 py-2 align-top">
                          <select
                            value={item.article_id}
                            onChange={(event) => applyArticleToLine(index, event.target.value)}
                            className="w-40 rounded-md border border-slate-300 px-2 py-1.5 focus:border-cyan-600 focus:outline-none"
                          >
                            <option value="">Article libre</option>
                            {articles.map((article) => (
                              <option key={article.id} value={article.id}>
                                {article.code ? `${article.code} - ${article.name}` : article.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            value={item.reference}
                            onChange={(event) => handleItemChange(index, 'reference', event.target.value)}
                            className="w-36 rounded-md border border-slate-300 px-2 py-1.5 focus:border-cyan-600 focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            value={item.description}
                            onChange={(event) => handleItemChange(index, 'description', event.target.value)}
                            className="w-full min-w-[320px] rounded-md border border-slate-300 px-2 py-1.5 font-semibold text-slate-900 focus:border-cyan-600 focus:outline-none"
                            placeholder="Designation"
                          />
                          <textarea
                            value={item.details}
                            onChange={(event) => handleItemChange(index, 'details', event.target.value)}
                            rows={1}
                            className="mt-1.5 w-full min-w-[320px] resize-y rounded-md border border-slate-300 px-2 py-1.5 leading-5 text-slate-700 focus:border-cyan-600 focus:outline-none"
                            placeholder="Description"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(event) => handleItemChange(index, 'unit_price', event.target.value)}
                            className="w-28 rounded-md border border-slate-300 px-2 py-1.5 text-right focus:border-cyan-600 focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            value={item.unit}
                            onChange={(event) => handleItemChange(index, 'unit', event.target.value)}
                            className="w-20 rounded-md border border-slate-300 px-2 py-1.5 focus:border-cyan-600 focus:outline-none"
                            placeholder="u"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(event) => handleItemChange(index, 'quantity', event.target.value)}
                            className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right focus:border-cyan-600 focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-2 align-top">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.tax_rate}
                            onChange={(event) => handleItemChange(index, 'tax_rate', event.target.value)}
                            className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-right focus:border-cyan-600 focus:outline-none"
                          />
                        </td>
                        <td className="px-2 py-2 text-right align-top font-medium text-slate-900">
                          {lineTotalHt(item).toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-center align-top">
                          <button type="button" onClick={() => removeItemLine(index)} className="text-red-600 hover:text-red-700" title="Supprimer la ligne">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={addItemLine}
                className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                <PlusIcon className="h-4 w-4" /> Ajouter une ligne
              </button>
              <button
                type="button"
                onClick={addSectionLine}
                className="inline-flex items-center gap-2 rounded-md bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-900"
              >
                Ajouter section
              </button>
            </div>
          </div>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
              placeholder={defaultConditions}
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 p-5">
          <Link to={config.back} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <section className="print-document" style={printStyles.page}>
        <div className="print-header" style={printStyles.header}>
          <div>
            <div className="print-logo-text" style={printStyles.logoBox}>
              <img src={logoImage} alt="PRO LINE INOX" style={printStyles.logoImage} />
            </div>
            <h1 style={printStyles.title}>{config.label}</h1>
            <table className="print-meta" style={printStyles.metaTable}>
              <tbody>
                <tr>
                  <th style={printStyles.metaTh}>Reference</th>
                  <td style={printStyles.metaTd}>{form.reference || 'Auto'}</td>
                </tr>
                <tr>
                  <th style={printStyles.metaTh}>Date</th>
                  <td style={printStyles.metaTd}>{formatDate(form.document_date)}</td>
                </tr>
                <tr>
                  <th style={printStyles.metaTh}>{config.type === 'quote' ? 'Validite' : 'Echeance'}</th>
                  <td style={printStyles.metaTd}>{formatDate(form.due_date)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="print-client" style={printStyles.client}>
            <strong style={{ display: 'block' }}>{selectedCompany?.name || partyLabel}</strong>
            {form.responsible_name ? <span style={{ display: 'block' }}>Responsable: {form.responsible_name}</span> : null}
            {form.subject ? <span style={{ display: 'block' }}>{subjectLabel}: {form.subject}</span> : null}
            <span style={{ display: 'block' }}>ICE : {selectedCompany?.tax_number || ''}</span>
            <span style={{ display: 'block' }}>{selectedCompany?.address || ''}</span>
            <span style={{ display: 'block' }}>{selectedCompany?.city || ''} {selectedCompany?.country || ''}</span>
          </div>
        </div>

        <table className="print-items" style={printStyles.items}>
          <thead>
            <tr>
              <th style={{ ...printStyles.itemHead, width: '16%' }}>Reference</th>
              <th style={{ ...printStyles.itemHead, width: '57%' }}>Designation</th>
              <th style={{ ...printStyles.itemHead, textAlign: 'right' }}>Qte</th>
              <th style={{ ...printStyles.itemHead, textAlign: 'right' }}>PU HT</th>
              <th style={{ ...printStyles.itemHead, textAlign: 'right' }}>PT HT</th>
            </tr>
          </thead>
          <tbody>
            {(printableItems.length ? printableItems : [{ reference: '', description: '', details: '', quantity: '', unit_price: '' }]).map((item, index) => {
              const isSection = (item.line_type || 'article') === 'section';

              if (isSection) {
                return (
                  <tr key={item.id || index}>
                    <td
                      colSpan={5}
                      style={{
                        ...printStyles.itemCell,
                        background: '#f1f5f9',
                        color: '#111827',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                      }}
                    >
                      <div>{item.description}</div>
                      {item.details ? <div style={{ marginTop: '1mm', fontSize: '9.5px', fontWeight: 600, textTransform: 'none' }}>{item.details}</div> : null}
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={item.id || index}>
                  <td style={{ ...printStyles.itemCell, textAlign: 'left' }}>{item.reference || ''}</td>
                  <td style={{ ...printStyles.itemCell, textAlign: 'left' }}>
                    <strong>{item.description}</strong>
                    {item.details ? <div style={{ marginTop: '1mm' }}>{item.details}</div> : null}
                  </td>
                  <td style={{ ...printStyles.itemCell, textAlign: 'right' }}>{item.quantity}</td>
                  <td style={{ ...printStyles.itemCell, textAlign: 'right' }}>{formatMoney(item.unit_price)}</td>
                  <td style={{ ...printStyles.itemCell, textAlign: 'right' }}>{formatMoney(lineTotalHt(item))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="print-summary" style={printStyles.summary}>
          <div className="print-amount-words">
            <strong style={{ display: 'block', marginBottom: '2mm', fontSize: '10px' }}>ARRETE LE PRESENT {config.label.toUpperCase()} A LA SOMME DE :</strong>
            <p>{formatMoney(totalTtc)} dirhams toutes taxes comprises</p>
          </div>

          <table className="print-totals" style={printStyles.totals}>
            <tbody>
              <tr>
                <td style={printStyles.totalCell}>TOTAL HT</td>
                <td style={{ ...printStyles.totalCell, textAlign: 'right' }}>{formatMoney(subtotal)}</td>
              </tr>
              <tr>
                <td style={printStyles.totalCell}>TVA (20%)</td>
                <td style={{ ...printStyles.totalCell, textAlign: 'right' }}>{formatMoney(tax)}</td>
              </tr>
              <tr>
                <td style={{ ...printStyles.totalCell, borderTop: '1px solid #aaa', borderBottom: '1px solid #aaa', fontWeight: 600 }}>Montant NET TTC (MAD)</td>
                <td style={{ ...printStyles.totalCell, borderTop: '1px solid #aaa', borderBottom: '1px solid #aaa', fontWeight: 600, textAlign: 'right' }}>{formatMoney(totalTtc)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print-conditions">
          <strong>CONDITIONS:</strong>
          <p>50% d'avance et 50% a la livraison</p>
        </div>

        <div className="print-notes">
          <strong>NOTES:</strong>
          <p>{printNote}</p>
        </div>

        <div className="print-footer">
          S.A.R.L A.U au capital de 100 000,00 Dhs 26 AVENUE MERS SULTANE TG1 APPT N°3

          Addresse: Rue 7 N 5 ETG 2 Appt N 4 SAADA SIDI BERNOUSSI CASABLANCA;
          Email: contact@inoxproline.ma<br />
          RC 370277 ***** TP : 31621181 ***** LF: 20745460 ***** ICE 001877012000072
        </div>
      </section>

      {showConvertModal && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h3 className="inline-flex items-center gap-2 text-xl font-semibold text-slate-950">
                <ArrowPathIcon className="h-5 w-5" />
                Convertir le document {form.reference || id}
              </h3>
              <button type="button" onClick={() => setShowConvertModal(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConvertSubmit} className="grid gap-4 md:grid-cols-[180px_1fr]">
              <label className="self-center text-right text-sm font-semibold text-slate-700">
                Convertir <span className="text-red-500">*</span>
              </label>
              <input value={form.reference || id} readOnly className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700" />

              <label className="self-center text-right text-sm font-semibold text-slate-700">
                En <span className="text-red-500">*</span>
              </label>
              <select
                value={convertForm.targetType}
                onChange={handleConvertTargetChange}
                className="rounded-md border border-cyan-500 px-3 py-2 focus:border-cyan-600 focus:outline-none"
                required
              >
                {conversionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <label className="self-center text-right text-sm font-semibold text-slate-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={convertForm.document_date}
                onChange={(event) => setConvertForm((current) => ({ ...current, document_date: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
                required
              />

              <label className="self-center text-right text-sm font-semibold text-slate-700">
                Responsable <span className="text-red-500">*</span>
              </label>
              <input
                value={convertForm.responsible_name}
                onChange={(event) => setConvertForm((current) => ({ ...current, responsible_name: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
                placeholder="Nom du responsable"
                required
              />

              <label className="self-center text-right text-sm font-semibold text-slate-700">Objet</label>
              <input
                value={convertForm.subject}
                onChange={(event) => setConvertForm((current) => ({ ...current, subject: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 focus:border-cyan-600 focus:outline-none"
                placeholder="Objet / projet"
              />

              <div className="mt-3 flex justify-end gap-2 md:col-span-2">
                <button type="button" onClick={() => setShowConvertModal(false)} className="rounded border px-4 py-2">
                  Annuler
                </button>
                <button type="submit" disabled={converting} className="inline-flex items-center gap-2 rounded bg-cyan-600 px-4 py-2 font-medium text-white disabled:opacity-60">
                  <ArrowPathIcon className="h-4 w-4" />
                  {converting ? 'Conversion...' : 'Convertir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompanyForm && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">Ajouter un {partyLabel.toLowerCase()}</h3>
              <button type="button" onClick={closeCompanyForm} className="rounded p-1 text-slate-500 hover:bg-slate-100">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="grid gap-3 md:grid-cols-2">
              <input name="name" value={companyForm.name} onChange={handleCompanyChange} placeholder={`Nom ${partyLabel.toLowerCase()} / societe`} className="rounded border px-3 py-2 md:col-span-2" required />
              <input type="email" name="email" value={companyForm.email} onChange={handleCompanyChange} placeholder="Email" className="rounded border px-3 py-2" />
              <input name="phone" value={companyForm.phone} onChange={handleCompanyChange} placeholder="Telephone" className="rounded border px-3 py-2" />
              <input name="city" value={companyForm.city} onChange={handleCompanyChange} placeholder="Ville" className="rounded border px-3 py-2" />
              <input name="country" value={companyForm.country} onChange={handleCompanyChange} placeholder="Pays" className="rounded border px-3 py-2" />
              <input name="tax_number" value={companyForm.tax_number} onChange={handleCompanyChange} placeholder="ICE / Identifiant fiscal" className="rounded border px-3 py-2 md:col-span-2" />
              <textarea name="address" value={companyForm.address} onChange={handleCompanyChange} placeholder="Adresse" rows={3} className="rounded border px-3 py-2 md:col-span-2" />

              <div className="mt-2 flex justify-end gap-2 md:col-span-2">
                <button type="button" onClick={closeCompanyForm} className="rounded border px-4 py-2">
                  Annuler
                </button>
                <button type="submit" disabled={savingCompany} className="rounded bg-cyan-600 px-4 py-2 font-medium text-white disabled:opacity-60">
                  {savingCompany ? 'Ajout...' : 'Ajouter et selectionner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
