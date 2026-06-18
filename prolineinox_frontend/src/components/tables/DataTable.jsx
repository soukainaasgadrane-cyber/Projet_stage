export default function DataTable({ columns = [], data = [], loading = false }) {
  const renderCell = (row, column) => {
    if (typeof column.accessor === 'function') return column.accessor(row);
    return row[column.accessor];
  };

  const isActionColumn = (column) => String(column.header).toLowerCase() === 'actions';

  return (
    <div className="overflow-x-auto rounded-lg bg-white p-4 shadow">
      <table className="w-full border border-slate-200">
        <thead>
          <tr className="bg-slate-50">
            {columns.map((column, index) => (
              <th
                key={index}
                className={`border border-slate-200 p-2 text-left text-sm font-semibold text-slate-700 ${isActionColumn(column) ? 'no-print' : ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-slate-500">
                Chargement...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-slate-500">
                Aucun résultat
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-slate-50">
                {columns.map((column, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={`border border-slate-200 p-2 text-sm text-slate-700 ${isActionColumn(column) ? 'no-print' : ''}`}
                  >
                    {renderCell(row, column)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
