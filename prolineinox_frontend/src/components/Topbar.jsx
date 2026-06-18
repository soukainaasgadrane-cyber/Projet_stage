export default function Topbar() {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between">
      <h2 className="font-semibold text-lg">Contacts</h2>

      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          + Ajouter
        </button>

        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Importer
        </button>

        <button className="bg-emerald-600 text-white px-4 py-2 rounded">
          Exporter
        </button>
      </div>
    </div>
  );
}