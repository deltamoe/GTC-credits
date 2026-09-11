import { GITHUB_REPO_URL } from "@/lib/site";

export type PdfExportMode = "grades" | "planning";

const MAX_CANVAS_DIMENSION = 16384;
const PDF_CAPTURE_WIDTH_PX = 794;
const PDF_FOOTER_LABEL = "github.com/deltamoe/GTC-credits";

type Html2Canvas = typeof import("html2canvas-pro").default;

type JsPDFConstructor = typeof import("jspdf").jsPDF;

async function loadHtml2Canvas(): Promise<Html2Canvas> {
  const mod = await import("html2canvas-pro");
  return mod.default;
}

async function loadJsPDF(): Promise<JsPDFConstructor> {
  const mod = await import("jspdf");
  if (typeof mod.jsPDF === "function") {
    return mod.jsPDF;
  }

  const defaultExport = mod.default as
    | JsPDFConstructor
    | { jsPDF?: JsPDFConstructor };

  if (typeof defaultExport === "function") {
    return defaultExport;
  }

  if (defaultExport && typeof defaultExport.jsPDF === "function") {
    return defaultExport.jsPDF;
  }

  throw new Error("Could not load jsPDF constructor");
}

function computeScale(element: HTMLElement, pdfWidthMm: number): number {
  const targetDpi = 320;
  const elementWidthPx = element.clientWidth || 1024;
  const desiredCanvasWidthPx = Math.round((pdfWidthMm / 25.4) * targetDpi);
  let scale = Math.min(2, Math.max(1, desiredCanvasWidthPx / elementWidthPx));

  const contentHeight = element.scrollHeight;
  while (
    (elementWidthPx * scale > MAX_CANVAS_DIMENSION ||
      contentHeight * scale > MAX_CANVAS_DIMENSION) &&
    scale > 0.5
  ) {
    scale *= 0.75;
  }

  return scale;
}

function prepareElementForCapture(
  element: HTMLElement,
  mode: PdfExportMode,
): () => void {
  const previousWidth = element.style.width;
  const previousMaxWidth = element.style.maxWidth;
  const previousPadding = element.style.padding;
  element.style.width = `${PDF_CAPTURE_WIDTH_PX}px`;
  element.style.maxWidth = `${PDF_CAPTURE_WIDTH_PX}px`;
  element.style.padding = "12px";
  element.dataset.pdfExportMode = mode;

  return () => {
    element.style.width = previousWidth;
    element.style.maxWidth = previousMaxWidth;
    element.style.padding = previousPadding;
    delete element.dataset.pdfExportMode;
  };
}

function addPdfFooter(
  pdf: InstanceType<JsPDFConstructor>,
  pdfWidth: number,
  pdfHeight: number,
): void {
  const prefix = "Exported from GTC Neuro Credits • ";
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  const footerY = pdfHeight - 6;
  const totalWidth = pdf.getTextWidth(prefix + PDF_FOOTER_LABEL);
  const startX = pdfWidth / 2 - totalWidth / 2;
  pdf.text(prefix, startX, footerY);
  pdf.textWithLink(PDF_FOOTER_LABEL, startX + pdf.getTextWidth(prefix), footerY, {
    url: GITHUB_REPO_URL,
  });
}

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string,
  mode: PdfExportMode = "grades",
): Promise<void> {
  const html2canvas = await loadHtml2Canvas();
  const jsPDF = await loadJsPDF();

  const restoreElement = prepareElementForCapture(element, mode);

  try {
    // Allow layout to settle after disabling interactive controls.
    await new Promise((resolve) => setTimeout(resolve, 150));

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const scale = computeScale(element, pdfWidth);

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: PDF_CAPTURE_WIDTH_PX,
      windowWidth: PDF_CAPTURE_WIDTH_PX,
    });

    const pageWidthPx = canvas.width;
    const pageHeightPx = Math.floor((canvas.width * pdfHeight) / pdfWidth);
    const imgWidth = pdfWidth;

    let yPx = 0;
    while (yPx < canvas.height) {
      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - yPx);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = pageWidthPx;
      pageCanvas.height = sliceHeightPx;

      const ctx = pageCanvas.getContext("2d");
      if (!ctx) break;

      ctx.drawImage(
        canvas,
        0,
        yPx,
        pageWidthPx,
        sliceHeightPx,
        0,
        0,
        pageWidthPx,
        sliceHeightPx,
      );

      const pageDataUrl = pageCanvas.toDataURL("image/png");
      const pageImgHeightMm = (sliceHeightPx * imgWidth) / pageWidthPx;

      pdf.addImage(pageDataUrl, "PNG", 0, 0, imgWidth, pageImgHeightMm);
      addPdfFooter(pdf, pdfWidth, pdfHeight);

      yPx += sliceHeightPx;
      if (yPx < canvas.height) {
        pdf.addPage();
      }
    }

    pdf.save(filename);
  } finally {
    restoreElement();
  }
}
