import { useEffect, useRef } from 'react'
import { renderPageToCanvas } from '../../controllers/renderService'

export default function PdfCanvas({ pdfPreview, currentPage, onSizeChange }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!pdfPreview || !canvasRef.current) return
    renderPageToCanvas(pdfPreview, currentPage, canvasRef.current, 1.5)
      .then((size) => onSizeChange(currentPage, size))
  }, [pdfPreview, currentPage, onSizeChange])

  return <canvas ref={canvasRef} className="pdf-canvas" />
}
