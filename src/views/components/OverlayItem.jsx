import { useRef, useState } from 'react'

export default function OverlayItem({ element, isSelected, onSelect, onUpdate, onRemove }) {
  const { type, x, y, width, height } = element

  // textEdit elements open immediately in edit mode when first placed
  const [editing, setEditing] = useState(type === 'textEdit')

  const dragOrigin = useRef(null)
  const resizeOrigin = useRef(null)

  const startDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onSelect()

    dragOrigin.current = { mx: e.clientX, my: e.clientY, ox: x, oy: y }
    const onMove = (e) => {
      onUpdate({
        x: dragOrigin.current.ox + e.clientX - dragOrigin.current.mx,
        y: dragOrigin.current.oy + e.clientY - dragOrigin.current.my,
      })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const startResize = (e) => {
    e.preventDefault()
    e.stopPropagation()
    resizeOrigin.current = { mx: e.clientX, my: e.clientY, ow: width, oh: height }
    const onMove = (e) => {
      onUpdate({
        width: Math.max(40, resizeOrigin.current.ow + e.clientX - resizeOrigin.current.mx),
        height: Math.max(16, resizeOrigin.current.oh + e.clientY - resizeOrigin.current.my),
      })
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  const isTextType = type === 'text' || type === 'textEdit'
  const displayFontSize = type === 'textEdit' ? element.canvasFontSize : element.fontSize
  const textStyle = {
    fontSize: displayFontSize,
    color: element.color,
    fontWeight: element.bold ? 'bold' : 'normal',
  }

  return (
    <div
      className={`overlay-item ${type} ${isSelected ? 'selected' : ''}`}
      style={{ position: 'absolute', left: x, top: y, width, height }}
      onMouseDown={startDrag}
      onClick={(e) => { e.stopPropagation(); onSelect() }}
      onDoubleClick={isTextType ? (e) => { e.stopPropagation(); setEditing(true) } : undefined}
    >
      {isTextType && (
        editing ? (
          <textarea
            autoFocus
            value={element.content}
            style={textStyle}
            onChange={(e) => onUpdate({ content: e.target.value })}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); setEditing(false) } }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className={`text-display${type === 'textEdit' ? ' textedit-bg' : ''}`}
            style={textStyle}
          >
            {element.content || <span className="placeholder">Double-click to edit</span>}
          </div>
        )
      )}

      {type === 'image' && (
        <img
          src={element.src}
          alt=""
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}

      {type === 'rect' && (
        <div style={{ width: '100%', height: '100%', background: element.fillColor }} />
      )}

      {isSelected && (
        <>
          <button
            className="item-delete-btn"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            title="Delete (Del)"
          >
            ×
          </button>
          <div className="resize-handle" onMouseDown={startResize} title="Drag to resize" />
        </>
      )}
    </div>
  )
}
