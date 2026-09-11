import { GITHUB_REPO_URL } from "@/lib/site";
import { computePdfPageStarts } from "@/lib/pdfBlocks";

export type PdfExportMode = "grades" | "planning";

const MAX_CANVAS_DIMENSION = 16384;
const PDF_CAPTURE_WIDTH_PX = 794;
const PDF_FOOTER_LABEL = "github.com/deltamoe/GTC-credits";
const PDF_TOP_MARGIN_MM = 18;
const PDF_CONTINUATION_TOP_MARGIN_MM = 24;
const PDF_FOOTER_MARGIN_MM = 20;
const PDF_FOOTER_TEXT_OFFSET_MM = 10;
const PDF_CONTENT_SAFETY_BUFFER_PX = 20;

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
  element.style.padding = "20px";
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
  const prefix = "Exported from GTC of Neuroscience Credits • ";
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  const footerY = pdfHeight - PDF_FOOTER_TEXT_OFFSET_MM;
  const totalWidth = pdf.getTextWidth(prefix + PDF_FOOTER_LABEL);
  const startX = pdfWidth / 2 - totalWidth / 2;
  pdf.text(prefix, startX, footerY);
  pdf.textWithLink(PDF_FOOTER_LABEL, startX + pdf.getTextWidth(prefix), footerY, {
    url: GITHUB_REPO_URL,
  });
}

function domHeightToCanvasHeight(
  domHeight: number,
  elementScrollHeight: number,
  canvasHeight: number,
): number {
  return Math.round((domHeight / elementScrollHeight) * canvasHeight);
}

function getTopMarginMm(pageIndex: number): number {
  return pageIndex === 0 ? PDF_TOP_MARGIN_MM : PDF_CONTINUATION_TOP_MARGIN_MM;
}

function getContentHeightMm(pageIndex: number, pdfHeight: number): number {
  return pdfHeight - getTopMarginMm(pageIndex) - PDF_FOOTER_MARGIN_MM;
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
    const minContentHeightMm = getContentHeightMm(1, pdfHeight);
    const pageContentHeightPx = Math.max(
      1,
      Math.floor((PDF_CAPTURE_WIDTH_PX * minContentHeightMm) / pdfWidth) -
        PDF_CONTENT_SAFETY_BUFFER_PX,
    );
    const scale = computeScale(element, pdfWidth);

    const pageStartsDom = computePdfPageStarts(element, pageContentHeightPx);

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: PDF_CAPTURE_WIDTH_PX,
      windowWidth: PDF_CAPTURE_WIDTH_PX,
    });

    const pageWidthPx = canvas.width;
    const imgWidth = pdfWidth;
    const totalDomHeight = element.scrollHeight;
    const pageEndsDom = [...pageStartsDom.slice(1), totalDomHeight];

    for (let pageIndex = 0; pageIndex < pageStartsDom.length; pageIndex += 1) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const startDom = pageStartsDom[pageIndex];
      const endDom = pageEndsDom[pageIndex];
      const startCanvas = domHeightToCanvasHeight(
        startDom,
        totalDomHeight,
        canvas.height,
      );
      const endCanvas = domHeightToCanvasHeight(
        endDom,
        totalDomHeight,
        canvas.height,
      );
      const sliceHeightPx = Math.max(1, endCanvas - startCanvas);

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = pageWidthPx;
      pageCanvas.height = sliceHeightPx;

      const ctx = pageCanvas.getContext("2d");
      if (!ctx) break;

      ctx.drawImage(
        canvas,
        0,
        startCanvas,
        pageWidthPx,
        sliceHeightPx,
        0,
        0,
        pageWidthPx,
        sliceHeightPx,
      );

      const pageDataUrl = pageCanvas.toDataURL("image/png");
      const topMarginMm = getTopMarginMm(pageIndex);
      const pageImgHeightMm = (sliceHeightPx * imgWidth) / pageWidthPx;

      pdf.addImage(
        pageDataUrl,
        "PNG",
        0,
        topMarginMm,
        imgWidth,
        pageImgHeightMm,
      );
      addPdfFooter(pdf, pdfWidth, pdfHeight);
    }

    pdf.save(filename);
  } finally {
    restoreElement();
  }
}
