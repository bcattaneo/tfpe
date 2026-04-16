import { OverlayElement } from '../../models/OverlayElement'
import OverlayItem from './OverlayItem'

export default function OverlayLayer({
  pageElements,
  pdfTextItems,
  selectedId,
  activeTool,
  currentPage,
  onSelect,
  onAdd,
  onUpdate,
  onRemove,
  onConvertTextItem,
}) {
  const handleLayerClick = (e) => {
    if (!activeTool || activeTool === 'editText') {
      onSelect(null)
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const cx = e.clientX - rect.left
    const cy = e.clientY - rect.top

    if (activeTool === 'text') {
      onAdd(new OverlayElement({ type: 'text', page: currentPage, x: cx - 100, y: cy - 15, width: 200, height: 36 }))
    }
    if (activeTool === 'rect') {
      onAdd(new OverlayElement({ type: 'rect', page: currentPage, x: cx - 75, y: cy - 25, width: 150, height: 50 }))
    }
  }

  return (
    <div
      className={`overlay-layer${activeTool ? ` tool-${activeTool}` : ''}`}
      onClick={handleLayerClick}
    >
      {/* Existing PDF text items — shown only in editText mode */}
      {pdfTextItems.map((item) => (
        <div
          key={item.id}
          className="pdf-text-item"
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
          }}
          title={`"${item.text}" — click to edit`}
          onClick={(e) => { e.stopPropagation(); onConvertTextItem(item) }}
        />
      ))}

      {/* User-added overlay elements */}
      {pageElements.map((el) => (
        <OverlayItem
          key={el.id}
          element={el}
          isSelected={el.id === selectedId}
          onSelect={() => onSelect(el.id)}
          onUpdate={(changes) => onUpdate(el.id, changes)}
          onRemove={() => onRemove(el.id)}
        />
      ))}
    </div>
  )
}
