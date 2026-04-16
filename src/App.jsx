import { usePdfEditor } from './controllers/usePdfEditor'
import UploadZone from './views/components/UploadZone'
import EditorPage from './views/EditorPage'

export default function App() {
  const editor = usePdfEditor()

  if (!editor.pdfDoc) {
    return <UploadZone onFile={editor.loadFile} />
  }

  return <EditorPage editor={editor} />
}
