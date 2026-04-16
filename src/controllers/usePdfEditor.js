import { useState, useRef, useCallback, useEffect } from 'react'
import { PdfDocument } from '../models/PdfDocument'
import { OverlayElement } from '../models/OverlayElement'
import { loadPdfForPreview, extractPageText } from './renderService'
import { buildPdf, downloadPdf } from './pdfService'

export function usePdfEditor() {
  const [pdfDoc, setPdfDoc] = useState(null)
  const [pdfPreview, setPdfPreview] = useState(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [elements, setElements] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activeTool, setActiveTool] = useState(null) // 'text' | 'image' | 'rect' | 'editText' | null
  const [isDownloading, setIsDownloading] = useState(false)
  const [pdfTextItems, setPdfTextItems] = useState([])
  const [convertedTextIds, setConvertedTextIds] = useState(new Set())
  const canvasSizes = useRef({})

  const loadFile = useCallback(async (file) => {
    const arrayBuffer = await file.arrayBuffer()
    const preview = await loadPdfForPreview(arrayBuffer)
    setPdfDoc(new PdfDocument({ arrayBuffer, numPages: preview.numPages, fileName: file.name }))
    setPdfPreview(preview)
    setCurrentPage(0)
    setElements([])
    setSelectedId(null)
    setActiveTool(null)
    setPdfTextItems([])
    setConvertedTextIds(new Set())
  }, [])

  // Extract text items whenever the page or document changes
  useEffect(() => {
    if (!pdfPreview) return
    let cancelled = false
    extractPageText(pdfPreview, currentPage).then((items) => {
      if (!cancelled) {
        setPdfTextItems(items)
        setConvertedTextIds(new Set())
      }
    })
    return () => { cancelled = true }
  }, [pdfPreview, currentPage])

  const recordCanvasSize = useCallback((pageIdx, size) => {
    canvasSizes.current[pageIdx] = size
  }, [])

  const addElement = useCallback((el) => {
    setElements((prev) => [...prev, el])
    setSelectedId(el.id)
    setActiveTool(null)
  }, [])

  const updateElement = useCallback((id, changes) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...changes } : el)))
  }, [])

  const removeElement = useCallback((id) => {
    setElements((prev) => prev.filter((el) => el.id !== id))
    setSelectedId(null)
  }, [])

  // Called when the user clicks an existing PDF text item in editText mode.
  // Converts it into a draggable/editable overlay and removes it from the text layer.
  const convertTextItem = useCallback((item) => {
    const el = new OverlayElement({
      type: 'textEdit',
      page: currentPage,
      x: item.x,
      y: item.y,
      width: Math.max(item.width, 20),
      height: item.height,
      content: item.text,
      pdfFontSize: item.pdfFontSize,
      canvasFontSize: item.canvasFontSize,
      color: '#000000',
      bold: false,
    })
    setElements((prev) => [...prev, el])
    setSelectedId(el.id)
    setConvertedTextIds((prev) => new Set([...prev, item.id]))
  }, [currentPage])

  const download = useCallback(async () => {
    if (!pdfDoc || isDownloading) return
    setIsDownloading(true)
    try {
      const bytes = await buildPdf(pdfDoc.arrayBuffer, elements, canvasSizes.current)
      const base = pdfDoc.fileName.replace(/\.pdf$/i, '')
      downloadPdf(bytes, `${base}_edited.pdf`)
    } catch (err) {
      console.error('PDF build failed:', err)
      alert(`Download failed: ${err.message}`)
    } finally {
      setIsDownloading(false)
    }
  }, [pdfDoc, elements, isDownloading])

  // Global keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId != null) {
        setElements((prev) => prev.filter((el) => el.id !== selectedId))
        setSelectedId(null)
      }
      if (e.key === 'Escape') {
        setSelectedId(null)
        setActiveTool(null)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedId])

  // Text items for the current page, excluding ones already converted to overlays
  const visibleTextItems = pdfTextItems.filter((item) => !convertedTextIds.has(item.id))

  return {
    pdfDoc,
    pdfPreview,
    currentPage,
    setCurrentPage,
    pageElements: elements.filter((el) => el.page === currentPage),
    elements,
    selectedId,
    setSelectedId,
    activeTool,
    setActiveTool,
    loadFile,
    recordCanvasSize,
    addElement,
    updateElement,
    removeElement,
    download,
    isDownloading,
    // Text-editing layer
    pdfTextItems: activeTool === 'editText' ? visibleTextItems : [],
    convertTextItem,
  }
}
