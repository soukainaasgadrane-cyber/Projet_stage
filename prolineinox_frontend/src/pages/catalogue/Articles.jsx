import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import DataTable from '../../components/tables/DataTable';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, DocumentArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '../../utils/currency';
import toast from 'react-hot-toast';

const defaultForm = {
  code: '',
  name: '',
  description: '',
  selling_price: '',
  stock_quantity: '',
  unit: 'piece',
  height_cm: '',
  length_cm: '',
  width_cm: '',
  depth_cm: '',
  price_start_cm: 60,
  price_step_cm: 20,
  price_step_amount: '',
  image: null,
  image_url: '',
};

const numberOrZero = (value) => Number(value) || 0;

function buildPriceVariants(article) {
  const start = Math.max(1, Number(article.price_start_cm) || 60);
  const step = Math.max(1, Number(article.price_step_cm) || 20);
  const basePrice = numberOrZero(article.selling_price);
  const stepAmount = numberOrZero(article.price_step_amount);
  const maxLength = Math.max(start, numberOrZero(article.length_cm) || start + step * 2);
  const baseWidth = 40;
  const maxWidth = Math.max(baseWidth, numberOrZero(article.width_cm) || baseWidth);
  const variants = [];
  const rowCount = Math.floor((maxLength - start) / step) + 1;
  const widthRampSteps = Math.max(1, rowCount - 2);

  for (let length = start, index = 0; length <= maxLength; length += step, index += 1) {
    const width = index < 2
      ? baseWidth
      : baseWidth + ((maxWidth - baseWidth) / widthRampSteps) * (index - 1);

    variants.push({
      length_cm: length,
      width_cm: Math.round(width),
      price: basePrice + index * stepAmount,
    });
  }

  return variants;
}

