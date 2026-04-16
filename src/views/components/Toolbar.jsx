import { useRef } from 'react'
import { OverlayElement } from '../../models/OverlayElement'

export default function Toolbar({ editor }) {
  const {
    activeTool, setActiveTool,
    selectedId, elements,
    updateElement, addElement,
    currentPage, download, isDownloading, loadFile,
  } = editor

  const fileInputRef = useRef(null)
  const selectedEl = elements.find((el) => el.id === selectedId)
  const toggleTool = (tool) => setActiveTool(activeTool === tool ? null : tool)

  const handleAddImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png,image/jpeg'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const bytes = await file.arrayBuffer()
      const src = URL.createObjectURL(new Blob([bytes], { type: file.type }))
      addElement(new OverlayElement({
        type: 'image',
        page: currentPage,
        x: 50, y: 50, width: 200, height: 150,
        src,
        imageBytes: bytes,
        imageType: file.type === 'image/png' ? 'png' : 'jpeg',
      }))
    }
    input.click()
  }

  const isTextSelected = selectedEl?.type === 'text' || selectedEl?.type === 'textEdit'

  return (
    <header className="toolbar">
      {/* ── Tools ── */}
      <div className="tb-group">
        {/* Edit existing PDF text */}
        <button
          className={`tb-btn${activeTool === 'editText' ? ' active' : ''}`}
          onClick={() => toggleTool('editText')}
          title="Edit existing text — hover to highlight text, click to edit"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {/* Add new text */}
        <button
          className={`tb-btn${activeTool === 'text' ? ' active' : ''}`}
          onClick={() => toggleTool('text')}
          title="Add text — click on the page to place"
        >
          T+
        </button>

        {/* Add image */}
        <button
          className="tb-btn"
          onClick={handleAddImage}
          title="Add image"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21,15 16,10 5,21" />
          </svg>
        </button>

        {/* White cover box */}
        <button
          className={`tb-btn${activeTool === 'rect' ? ' active' : ''}`}
          onClick={() => toggleTool('rect')}
          title="Cover box — place a white rectangle to hide existing content"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
        </button>
      </div>

      <div className="tb-divider" />

      {/* ── Text properties (new text element selected) ── */}
      {selectedEl?.type === 'text' && (
        <div className="tb-group">
          <input
            className="tb-font-size"
            type="number"
            value={selectedEl.fontSize}
            min={6}
            max={120}
            title="Font size"
            onChange={(e) => updateElement(selectedId, { fontSize: Math.max(6, Number(e.target.value)) })}
          />
          <button
            className={`tb-btn bold${selectedEl.bold ? ' active' : ''}`}
            onClick={() => updateElement(selectedId, { bold: !selectedEl.bold })}
            title="Bold"
          >
            B
          </button>
          <input
            className="tb-color"
            type="color"
            value={selectedEl.color}
            title="Text color"
            onChange={(e) => updateElement(selectedId, { color: e.target.value })}
          />
          <div className="tb-divider" />
        </div>
      )}

      {/* ── Text properties (existing text element selected — color + bold only) ── */}
      {selectedEl?.type === 'textEdit' && (
        <div className="tb-group">
          <button
            className={`tb-btn bold${selectedEl.bold ? ' active' : ''}`}
            onClick={() => updateElement(selectedId, { bold: !selectedEl.bold })}
            title="Bold"
          >
            B
          </button>
          <input
            className="tb-color"
            type="color"
            value={selectedEl.color}
            title="Text color"
            onChange={(e) => updateElement(selectedId, { color: e.target.value })}
          />
          <div className="tb-divider" />
        </div>
      )}

      {/* ── Rect fill color ── */}
      {selectedEl?.type === 'rect' && (
        <div className="tb-group">
          <label className="tb-label">Fill</label>
          <input
            className="tb-color"
            type="color"
            value={selectedEl.fillColor}
            title="Fill color"
            onChange={(e) => updateElement(selectedId, { fillColor: e.target.value })}
          />
          <div className="tb-divider" />
        </div>
      )}

      {/* ── Right side ── */}
      <div className="tb-group" style={{ marginLeft: 'auto' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files[0]; if (f) loadFile(f) }}
        />
        <button className="tb-btn" onClick={() => fileInputRef.current.click()} title="Open a different PDF">
          Open
        </button>
        <button
          className="tb-btn download"
          onClick={download}
          disabled={isDownloading}
          title="Download edited PDF"
        >
          {isDownloading ? 'Saving…' : 'Download PDF'}
        </button>
      </div>
    </header>
  )
}
