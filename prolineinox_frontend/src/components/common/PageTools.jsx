import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowDownTrayIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';

const pageLabel = (pathname) => {
  if (pathname === '/') return 'tableau-de-bord';
  return pathname.replace(/^\/+/, '').replaceAll('/', '-');
};

const buildPrintHtml = (title, content) => `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      @page { size: A4; margin: 16mm; }
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; color: #0f172a; background: #fff; font-size: 12px; }
      h1, h2, h3 { color: #0f172a; margin: 0 0 12px; }
      .rounded, .rounded-lg { border-radius: 0 !important; }
      .bg-white { background: #fff !important; }
      .border, .border-b { border-color: #cbd5e1 !important; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
      th { background: #f1f5f9; }
      button, input, select, textarea, .no-print, [aria-label*="Action"] { display: none !important; }
      .shadow, .shadow-sm { box-shadow: none !important; }
    </style>
  </head>
  <body>${content}</body>
</html>`;

export default function PageTools({ children }) {
  const location = useLocation();
  const contentRef = useRef(null);
  const title = ` InoxProline ${pageLabel(location.pathname)}`;

  const handleDownloadPDF = () => {
    const content = contentRef.current?.innerHTML || '';
    const iframe = document.createElement('iframe');

    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printDocument = iframe.contentWindow?.document;
    if (!printDocument) {
      iframe.remove();
      return;
    }

    printDocument.open();
    printDocument.write(buildPrintHtml(title, content));
    printDocument.close();

    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 1000);
    };
  };

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <PrinterIcon className="h-4 w-4" />
          Imprimer
        </button>
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 rounded-md bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          Télécharger PDF
        </button>
      </div>

      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
}
