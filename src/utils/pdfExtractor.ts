import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker to use a CDN or local worker if available.
// Vite + pdfjs-dist can be tricky, so using the standard unpkg/cdnjs approach is reliable.
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items from the page
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
          
        fullText += pageText + "\n\n";
      }
      
      resolve(fullText.trim());
    } catch (err) {
      console.error("PDF Extraction error:", err);
      reject(err);
    }
  });
}