function dimensionText(article) {
  const parts = [
    article.height_cm ? `H ${article.height_cm} cm` : null,
    article.length_cm ? `Longueur ${article.length_cm} cm` : null,
    article.width_cm ? `Largeur ${article.width_cm} cm` : null,
    article.depth_cm ? `P ${article.depth_cm} cm` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(' x ') : 'Dimensions non renseignees';
}

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const previewUrl = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    return form.image_url || '';
  }, [form.image, form.image_url]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    fetchArticles();
  }, [search]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/articles', { params: { search } });
      setArticles(res.data.data || []);
    } catch (err) {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (article) => {
    setEditing(article);
    setForm({
      ...defaultForm,
      ...article,
      image: null,
      image_url: article.image_url || '',
      price_step_amount: article.price_step_amount || '',
    });
    setShowModal(true);
  };

  const makePayload = () => {
    const payload = new FormData();
    const variants = buildPriceVariants(form);

    Object.entries({
      code: form.code,
      name: form.name,
      description: form.description || '',
      selling_price: form.selling_price || 0,
      stock_quantity: form.stock_quantity || 0,
      unit: form.unit || 'piece',
      height_cm: form.height_cm || '',
      length_cm: form.length_cm || '',
      width_cm: form.width_cm || '',
      depth_cm: form.depth_cm || '',
      price_start_cm: form.price_start_cm || 60,
      price_step_cm: form.price_step_cm || 20,
      price_step_amount: form.price_step_amount || 0,
      price_variants: JSON.stringify(variants),
    }).forEach(([key, value]) => payload.append(key, value));

    if (form.image) payload.append('image', form.image);
    if (editing) payload.append('_method', 'PUT');

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editing) {
        await api.post(`/articles/${editing.id}`, makePayload(), {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Modifie');
      } else {
        await api.post('/articles', makePayload(), {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Cree');
      }

      setShowModal(false);
      fetchArticles();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      toast.error(firstError || 'Erreur enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Supprimer ?')) {
      try {
        await api.delete(`/articles/${id}`);
        setArticles((current) => current.filter((article) => article.id !== id));
        toast.success('Supprime');
      } catch (error) {
        const errors = error.response?.data?.errors;
        const firstError = errors ? Object.values(errors).flat()[0] : null;
        toast.error(firstError || error.response?.data?.message || 'Erreur suppression');
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post('/import/articles', fd);
      toast.success('Importe');
      fetchArticles();
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      toast.error(firstError || 'Erreur import fichier Excel/CSV');
    } finally {
      e.target.value = '';
    }
  };

  const columns = [
    {
      header: 'Image',
      accessor: (row) => (
        <div className="h-12 w-12 overflow-hidden rounded border bg-slate-50">
          {row.image_url ? (
            <img src={row.image_url} alt={row.name} className="h-full w-full object-cover" />
          ) : (
            <PhotoIcon className="m-3 h-6 w-6 text-slate-300" />
          )}
        </div>
      ),
    },
    { header: 'Code', accessor: 'code' },
    { header: 'Nom', accessor: 'name' },
    { header: 'Dimensions', accessor: dimensionText },
    { header: 'Prix 60cm', accessor: (row) => formatCurrency(row.selling_price) },
    { header: 'Stock', accessor: 'stock_quantity' },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEditModal(row)} className="text-blue-600" title="Modifier">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={() => handleDelete(row.id)} className="text-red-600" title="Supprimer">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex justify-between flex-wrap gap-2">
        <h2 className="text-xl font-bold">Catalogue articles</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/catalogue/articles/upload-image" className="bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2">
            <PhotoIcon className="w-5 h-5" /> Upload Image
          </Link>
          <button onClick={openCreateModal} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <PlusIcon className="w-5 h-5" /> Ajouter
          </button>
          <label className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer flex items-center gap-2" title="Importer un fichier .xlsx, .xls ou .csv">
            <DocumentArrowUpIcon className="w-5 h-5" /> Importer Excel/CSV
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Ecrire le nom ou le code de l'article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
        />

        {search && articles.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2 mb-6">
            {articles.map((article) => {
              const variants = article.price_variants?.length ? article.price_variants : buildPriceVariants(article);

              return (
                <div key={article.id} className="border rounded p-4">
                  <div className="flex gap-4">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded border bg-slate-50">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.name} className="h-full w-full object-cover" />
                      ) : (
                        <PhotoIcon className="m-9 h-10 w-10 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-900">{article.name}</h3>
                      <p className="text-sm text-slate-500">{article.code}</p>
                      <p className="mt-2 text-sm text-slate-700">{dimensionText(article)}</p>
                    </div>
                  </div>

                  <div className="mt-4 overflow-hidden rounded border">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-3 py-2 text-left">Longueur</th>
                          <th className="px-3 py-2 text-left">Largeur</th>
                          <th className="px-3 py-2 text-right">Prix auto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {variants.map((variant) => (
                          <tr key={`${variant.length_cm}-${variant.width_cm}`} className="border-t">
                            <td className="px-3 py-2">{variant.length_cm} cm</td>
                            <td className="px-3 py-2">{variant.width_cm} cm</td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(variant.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DataTable columns={columns} data={articles} loading={loading} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">{editing ? 'Modifier' : 'Nouvel'} article</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                <div>
                  <div className="h-36 w-full overflow-hidden rounded border bg-slate-50">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Apercu article" className="h-full w-full object-cover" />
                    ) : (
                      <PhotoIcon className="m-auto mt-12 h-12 w-12 text-slate-300" />
                    )}
                  </div>
                  <label className="mt-3 block cursor-pointer rounded border px-3 py-2 text-center text-sm hover:bg-slate-50">
                    Image article
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input type="text" placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border rounded px-3 py-2" required />
                    <input type="text" placeholder="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" required />
                    <input type="number" step="0.01" placeholder="Prix base 60 x 40" value={form.selling_price} onChange={(e) => setForm({ ...form, selling_price: e.target.value })} className="w-full border rounded px-3 py-2" required />
                    <input type="number" step="0.01" placeholder="Augmentation par pas" value={form.price_step_amount} onChange={(e) => setForm({ ...form, price_step_amount: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="number" step="0.01" placeholder="Hauteur cm" value={form.height_cm || ''} onChange={(e) => setForm({ ...form, height_cm: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="number" step="0.01" placeholder="Longueur max cm" value={form.length_cm || ''} onChange={(e) => setForm({ ...form, length_cm: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="number" step="0.01" placeholder="Largeur max cm" value={form.width_cm || ''} onChange={(e) => setForm({ ...form, width_cm: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="number" step="0.01" placeholder="Profondeur cm" value={form.depth_cm || ''} onChange={(e) => setForm({ ...form, depth_cm: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="number" placeholder="Stock initial" value={form.stock_quantity || ''} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="number" placeholder="Depart cm" value={form.price_start_cm || 60} onChange={(e) => setForm({ ...form, price_start_cm: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="number" placeholder="Pas longueur cm" value={form.price_step_cm || 20} onChange={(e) => setForm({ ...form, price_step_cm: e.target.value })} className="w-full border rounded px-3 py-2" />
                    <input type="text" placeholder="Unite" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full border rounded px-3 py-2 md:col-span-2" />
                  </div>

                  <textarea
                    placeholder="Description"
                    value={form.description || ''}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-3 w-full border rounded px-3 py-2"
                    rows="2"
                  />
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Longueur</th>
                      <th className="px-3 py-2 text-left">Largeur</th>
                      <th className="px-3 py-2 text-right">Prix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildPriceVariants(form).map((variant) => (
                      <tr key={`${variant.length_cm}-${variant.width_cm}`} className="border-t">
                        <td className="px-3 py-2">{variant.length_cm} cm</td>
                        <td className="px-3 py-2">{variant.width_cm} cm</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(variant.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 mt-5">
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
