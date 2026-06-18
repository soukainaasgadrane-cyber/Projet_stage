export const downloadPDF = async (pdfRequest, filename) => {
  const response = await pdfRequest;
  const contentType = response.headers?.['content-type'] || '';

  if (!contentType.includes('pdf')) {
    throw new Error('Invalid PDF response');
  }

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
