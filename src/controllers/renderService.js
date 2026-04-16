import * as pdfjsLib from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.js?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc

// .slice(0) creates a copy so pdfjs can transfer it to its worker
// without detaching the original ArrayBuffer we store in PdfDocument.
export async function loadPdfForPreview(arrayBuffer) {
  return pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise
}

export async function renderPageToCanvas(pdfPreview, pageIndex, canvas, scale = 1.5) {
  const page = await pdfPreview.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale })

  canvas.width = viewport.width
  canvas.height = viewport.height

  await page.render({
    canvasContext: canvas.getContext('2d'),
    viewport,
  }).promise

  return { width: viewport.width, height: viewport.height }
}

// Extract all text items from a page, converting their positions to canvas pixels.
export async function extractPageText(pdfPreview, pageIndex, scale = 1.5) {
  const page = await pdfPreview.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale })
  const textContent = await page.getTextContent()

  const items = []
  textContent.items.forEach((item, i) => {
    // TextMarkedContent entries lack 'str'; skip them
    if (!item.str || !item.str.trim()) return

    const [a, b, c, d, e, f] = item.transform
    // Math.hypot(b, d) = font size for both normal and rotated text
    const pdfFontSize = Math.hypot(b, d) || Math.abs(d) || 10
    const canvasFontSize = pdfFontSize * scale

    // Convert PDF baseline position (bottom-left origin, y-up) to canvas pixels (top-left, y-down)
    const [cx, cy] = viewport.convertToViewportPoint(e, f)

    // cy is the baseline; the visible glyph top is ~85% of the font height above it
    const itemY = cy - canvasFontSize * 0.85
    const itemWidth = item.width > 0
      ? item.width * scale
      : canvasFontSize * item.str.length * 0.55   // rough fallback

    items.push({
      id: `${pageIndex}-${i}`,
      text: item.str,
      x: cx,
      y: itemY,
      width: Math.max(itemWidth, 4),
      height: canvasFontSize * 1.2,
      pdfFontSize,
      canvasFontSize,
    })
  })

  return items
}
