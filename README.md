# tfpe

Truly free PDF editor.

*Because, insanely, there is really no way to edit a simple PDF online without someone trying to charge you or asking for your credit card right before you can export it.*

---

## Getting started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Other commands

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview the production build locally |

---

## How to use

### 1. Open a PDF
Drag and drop a PDF onto the upload screen, or click to browse for a file.

### 2. Edit existing text
Click the **pencil icon** in the toolbar to enter Edit Text mode. All text in the document will become highlighted as you hover over it. Click any text to select it — it opens directly in an inline editor. Type your changes and click away to confirm. The replacement text is saved as a white-covered overlay at the original font size.

### 3. Add new text
Click the **T+** button, then click anywhere on the page to place a text box. Double-click the box to type. While the text box is selected you can adjust:
- **Font size** — number input in the toolbar
- **Bold** — B button
- **Color** — color picker

### 4. Add an image
Click the **image icon** and pick a PNG or JPEG from your computer. The image is placed on the page and can be dragged to reposition or resized by dragging the corner handle.

### 5. Cover / erase content
Click the **square icon** to place a white cover rectangle over any area. Useful for hiding existing content before placing new text on top. The fill color can be changed in the toolbar when the rectangle is selected.

### 6. Move and resize elements
Any element (text, image, or cover box) can be:
- **Dragged** to reposition
- **Resized** by dragging the blue handle at the bottom-right corner
- **Deleted** by selecting it and pressing `Delete`, or clicking the red × button

### 7. Keyboard shortcuts

| Key | Action |
|---|---|
| `Delete` / `Backspace` | Delete selected element |
| `Escape` | Deselect / cancel active tool |

### 8. Download
Click **Download PDF** to export. The file is built entirely in your browser using [pdf-lib](https://pdf-lib.js.org/) and downloaded directly — nothing is uploaded to any server.

---

## Tech stack

| Library | Role |
|---|---|
| [React](https://react.dev/) + [Vite](https://vitejs.dev/) | UI framework and dev tooling |
| [pdf-lib](https://pdf-lib.js.org/) | PDF manipulation and export |
| [pdfjs-dist](https://mozilla.github.io/pdf.js/) | PDF rendering (page preview + text extraction) |

The project follows an MVC structure:

```
src/
├── models/          # Pure data classes (PdfDocument, OverlayElement)
├── controllers/     # Business logic (usePdfEditor hook, pdfService, renderService)
└── views/           # React components (EditorPage, Toolbar, OverlayLayer, …)
```
