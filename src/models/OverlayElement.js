let _nextId = 1

export class OverlayElement {
  constructor(data) {
    this.id = _nextId++
    this.type = data.type   // 'text' | 'textEdit' | 'image' | 'rect'
    this.page = data.page
    this.x = data.x ?? 50
    this.y = data.y ?? 50
    this.width = data.width ?? 200
    this.height = data.height ?? 40

    if (data.type === 'text') {
      this.content = data.content ?? 'New text'
      this.fontSize = data.fontSize ?? 14
      this.color = data.color ?? '#000000'
      this.bold = data.bold ?? false
    }

    // textEdit: created by clicking an existing PDF text item.
    // Renders as a white-box cover + replacement text at the original font size.
    if (data.type === 'textEdit') {
      this.content = data.content ?? ''
      this.pdfFontSize = data.pdfFontSize ?? 10   // in PDF points — used by pdf-lib
      this.canvasFontSize = data.canvasFontSize ?? 15  // in canvas px — used for display
      this.color = data.color ?? '#000000'
      this.bold = data.bold ?? false
    }

    if (data.type === 'image') {
      this.src = data.src
      this.imageBytes = data.imageBytes
      this.imageType = data.imageType // 'png' | 'jpeg'
    }

    if (data.type === 'rect') {
      this.fillColor = data.fillColor ?? '#ffffff'
    }
  }
}
