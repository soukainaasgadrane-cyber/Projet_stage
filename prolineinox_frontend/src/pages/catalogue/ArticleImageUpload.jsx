import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function ArticleImageUpload() {
  const [articles, setArticles] = useState([]);
  const [articleId, setArticleId] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const selectedArticle = articles.find((article) => String(article.id) === String(articleId));
  const previewUrl = useMemo(() => {
    if (image) return URL.createObjectURL(image);
    return selectedArticle?.image_url || '';
  }, [image, selectedArticle]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await api.get('/articles');
        setArticles(res.data.data || []);
      } catch (error) {
        toast.error('Erreur chargement articles');
      }
    };

    fetchArticles();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!articleId || !image) {
      toast.error('Choisir article et image');
      return;
    }

    const payload = new FormData();
    payload.append('image', image);

    try {
      setLoading(true);
      const res = await api.post(`/articles/${articleId}/image`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setArticles((current) => current.map((article) => (
        article.id === res.data.data.id ? res.data.data : article
      )));
      setImage(null);
      toast.success('Image enregistree');
    } catch (error) {
      const errors = error.response?.data?.errors;
      const firstError = errors ? Object.values(errors).flat()[0] : null;
      toast.error(firstError || 'Erreur upload image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Upload Image Article</h2>
          <p className="text-sm text-slate-500">Le nom du fichier est sauvegarde dans MySQL.</p>
        </div>
        <Link to="/catalogue/articles" className="border px-4 py-2 rounded flex items-center gap-2 hover:bg-slate-50">
          <ArrowLeftIcon className="h-5 w-5" /> Retour
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="p-4 grid gap-5 md:grid-cols-[260px_1fr]">
        <div>
          <div className="h-56 overflow-hidden rounded border bg-slate-50">
            {previewUrl ? (
              <img src={previewUrl} alt="Article" className="h-full w-full object-cover" />
            ) : (
              <PhotoIcon className="m-auto mt-20 h-16 w-16 text-slate-300" />
            )}
          </div>
          {selectedArticle?.image_filename && (
            <p className="mt-2 break-all text-sm text-slate-500">{selectedArticle.image_filename}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nom article</label>
          <select
            value={articleId}
            onChange={(event) => {
              setArticleId(event.target.value);
              setImage(null);
            }}
            className="w-full border rounded px-3 py-2 mb-4"
            required
          >
            <option value="">Choisir un article</option>
            {articles.map((article) => (
              <option key={article.id} value={article.id}>
                {article.name} - {article.code}
              </option>
            ))}
          </select>

          <label className="block text-sm font-medium text-slate-700 mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImage(event.target.files?.[0] || null)}
            className="w-full border rounded px-3 py-2 mb-5"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60"
          >
            {loading ? 'Upload...' : 'Enregistrer image'}
          </button>
        </div>
      </form>
    </div>
  );
}
