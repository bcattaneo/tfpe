export class PdfDocument {
  constructor({ arrayBuffer, numPages, fileName }) {
    this.arrayBuffer = arrayBuffer
    this.numPages = numPages
    this.fileName = fileName
  }
}
