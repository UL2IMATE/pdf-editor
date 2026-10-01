# PDF Editor

A minimalist, Notion-inspired full-stack PDF editor featuring in-place typography-matched text editing, digital signatures & stamps, page organization, collapsible thumbnail sidebar, smooth pan navigation, high-contrast sticky notes, and lossless multi-page PDF export.

---

## 📸 Screenshots

### 1. Document Landing & File Ingestion
![PDF Editor Landing Page](screenshots/landing-page.png)

### 2. Editor Workspace & In-Place Text Editing
![PDF Editor Workspace](screenshots/editor-workspace.png)

---

## ✨ Key Features

### ✏️ Sub-Pixel In-Place Text Editing
- **Exact Typography Matching**: Click directly on any text line in the PDF to edit it inline with automatic font family, size, weight, and style matching.
- **Micro-Toolbar Formatting**: Quick controls for **Bold** (`Ctrl+B`), **Italic** (`Ctrl+I`), original text reset, and deletion (whiteout mask).
- **Drag-to-Move**: Freely reposition edited text blocks anywhere on the page with automatic background whiteout mask.
- **Detected Text Outlines**: Toggle visual bounding boxes for all detected PDF text blocks with a single click.

### ✍️ Digital Signatures, Images & Business Stamps
- **Draw Signature**: Interactive signature pad with smooth pen strokes, line width adjustments, and color presets (Ink Black, Navy Blue, Crimson Red).
- **Business Stamp Presets**: Place high-visibility stamps with one click: **APPROVED**, **CONFIDENTIAL**, **DRAFT**, **FINAL**, **PAID**, **URGENT**, and **REJECTED**.
- **Image & Seal Upload**: Place PNG, JPG, or SVG images/company seals onto the canvas with interactive resize handles and rotation.

### 📑 Document Page Organizer
- **Interactive Page Grid**: Dedicated page manager modal displaying all document pages as high-resolution cards.
- **Reorder Pages**: Move pages backward or forward to re-sequence the document.
- **Individual Page Rotation**: Rotate any page 90° clockwise independently.
- **Duplicate & Delete**: Clone important pages or remove unneeded pages with automatic safeguards.

### 🖼️ Collapsible Thumbnail Sidebar (Left Drawer)
- **Live PDF Thumbnails**: Fast, high-DPI thumbnail preview rail rendered via PDF.js.
- **Quick Jump**: Jump to any page instantly with a single click.
- **Hover Quick-Rotate**: Rotate the hovered page directly from its thumbnail without opening the modal.
- **Adaptive Layout**: The floating canvas toolbar smoothly shifts (`left-5` ↔ `left-[228px]`) as the sidebar opens and closes without overlapping.
- **Toggle Shortcut**: Press `[` or click the sidebar icon in the header.

### ✋ Hand / Pan Navigation Tool
- **Smooth Viewport Panning**: Dedicated **Hand tool** (`H`) in the toolbar for navigating documents when zoomed in.
- **Spacebar Quick-Pan**: Hold `Spacebar` and drag anywhere on the canvas for instant, tactile panning.
- **Middle-Mouse Drag**: Click and drag with the mouse wheel at any time to pan without switching tools.
- **Pointer Mode**: Press `V` to immediately switch back to the Select/Pointer tool.
- **Interaction Guard**: Panning mode safely disables object and text selection to prevent accidental edits.

### 📐 Shapes & High-Contrast Sticky Notes
- **Geometric Shapes**: Add Rectangles, Circles, and Directional Arrows with customizable fills, borders, and corner radii.
- **High-Contrast Sticky Notes**:
  - Crisp `#0f172a` ink for maximum readability on white PDF backgrounds.
  - Vivid border colors (Canary Yellow, Mint Green, Sky Blue, Rose Pink, Lavender, Warm Peach).
  - Adjustable outline thickness (1px–4px) and custom outline colors.
  - Realistic 3D soft drop shadow.
- **Live Properties Inspector**: Floating right sidebar to fine-tune shape colors, opacity, stroke widths, and text properties.

### 🖌️ Dual-Layer Vector Canvas & Freehand Painter
- **Brush Presets**: Fine (2px), Medium (4px), Thick (8px), and Marker (16px).
- **Highlighter Mode**: Semi-transparent yellow highlighting for emphasizing passages.
- **Vector Stroke Eraser**: Click or drag over vector strokes to erase them cleanly without affecting PDF content.
- **Clear Page**: One-click action to remove all drawn strokes on the active page.

### ⌨️ Built-in Keyboard Shortcuts Modal (`?`)
- **Notion-Styled Cheat Sheet**: Press `?` (or `Shift + /`) anywhere to open the shortcuts dialog.
- Grouped into Navigation & View, Editing & Formatting, and Objects & Shapes with `<kbd>` key badges.

