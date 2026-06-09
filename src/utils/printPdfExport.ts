import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import type { EbookSection } from './pdfParser';
import type { ThemeId } from '../themes/types';
import { PageLayout } from '../components/PageLayout';
import { yieldToBrowser, waitForExportImages } from './pdfExport';

export interface PrintPdfExportOptions {
  sections: EbookSection[];
  bookTitle: string;
  selectedTheme: ThemeId;
  customThemeStyles?: React.CSSProperties;
  onProgress?: (current: number, total: number) => void;
  signal?: AbortSignal;
  dimensions?: 'letter' | 'a4' | 'legal';
}

export async function exportPrintPdf(options: PrintPdfExportOptions): Promise<void> {
  const { sections, bookTitle, selectedTheme, customThemeStyles, onProgress, signal, dimensions } = options;

  const widthMap = {
    a4: 794,
    letter: 816,
    legal: 816,
  };
  const heightMap = {
    a4: 1123,
    letter: 1056,
    legal: 1344,
  };

  const selectedSize = dimensions || 'a4';
  const w = widthMap[selectedSize];
  const h = heightMap[selectedSize];

  // 1. Create a hidden print mount point in the document.body
  const mountPoint = document.createElement('div');
  mountPoint.id = 'ebook-print-mount';
  mountPoint.style.position = 'fixed';
  mountPoint.style.left = '-9999px';
  mountPoint.style.top = '-9999px';
  mountPoint.style.width = `${w}px`;
  document.body.appendChild(mountPoint);

  const root = createRoot(mountPoint);

  // 2. Render all pages in the list inside the mountPoint
  const pagesElement = React.createElement(
    'div',
    { className: `theme-${selectedTheme}`, style: customThemeStyles },
    sections.map((section, idx) =>
      React.createElement(
        'div',
        {
          key: section.id,
          className: 'print-page-container',
        },
        React.createElement(PageLayout, {
          section,
          pageIndex: idx + 1,
          totalPages: sections.length,
          bookTitle,
          selectedTheme,
          onUpdateSection: () => { },
          onDeleteSection: () => { },
          onRegenerateImage: async () => { },
          isGeneratingImage: false,
          isActive: true,
          pdfExportMode: true,
        })
      )
    )
  );

  flushSync(() => {
    root.render(pagesElement);
  });

  // Yield to browser and wait for images to load
  await yieldToBrowser(100);
  await waitForExportImages(mountPoint, 15000);
  await yieldToBrowser(300);
  await new Promise(resolve => setTimeout(resolve, 500));

  if (signal?.aborted) {
    root.unmount();
    mountPoint.remove();
    throw new Error('Export cancelled.');
  }

  // 3. Open a new window for printing
  const newWin = window.open('', '_blank');
  if (!newWin) {
    root.unmount();
    mountPoint.remove();
    throw new Error('Please enable popups to export PDF.');
  }

  // 4. Collect stylesheet links as markup strings
  const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(style => style.outerHTML)
    .join('\n');

  // 5. Serialize customThemeStyles object to string inline CSS
  const bodyInlineStyle = customThemeStyles
    ? Object.entries(customThemeStyles)
        .map(([k, v]) => `${k}:${v}`)
        .join(';')
    : '';

  // 6. Write complete HTML structure to popup print window
  newWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${bookTitle || 'ebook'}_ebook</title>
        ${styleTags}
        <style>
          @page {
            size: ${w}px ${h}px;
            margin: 0;
          }
          * { box-sizing: border-box !important; }
          body { margin: 0 !important; padding: 0 !important; width: ${w}px !important; }
          .print-wrapper { width: ${w}px !important; margin: 0 !important; }
          
          .print-page-container {
            width: ${w}px !important;
            height: ${h}px !important;
            max-height: ${h}px !important;
            overflow: hidden !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          
          .pdf-export-page {
            width: ${w}px !important;
            max-width: ${w}px !important;
            height: ${h}px !important;
            min-height: unset !important;
            max-height: ${h}px !important;
            overflow: hidden !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
          }
          
          @media print {
            * { box-sizing: border-box !important; }
            .pdf-export-page {
              width: ${w}px !important;
              max-width: ${w}px !important;
              height: ${h}px !important;
              min-height: unset !important;
              max-height: ${h}px !important;
              overflow: hidden !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
            }
            .print-page-container {
              width: ${w}px !important;
              height: ${h}px !important;
              max-height: ${h}px !important;
              overflow: hidden !important;
              page-break-after: always !important;
              page-break-inside: avoid !important;
            }
          }
        </style>
      </head>
      <body class="theme-${selectedTheme}" style="${bodyInlineStyle}">
        <div class="print-wrapper">
          ${mountPoint.innerHTML}
        </div>
      </body>
    </html>
  `);

  newWin.document.close();

  // 6. Trigger progress reporting to 100%
  onProgress?.(sections.length, sections.length);

  // 7. Wait a brief moment to ensure fonts and styles apply in the print window
  await new Promise<void>((resolve) => setTimeout(resolve, 800));

  if (signal?.aborted) {
    newWin.close();
    root.unmount();
    mountPoint.remove();
    throw new Error('Export cancelled.');
  }

  // 8. Focus and print the new window
  newWin.focus();
  newWin.print();

  // 9. Close the new window and clean up mountPoint
  newWin.close();
  root.unmount();
  mountPoint.remove();
}
