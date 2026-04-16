import Toolbar from './components/Toolbar'
import PdfCanvas from './components/PdfCanvas'
import OverlayLayer from './components/OverlayLayer'
import PageNav from './components/PageNav'

export default function EditorPage({ editor }) {
  const {
    pdfDoc, pdfPreview, currentPage, setCurrentPage,
    pageElements, pdfTextItems, selectedId, setSelectedId,
    activeTool, addElement, updateElement, removeElement,
    recordCanvasSize, convertTextItem,
  } = editor

  return (
    <div className="editor-layout">
      <Toolbar editor={editor} />

      <div className="editor-body">
        <div className="canvas-wrapper">
          <PdfCanvas
            pdfPreview={pdfPreview}
            currentPage={currentPage}
            onSizeChange={recordCanvasSize}
          />
          <OverlayLayer
            pageElements={pageElements}
            pdfTextItems={pdfTextItems}
            selectedId={selectedId}
            activeTool={activeTool}
            currentPage={currentPage}
            onSelect={setSelectedId}
            onAdd={addElement}
            onUpdate={updateElement}
            onRemove={removeElement}
            onConvertTextItem={convertTextItem}
          />
        </div>

        {pdfDoc.numPages > 1 && (
          <PageNav
            currentPage={currentPage}
            numPages={pdfDoc.numPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}