### 💾 Lossless Vector Export Engine
- **Client-Side PDF Generation**: Powered by `pdf-lib`, applying annotations, custom text, signatures, stamps, whiteouts, and vector SVG drawings.
- **Multi-Page Geometry Mapping**: Accurately accounts for custom page ordering and per-page rotations during export.
- **Zero Resolution Loss**: Preserves full vector sharpness and original document quality.

### 🔒 100% Private & Local-First
- All editing, signing, and exporting executes directly in the user's browser. Zero data tracking, zero third-party transmission.

---

## 📁 Repository Structure

```text
pdf-editor/
├── frontend/                  # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/        # Canvas, toolbars, properties inspector, modals
│   │   │   ├── canvas.tsx           # Fabric.js + PDF.js dual-layer viewport & tools
│   │   │   ├── controls.tsx         # Header navigation, zoom, export, and toggles
│   │   │   ├── setting.tsx          # Floating properties inspector for shapes & text
│   │   │   ├── ThumbnailSidebar.tsx # Collapsible page thumbnail drawer
│   │   │   ├── PageThumbnail.tsx    # Reusable high-DPI PDF page preview
│   │   │   ├── PageManagerModal.tsx # Multi-page organizer (reorder, rotate, delete)
│   │   │   ├── SignatureModal.tsx   # Digital signature pad, stamps & image upload
│   │   │   ├── ShortcutsModal.tsx   # Keyboard shortcuts cheat-sheet modal
│   │   │   └── mainPage.tsx         # Landing page and document dropzone
│   │   ├── services/          # Backend API client (extract-blocks & edits)
│   │   ├── types/             # TypeScript type definitions (ManagedPage, TextBlock)
│   │   ├── utils/             # Lossless vector PDF export (pdf-lib & SVG stamping)
│   │   └── index.css          # Notion design system tokens
│   ├── public/                # Static assets & PDF.js web worker
│   └── package.json           # Frontend dependencies & scripts
├── backend/                   # Node.js + Express + TypeScript service
│   ├── src/
│   │   ├── controllers/       # PDF controllers (extract-blocks & server-side edit)
│   │   ├── services/          # PDF text & document manipulation services
│   │   ├── middleware/        # Upload limits & payload validation
│   │   ├── routes/            # RESTful API endpoints
│   │   └── server.ts          # Server entry point (Port 5000)
│   └── package.json           # Backend dependencies & scripts
├── screenshots/           # Repository preview images
├── package.json               # Root workspace orchestrator
├── .gitignore                 # Unified ignore rules
└── README.md                  # Project documentation
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Fabric.js v7, PDF.js (`pdfjs-dist`), `pdf-lib`, Lucide React |
| **Backend** | Node.js, Express 5, TypeScript, `tsx`, Multer, `pdf-lib`, `pdfjs-dist`, Zod |
| **Design System** | Notion Tokens (`#F7F6F3` Canvas, `#37352F` Ink, `#2383E2` Accent) |

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Category | Action |
| :--- | :--- | :--- |
| `Space` + **Drag** | Navigation | Pan smoothly around the canvas |
| `H` | Navigation | Toggle Hand / Pan Tool |
| `V` | Navigation | Select / Pointer Tool |
| `[` | Navigation | Toggle Page Thumbnails sidebar |
| `←` / `→` | Navigation | Navigate to Previous / Next page |
| `R` | Navigation | Rotate current page 90° clockwise |
| `Ctrl` + `+` / `-` | Navigation | Zoom In / Zoom Out |
| `Click 100%` | Navigation | Reset zoom to default |
| `Click Text` | Editing | Edit original PDF text in-place |
| `Ctrl` + `B` | Editing | Toggle **Bold** on selected text |
| `Ctrl` + `I` | Editing | Toggle *Italic* on selected text |
| `Enter` / `Esc` | Editing | Commit / exit inline text editing |
| `Delete` / `Backspace` | Objects | Delete selected shape, sticky note, or text |
| `?` or `Shift + /` | Help | Open Keyboard Shortcuts Guide |

---

## 🔌 Backend API Endpoints

The backend runs on `http://localhost:5000` and provides optional server-side processing:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/pdf/upload` | Validates and accepts PDF uploads (up to 20MB). |
| `POST` | `/pdf/extract-blocks` | Parses PDF documents and extracts positional text blocks with typography metadata. |
| `POST` | `/pdf/edit` | Applies server-side text edits, whiteouts, and stamps onto the target PDF. |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+ recommended
- **npm**: v10+

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/UL2IMATE/pdf-editor.git
cd pdf-editor

# Install dependencies across all workspaces
npm run install:all
```

### 3. Running in Development

Run both frontend and backend concurrently with one command:

```bash
npm run dev
```

Or run them individually in separate terminals:

```bash
# Terminal 1 - Frontend (http://localhost:5173)
npm run frontend:dev

# Terminal 2 - Backend (http://localhost:5000)
npm run backend:dev
```

### 4. Production Build

```bash
npm run build
```

---

## 📄 License

MIT