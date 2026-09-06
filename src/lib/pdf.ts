import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportToPDF(element: HTMLElement, filename: string) {
  // Create an off-screen container to strictly control the render layout
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '0';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.width = '800px'; // Force A4-like desktop width
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '40px';
  container.style.boxSizing = 'border-box';
  
  // Clone the target element
  const clone = element.cloneNode(true) as HTMLElement;
  // Strip any max-width constraints so it flows perfectly into the 800px container
  clone.style.maxWidth = 'none';
  clone.style.width = '100%';
  clone.style.margin = '0';
  
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Wait for the browser to calculate the actual layout height of the wrapped text
    await new Promise(resolve => setTimeout(resolve, 150));

    const dataUrl = await toPng(container, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(dataUrl);
    // Calculate the height of the image scaled to fit the A4 width
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if the content spans multiple A4 pages
    while (heightLeft > 0) {
      position -= pdfHeight; // Shift the image up by exactly one page height
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } finally {
    // Clean up the DOM
    document.body.removeChild(container);
  }
}
