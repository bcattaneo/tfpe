import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

function hexToRgb(hex) {
  return rgb(
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  )
}

// Convert canvas pixel coordinates to PDF point coordinates.
// Canvas: origin top-left, y increases downward.
// PDF:    origin bottom-left, y increases upward.
function toPdfCoords(el, canvasSize, pdfSize) {
  const sx = pdfSize.width / canvasSize.width
  const sy = pdfSize.height / canvasSize.height
  return {
    x: el.x * sx,
    y: pdfSize.height - (el.y + el.height) * sy,
    w: el.width * sx,
    h: el.height * sy,
  }
}

export async function buildPdf(originalArrayBuffer, elements, canvasSizes) {
  const pdfDoc = await PDFDocument.load(originalArrayBuffer)
  const pages = pdfDoc.getPages()

  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  // Group elements by page index
  const byPage = {}
  for (const el of elements) {
    ;(byPage[el.page] ??= []).push(el)
  }

  for (const [pageStr, pageElements] of Object.entries(byPage)) {
    const pageIdx = parseInt(pageStr)
    const page = pages[pageIdx]
    if (!page) continue

    const pdfSize = page.getSize()
    const canvasSize = canvasSizes[pageIdx] ?? pdfSize

    for (const el of pageElements) {
      const { x, y, w, h } = toPdfCoords(el, canvasSize, pdfSize)

      if (el.type === 'rect') {
        page.drawRectangle({ x, y, width: w, height: h, color: hexToRgb(el.fillColor) })
      }

      if (el.type === 'text' && el.content.trim()) {
        const font = el.bold ? helveticaBold : helvetica
        const avgScale = (pdfSize.width / canvasSize.width + pdfSize.height / canvasSize.height) / 2
        page.drawText(el.content, {
          x,
          y: y + h * 0.15,
          size: el.fontSize * avgScale,
          font,
          color: hexToRgb(el.color),
          maxWidth: w,
        })
      }

      // textEdit: white-box over original text + replacement text at the original font size
      if (el.type === 'textEdit') {
        page.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1) })
        if (el.content.trim()) {
          const font = el.bold ? helveticaBold : helvetica
          page.drawText(el.content, {
            x: x + 1,
            y: y + h * 0.1,
            size: el.pdfFontSize,
            font,
            color: hexToRgb(el.color),
            maxWidth: w,
          })
        }
      }

      if (el.type === 'image' && el.imageBytes) {
        const image = el.imageType === 'png'
          ? await pdfDoc.embedPng(el.imageBytes)
          : await pdfDoc.embedJpg(el.imageBytes)
        page.drawImage(image, { x, y, width: w, height: h })
      }
    }
  }

  return pdfDoc.save()
}

export function downloadPdf(bytes, fileName) {
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  // Must be in the DOM for Firefox; cleanup after the browser queues the download
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
