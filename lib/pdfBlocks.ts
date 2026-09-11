export const PDF_BLOCK = "data-pdf-block";
export const PDF_KEEP_WITH_NEXT = "data-pdf-keep-with-next";

export type PdfBlockProps = {
  [PDF_BLOCK]?: "";
  [PDF_KEEP_WITH_NEXT]?: "";
};

export function pdfBlockProps(
  isExporting: boolean,
  keepWithNext = false,
): PdfBlockProps {
  if (!isExporting) {
    return {};
  }

  return keepWithNext
    ? { [PDF_BLOCK]: "", [PDF_KEEP_WITH_NEXT]: "" }
    : { [PDF_BLOCK]: "" };
}

interface PdfBlockRect {
  top: number;
  bottom: number;
  keepWithNext: boolean;
}

interface PdfBlockGroup {
  top: number;
  bottom: number;
}

function collectPdfBlocks(root: HTMLElement): PdfBlockRect[] {
  const rootRect = root.getBoundingClientRect();
  const blockElements = Array.from(
    root.querySelectorAll(`[${PDF_BLOCK}]`),
  ) as HTMLElement[];

  // Prefer the smallest splittable units so tall cards break between rows.
  const leafBlocks = blockElements.filter(
    (element) =>
      !blockElements.some(
        (other) => other !== element && element.contains(other),
      ),
  );

  return leafBlocks
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const top = rect.top - rootRect.top + root.scrollTop;
      const bottom = top + rect.height;

      return {
        top,
        bottom,
        keepWithNext: element.hasAttribute(PDF_KEEP_WITH_NEXT),
      };
    })
    .sort((a, b) => a.top - b.top);
}

function groupPdfBlocks(blocks: PdfBlockRect[]): PdfBlockGroup[] {
  const groups: PdfBlockGroup[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index];
    let bottom = block.bottom;

    if (block.keepWithNext && index + 1 < blocks.length) {
      bottom = blocks[index + 1].bottom;
      index += 2;
    } else {
      index += 1;
    }

    groups.push({ top: block.top, bottom });
  }

  return groups;
}

export function computePdfPageStarts(
  root: HTMLElement,
  pageContentHeightPx: number,
): number[] {
  const blocks = collectPdfBlocks(root);
  if (blocks.length === 0) {
    return [0];
  }

  const groups = groupPdfBlocks(blocks);
  const pageStarts = [0];
  let pageStart = 0;

  for (const group of groups) {
    const groupHeight = group.bottom - group.top;

    if (groupHeight > pageContentHeightPx) {
      if (group.top > pageStart) {
        pageStarts.push(group.top);
        pageStart = group.top;
      }

      let splitAt = pageStart + pageContentHeightPx;
      while (splitAt < group.bottom) {
        pageStarts.push(splitAt);
        pageStart = splitAt;
        splitAt += pageContentHeightPx;
      }
      continue;
    }

    const usedHeight = group.top - pageStart;
    if (usedHeight + groupHeight > pageContentHeightPx && group.top > pageStart) {
      pageStarts.push(group.top);
      pageStart = group.top;
    }
  }

  return pageStarts;
}
