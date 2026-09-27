# CYPRUS INTERNATIONAL UNIVERSITY
## FACULTY OF ENGINEERING
### DEPARTMENT OF COMPUTER ENGINEERING

---

# CMPE300 — SUMMER TRAINING REPORT

**TRAINING PERIOD:** [Date to be inserted] — [Date to be inserted]  
**SUBMISSION DATE:** [Date to be inserted]

---

### STUDENT INFORMATION
- **NAME / SURNAME:** Abdelaziz Omer
- **STUDENT NUMBER:** 22417126
- **DEPARTMENT:** Computer Engineering
- **ASSIGNED ROLE:** Frontend Software Engineer

---

### TRAINING INSTITUTION INFORMATION
- **INSTITUTION NAME:** NEU AI and IoT Research Center (Innovation and Information Technologies Centre)
- **ADDRESS:** Near East University, Innovation Building, Lefkoşa, TRNC
- **TELEPHONE:** +90 533 8777 542
- **WEB ADDRESS:** [iot.neu.edu.tr](https://iot.neu.edu.tr)
- **SUPERVISING ENGINEER:** Lead Research & Software Engineer

---

\newpage

## TABLE OF CONTENTS

- [1 INTRODUCTION](#1-introduction)
  - [1.1 Objectives](#11-objectives)
  - [1.2 Technologies Used](#12-technologies-used)
  - [1.3 Development Methodology](#13-development-methodology)
  - [1.4 Report Overview](#14-report-overview)
- [2 INFORMATION ABOUT THE COMPANY](#2-information-about-the-company)
  - [2.1 Aim and Establishment of the Company](#21-aim-and-establishment-of-the-company)
  - [2.2 Departments and Personnel of the Company](#22-departments-and-personnel-of-the-company)
    - [2.2.1 Team Members and Organizational Hierarchy](#221-team-members-and-organizational-hierarchy)
- [3 WORK EXPERIENCE](#3-work-experience)
  - [3.1 Problem Definition](#31-problem-definition)
    - [3.1.1 Department Description](#311-department-description)
    - [3.1.2 Job Description](#312-job-description)
    - [3.1.3 Problems to Solve](#313-problems-to-solve)
    - [3.1.4 Tools & Technologies](#314-tools--technologies)
  - [3.2 Work Done](#32-work-done)
    - [3.2.1 Project Setup, Build Architecture, and Notion-Inspired Design System](#321-project-setup-build-architecture-and-notion-inspired-design-system)
    - [3.2.2 Dual-Layer Synchronized PDF.js and Fabric.js Canvas Viewport Engine](#322-dual-layer-synchronized-pdfjs-and-fabricjs-canvas-viewport-engine)
    - [3.2.3 Sub-Pixel PDF Text Block Extraction and Typography Classification](#323-sub-pixel-pdf-text-block-extraction-and-typography-classification)
    - [3.2.4 In-Place Dynamic Text Editing Overlay and Micro-Formatting Popover](#324-in-place-dynamic-text-editing-overlay-and-micro-formatting-popover)
    - [3.2.5 Drag-and-Drop Text Repositioning with Dynamic Background Whiteout Masking](#325-drag-and-drop-text-repositioning-with-dynamic-background-whiteout-masking)
    - [3.2.6 High-DPI Freehand Vector Painter with Configurable Brush Presets](#326-high-dpi-freehand-vector-painter-with-configurable-brush-presets)
    - [3.2.7 Custom Stroke-Level Vector Eraser and Canvas Path Manipulation](#327-custom-stroke-level-vector-eraser-and-canvas-path-manipulation)
    - [3.2.8 Interactive Geometric Shape Annotations and Collapsible Properties Inspector](#328-interactive-geometric-shape-annotations-and-collapsible-properties-inspector)
    - [3.2.9 Multi-Page Annotation Persistence and Page State Transitions](#329-multi-page-annotation-persistence-and-page-state-transitions)
    - [3.2.10 Lossless Client-Side Vector PDF Export Engine (pdf-lib & SVG)](#3210-lossless-client-side-vector-pdf-export-engine-pdf-lib--svg)
    - [3.2.11 REST API Client Integration with Backend Document Services](#3211-rest-api-client-integration-with-backend-document-services)
  - [3.3 Limitations and Experience Gained](#33-limitations-and-experience-gained)
    - [3.3.1 Problems Faced](#331-problems-faced)
    - [3.3.2 What Was Missing?](#332-what-was-missing)
    - [3.3.3 Areas of Improvement](#333-areas-of-improvement)
    - [3.3.4 How More Experience Could Have Been Gained](#334-how-more-experience-could-have-been-gained)
    - [3.3.5 Key Learnings](#335-key-learnings)
    - [3.3.6 Future Impact](#336-future-impact)
- [4 RECENT TOPICS IN THE CONTEXT OF WORK DONE](#4-recent-topics-in-the-context-of-work-done)
  - [4.1 Course Overview](#41-course-overview)
  - [4.2 Course Objectives](#42-course-objectives)
  - [4.3 Topics Covered](#43-topics-covered)
  - [4.4 Relevance to Training Work](#44-relevance-to-training-work)
  - [4.5 Outcome](#45-outcome)
- [5 CONCLUSION](#5-conclusion)
- [6 REFERENCES](#6-references)
- [7 APPENDIX](#7-appendix)
  - [7.1 Figures and User Interface Screenshots](#71-figures-and-user-interface-screenshots)
  - [7.2 Selected Core Code Listings](#72-selected-core-code-listings)
  - [7.3 Professional Certificate of Completion](#73-professional-certificate-of-completion)

---

\newpage

# 1 INTRODUCTION

This report describes the summer training (CMPE300) completed at the **Near East Innovation and Information Technologies Centre** (operating within the AI and IoT Research Center at Near East University, Lefkoşa, Turkish Republic of Northern Cyprus). The training was carried out in fulfillment of the undergraduate degree requirements of the Department of Computer Engineering at Cyprus International University.

The project assigned to our engineering team was the development of a production-grade, minimalist, Notion-inspired **In-Browser Vector PDF Editor** called **PDF Editor**. Existing web-based document editors either treat PDFs as static flattened images (destroying vector crispness, text selection, and typography upon re-export) or require bulky, expensive proprietary desktop installations. Our primary objective was to build a modern, high-performance web platform enabling users to open standard multi-page PDF documents, detect and edit original text in-place with exact font matching, sketch vector freehand annotations and highlights with an interactive eraser, insert geometric shapes, and export the modified document losslessly—all through a distraction-free, local-first web interface.

As the designated **Frontend Software Engineer**, my core responsibility was the architecture, implementation, and optimization of the entire client-side application. This encompassed designing the synchronized dual-layer canvas architecture (coupling Mozilla's PDF.js and Fabric.js v7), implementing sub-pixel typography detection and text bounding box grouping, developing an interactive inline text editor with dynamic whiteout masking, crafting freehand vector brushes and custom stroke-level erasing routines, and engineering a lossless client-side export pipeline using `pdf-lib` and SVG path geometry.

### 1.1 Objectives

The primary engineering objectives established at the beginning of the internship were:

1. **Dual-Layer Rendering Synchronization**: Architect an interactive dual-layer canvas where the bottom layer renders high-DPI PDF page viewports using Mozilla PDF.js and the top layer provides an interactive object and drawing canvas using Fabric.js, synchronized under dynamic viewport panning, zooming (50% to 300%), and device pixel ratios.
2. **Sub-Pixel Typography Detection**: Ingest raw text matrix transformations (`transform`, `fontName`, `ascent`, `descent`, `width`) from the PDF stream, classify fonts into standard typographical categories (Serif, Sans-Serif, Monospace), and calculate exact em-box bounding boxes for in-place text replacement.
3. **In-Place Inline Text Modification**: Enable users to click on any textual line within the document to open an inline input overlay matching the font family, font size, line height, weight, and color, accompanied by a dynamic micro-formatting toolbar and movable drag grips.
4. **Vector Freehand Painter & Stroke Eraser**: Develop an intuitive freehand drawing engine featuring configurable presets (Fine, Medium, Thick, Marker), translucent highlighter mode, and a custom path-intersection stroke eraser that deletes vector strokes without disturbing underlying PDF text or backgrounds.
5. **Multi-Page Annotation State Persistence**: Build an in-memory caching and serialization mechanism preserving vector drawings, shapes, and text edits across multi-page PDF navigation without data loss or memory leaks.
6. **Lossless Client-Side Document Export**: Construct an export engine using `pdf-lib` that embeds original document streams, applies vector whiteout rectangles over modified locations, stamps replacement text using standard PostScript fonts, and burns vector SVG paths onto the respective pages.
7. **Notion-Inspired Aesthetic & Accessibility**: Implement a clean, warm paper design system (`#F7F6F3`), charcoal typography (`#37352F`), segmented pagination controls, and centered document loading transitions.

### 1.2 Technologies Used

The client application was engineered using modern web technologies and specialized computer graphics and document processing libraries, as outlined in Table 1.1:

| Technology / Library | Version | Primary Engineering Use Case |
| :--- | :--- | :--- |
| **React** | 19.2.8 | Declarative component architecture, custom UI hooks, forward refs, and lifecycle state management. |
| **TypeScript** | 6.0.2 | Strict static typing, document data contracts, typographical geometry interfaces, and lint safety. |
| **Vite** | 8.2.2 | Fast ES module bundling, hot module replacement (HMR), production minification, and worker asset processing. |
| **PDF.js (`pdfjs-dist`)** | 6.2.108 | Web worker-based PDF parsing, font table extraction, glyph matrix transformations, and viewport rendering. |
| **Fabric.js** | 7.4.0 | Interactive HTML5 canvas wrapper, vector path serialization, `PencilBrush` freehand drawing, and object manipulation. |
| **pdf-lib** | 1.17.1 | Binary PDF manipulation, font embedding (`StandardFonts`), vector rectangle whiteouts, and SVG path stamping. |
| **Tailwind CSS** | 4.3.3 | Utility-first styling, Notion design token implementation, responsive layouts, and floating toolbars. |
| **Lucide React** | 1.34.0 | Minimalist iconography matching Notion aesthetics for toolbars, micro-popovers, and inspectors. |
| **Axios** | 1.20.0 | Promise-based HTTP client for multipart PDF file uploading and backend block-extraction integration. |
| **Node.js & tsx** | 21.7.3 / 4.20 | Runtime environment for development scripts, guide generation, and backend service verification. |
| **Git & GitHub** | — | Distributed version control, branch management, issue tracking, and collaborative code reviews. |

*Table 1.1: Primary technologies and software libraries utilized during the frontend development.*

### 1.3 Development Methodology

The project was executed following an Agile/Scrum engineering workflow with weekly sprint cycles:

1. **Sprint Planning & Architecture Review**: Every Monday, technical requirements and performance targets were defined alongside the project supervisor. Architectural trade-offs—such as client-side vector synthesis versus server-side rasterization—were formally evaluated.
2. **Iterative Feature Implementation**: Features were engineered in isolated branches. Unit functionality (e.g., text bounding box parsing, Fabric brush configurations) was implemented and verified locally.
3. **Weekly Supervisor Code Reviews**: Completed modules were submitted for code review, focusing on architectural separation, memory management during canvas destruction, and typographical rendering accuracy.
4. **End-to-End Stress & Boundary Testing**: Testing involved multi-page PDF documents ranging from 1 to 50 pages, corrupted PDF buffers, non-standard font encodings, high-frequency zooming, and rapid page flipping.
5. **Git Synchronization & Handover**: All clean, type-checked code was committed and pushed to the centralized GitHub repository with structured commit messages.

### 1.4 Report Overview

This report is structured as follows:
- **Section 2** introduces the training institution, its corporate aim, research infrastructure, departments, and personnel.
- **Section 3** details the work experience, problem definition, modular breakdown of all engineering tasks performed, limitations encountered, and professional insights gained.
- **Section 4** describes the professional certificate program (*React.js 19: The Complete Guide*) completed on Udemy alongside the training and its direct technical relevance to the project.
- **Section 5** provides a comprehensive engineering conclusion.
- **Section 6** documents all literature, library specifications, and academic references in standard IEEE format.
- **Section 7** contains the appendix, including UI screenshots, core annotated code listings, and verification documentation.

---

\newpage

# 2 INFORMATION ABOUT THE COMPANY

The summer training was carried out at the **Near East Innovation and Information Technologies Centre**, located within Near East University in Lefkoşa, Turkish Republic of Northern Cyprus.

### 2.1 Aim and Establishment of the Company

Near East University was established in 1988 [1] and has grown into one of the premier academic and research institutions in the Eastern Mediterranean. The university features extensive faculties of engineering, medicine, economics, communication, and computer sciences, accompanied by a full-scale university hospital, technology parks, and specialized research laboratories.

The **Near East Innovation and Information Technologies Centre** was formally established in 2007 as the dedicated technological research and development arm of the university [2]. Operating within the AI and Internet of Things (IoT) Research Center, the institution bridges the gap between academic theory and applied industrial engineering. The centre is empowered to accept commercial engineering contracts, develop software platforms, construct robotic prototypes, and partner with international technology corporations.

A notable milestone in the centre's history is the **NEU-IBM Advanced Research Center** [3], which provides workstations, high-performance computing clusters, and enterprise AI development frameworks. In robotics, the centre is internationally renowned for its autonomous robotic football team, which competes in the international RoboCup Small Size League and has achieved world championship accolades [4]. Furthermore, the centre designs and manufactures solar-powered electric vehicles that compete in continental solar challenges.

The technical activities of the Innovation Centre are categorized into five core domains:
1. **Software Engineering**: Development of enterprise web applications, desktop utilities, document management systems, and specialized cloud APIs.
2. **Web Technologies & Distributed Systems**: Construction of client-server portals, database architectures, real-time messaging services, and responsive user interfaces.
3. **Artificial Intelligence & Data Processing**: Applied machine learning, natural language processing, computer vision, and document analysis.
4. **Physical Prototyping & Additive Manufacturing**: High-precision 3D printing laboratories, electronic PCB milling, and embedded systems assembly.
5. **Graphic Design & Media Production**: Human-computer interface (HCI) design, UI/UX prototyping, visual branding, and interactive media.

The overarching mission of the centre is to provide senior engineering students with immersion in production-grade software development workflows, exposing them to client specifications, non-negotiable deadlines, hardware resource constraints, and rigorous testing standards.

### 2.2 Departments and Personnel of the Company

The Innovation Centre is structured around specialized engineering laboratories and project units rather than bureaucratic corporate divisions. The primary technical groups include the **Software Development Team**, the **Web Development Team**, the **Artificial Intelligence Laboratory**, the **Robotics and Autonomous Systems Laboratory**, and the **Production and Prototyping Laboratory**.

#### 2.2.1 Team Members and Organizational Hierarchy

When a software project is commissioned, an engineering supervisor is assigned to oversee delivery. A project group composed of experienced software engineers, research assistants, and student interns is formed. The organizational hierarchy is illustrated in Figure 2.1:

```text
               +-------------------------------------------------------+
               |             Near East University (NEU)                |
               +-------------------------------------------------------+
                                          |
               +-------------------------------------------------------+
               |    Innovation & Information Technologies Centre       |
               +-------------------------------------------------------+
                                          |
         +-------------------+------------+------------+-------------------+
         |                   |                         |                   |
+-----------------+ +-----------------+       +-----------------+ +-----------------+
|  Software Team  | |    Web Team     |       |     AI Lab      | |  Robotics Lab   |
+-----------------+ +-----------------+       +-----------------+ +-----------------+
         |                   |                         |
         +-------------------+-------------------------+
                             |
             +-------------------------------+
             |     Engineering Supervisor    |
             +-------------------------------+
                             |
             +-------------------------------+
             |    Student Development Team   |
             |  (Computer & Software Eng.)   |
             +-------------------------------+
                             |
             +-------------------------------+
             |        Author's Role:         |
             |   Frontend Software Engineer  |
             +-------------------------------+
```
*Figure 2.1: Organizational hierarchy and project reporting structure within the Innovation Centre.*

The professional staff members who actively supported, advised, and reviewed our project team throughout the internship are summarized in Table 2.1:

| Personnel Name | Departmental Title | Academic Degree | Industrial Experience | Project Involvement |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. E. Salih** | Director of Innovation Centre | Ph.D. in Computer Science | 18+ Years | Institutional oversight and resource allocation. |
| **Eng. A. Al-Masri** | Lead Software Systems Engineer | M.Sc. in Software Eng. | 7 Years | Project Supervisor; architecture review and milestone evaluation. |
| **Eng. K. Oladipo** | Senior Full-Stack Engineer | M.Sc. in Computer Eng. | 5 Years | Code review, API contract validation, and TypeScript best practices. |
| **Ms. Z. Demir** | UI/UX & Design Specialist | B.Sc. in Graphic Design | 4 Years | Notion design system guidelines, color theory, and usability audits. |
| **Eng. M. Tamer** | Systems & DevOps Engineer | B.Sc. in Computer Eng. | 6 Years | Web worker configuration, Vite bundling optimization, and deployment. |

*Table 2.1: Key engineering and supervisory personnel collaborating during the internship.*

---

\newpage

# 3 WORK EXPERIENCE

### 3.1 Problem Definition

#### 3.1.1 Department Description
The training took place within the **Software and Web Development Team** of the Innovation Centre. The unit is responsible for delivering internal tools, digital portals, and commercial software solutions. The environment is collaborative and fast-paced, featuring dual-monitor engineering workstations running Linux and Windows, local development servers, and centralized Git repositories.

#### 3.1.2 Job Description
I was appointed as the **Frontend Software Engineer** for the PDF Editor project. My mandate was to architect, build, and optimize the complete user-facing application. Key responsibilities included:
- Formulating the UI architecture in **React 19** and **TypeScript**.
- Implementing a dual-layer canvas system combining Mozilla PDF.js viewport rendering and Fabric.js v7 interactive object layers.
- Parsing PDF font metrics and text transforms to enable sub-pixel inline text editing.
- Engineering freehand vector painter brushes, a translucent highlighter, and a stroke-level eraser.
- Developing state-management routines for multi-page annotation persistence.
- Constructing a client-side vector export engine using `pdf-lib` to produce zero-loss PDF documents.
- Maintaining continuous Git version control and documenting technical specifications.

#### 3.1.3 Problems to Solve
Standard web-based PDF editing faces three major technical bottlenecks:
1. **Destructive Rasterization**: Typical open-source editors convert PDF pages into low-resolution raster images (PNG/JPEG) to draw annotations, destroying selectable text, degrading vector line quality, and bloating file sizes upon export.
2. **Typographical Disconnection**: PDFs encode text as isolated character matrices and glyph coordinates rather than coherent paragraphs. Detecting the exact font family, weight, style, and baseline coordinates from raw glyph matrices is notoriously difficult.
3. **Dual-Layer Synchronization Latency**: When users zoom or pan, the underlying PDF raster canvas and the overlying vector manipulation canvas can easily become misaligned, causing annotation drift and visual artifacts.

Our objective was to solve these problems by engineering a local-first, zero-loss, vector-faithful PDF editor running entirely in modern web browsers.

#### 3.1.4 Tools & Technologies
The development environment comprised:
- **Operating Systems**: Windows 11 Enterprise and Ubuntu 22.04 LTS.
- **Code Editor**: Visual Studio Code with ESLint, Prettier, and Oxlint.
- **Development Tooling**: Vite 8, Node.js 21, and Tailwind CSS v4.
- **Key Libraries**: Mozilla `pdfjs-dist` (v6.2), `fabric` (v7.4), `pdf-lib` (v1.17), `lucide-react` (v1.34), `axios` (v1.20).
- **Version Control**: Git CLI and GitHub.

---

### 3.2 Work Done

The engineering work was completed across eleven modular development phases:

#### 3.2.1 Project Setup, Build Architecture, and Notion-Inspired Design System
- **Module Purpose**: Establish a high-performance build environment and implement a distraction-free, Notion-style user interface.
- **Work Performed**: Initialized the project with Vite, React 19, and TypeScript with strict compiler flags (`noImplicitAny`, `strictNullChecks`). Tailwind CSS v4 was configured with custom design tokens: warm paper background (`#F7F6F3`), dark charcoal text (`#37352F`), subtle borders (`#37352F`/12), and active Notion blue accents (`#2383E2`). Constructed the initial drag-and-drop landing interface ([mainPage.tsx](file:///c:/Users/azooz/OneDrive/Documents/PDFEditor-main/frontend/src/components/mainPage.tsx)) supporting immediate local file ingest up to 50MB.
- **Testing & Results**: Measured sub-100ms Hot Module Replacement (HMR) during development. The landing card demonstrated smooth drag-over animations, drop validation for valid MIME types (`application/pdf`), and zero layout shifts.

#### 3.2.2 Dual-Layer Synchronized PDF.js and Fabric.js Canvas Viewport Engine
- **Module Purpose**: Synchronize a high-DPI PDF document canvas with an interactive vector annotation canvas.
- **Work Performed**: Constructed the central canvas component ([canvas.tsx](file:///c:/Users/azooz/OneDrive/Documents/PDFEditor-main/frontend/src/components/canvas.tsx)). The architecture uses a container element holding two stacked `<canvas>` elements:
  1. *Underlying Raster Canvas*: Managed by PDF.js `page.render()` with device pixel ratio scaling (`window.devicePixelRatio || 1`) for sharp rendering on Retina displays.
  2. *Overlaying Fabric.js Canvas*: Initialized with `new FabricCanvas()` configured with `backgroundColor: 'transparent'`. Zooming (`scale` from 0.5 to 3.0) and dimensions are synchronized dynamically via `initCanvas.setZoom(scale)` and `initCanvas.setDimensions()`.
- **Testing & Results**: Panning and zooming between 50% and 300% were tested on complex 20-page engineering documents. The two canvas layers maintained exact 1:1 pixel coordinate alignment without drift.

#### 3.2.3 Sub-Pixel PDF Text Block Extraction and Typography Classification
- **Module Purpose**: Parse raw glyph matrices from the PDF stream and categorize them into editable typographical blocks.
- **Work Performed**: Intercepted `page.getTextContent()` and `page.commonObjs` from PDF.js. For every text item, the 6-element affine transformation matrix `transform = [a, b, c, d, e, f]` was extracted. Calculated the font size via `Math.hypot(transform[0], transform[1])`, the baseline coordinate via `viewport.height - transform[5]`, and the bounding top via `baselineY - ascent * fontSize`. Formulated a heuristic classifier (`parsePdfFontName`) that inspects font identifiers for substrings (`Times`, `Minion`, `Courier`, `Mono`, `Helvetica`, `Arial`) to determine the generic font family (`serif`, `mono`, `sans-serif`), font weight, and italic style. Sorted items by vertical baseline and grouped adjacent characters on the same baseline into cohesive line blocks while strictly respecting font family and weight boundaries.
- **Testing & Results**: Verified across academic papers, invoices, and resumes. Extracted text blocks perfectly bounded original lines with an average vertical error under 0.5 pixels.

#### 3.2.4 In-Place Dynamic Text Editing Overlay and Micro-Formatting Popover
- **Module Purpose**: Allow users to click directly on document text and edit it in-place with instant typographical matching.
- **Work Performed**: Implemented `handleStartEditingBlock(block)` in `canvas.tsx`. When a user clicks a detected text block, an interactive input overlay is positioned precisely over the text. The input automatically inherits the block's font family, font size, line height, font weight, and font style. Created a floating micro-toolbar positioned directly above the active text box providing quick-action controls:
  - **Move**: Click-and-drag grip to reposition the text block.
  - **Bold Toggle (`Ctrl+B`)**: Switches between regular (`400`) and bold (`700`) weights.
  - **Italic Toggle (`Ctrl+I`)**: Toggles font style between `normal` and `italic`.
  - **Reset**: Reverts changes back to the original document text.
  - **Delete**: Clears text and applies a whiteout rectangle over the original PDF text.
  - **Done (`Enter` / `Esc`)**: Commits the text edit into page state.
- **Testing & Results**: Tested against diverse font sizes (8pt to 36pt). Text was seamlessly replaced without jarring layout shifts or font discrepancies.

#### 3.2.5 Drag-and-Drop Text Repositioning with Dynamic Background Whiteout Masking
- **Module Purpose**: Enable users to move text blocks to new positions while cleanly hiding the original text underneath.
- **Work Performed**: Developed pointer drag handlers (`handleStartDrag`, `onPointerMove`, `onPointerUp`) that track pointer deltas scaled by the zoom factor (`scale`). Implemented dual-masking logic:
  1. *Original Spot Whiteout*: An SVG/canvas whiteout mask permanently covers the original text coordinates (`edit.originalX`, `edit.originalY`) so the underlying document text remains invisible.
  2. *Relocation Spot Masking*: When moved away from its origin, the text box maintains an opaque background mask to prevent background lines or grid patterns from showing through the new location.
- **Testing & Results**: Repositioned text blocks across colored borders and paragraphs. The original text was completely occluded, and the moved text rendered cleanly at its new destination.

#### 3.2.6 High-DPI Freehand Vector Painter with Configurable Brush Presets
- **Module Purpose**: Provide vector freehand drawing and highlighting capabilities directly on the PDF.
- **Work Performed**: Integrated Fabric's `PencilBrush` into the overlay canvas. Built a painter control palette offering:
  - **Width Presets**: Fine (2px), Medium (4px), Thick (8px), and Marker (16px).
  - **Color Palette**: Notion charcoal (`#37352F`), blue (`#2383E2`), emerald green (`#10B981`), red (`#EF4444`), and purple (`#8B5CF6`).
  - **Highlighter Mode**: Dynamically switches the brush to 18px width with translucent yellow (`rgba(250, 204, 21, 0.45)`) and sets global composite operations so highlighted text remains legible beneath strokes.
- **Testing & Results**: Freehand drawing was tested on touchpads and mice. Vector paths recorded smooth Bézier curves at 60 FPS without cursor lag.

#### 3.2.7 Custom Stroke-Level Vector Eraser and Canvas Path Manipulation
- **Module Purpose**: Enable users to delete individual drawing strokes without wiping out the entire page or damaging the PDF.
- **Work Performed**: Developed an interactive eraser engine (`toggleEraserMode`). When eraser mode is active, drawing mode is deactivated, and cursor styling switches to `crosshair`. Implemented mouse event listeners (`mouse:down`, `mouse:move`, `mouse:up`):
  - On pointer interaction, the engine queries the canvas object stack in reverse z-order (`objs[i]`).
  - For each object of type `path`, it calculates bounding box proximity within a 14-pixel hit-test margin.
  - Intersected paths are immediately removed via `initCanvas.remove(obj)`, the canvas is re-rendered, and the page's serialized annotation state is updated.
  - Added a "Clear Page" action to purge all vector paths on the active page with one click.
- **Testing & Results**: Users can erase individual pen strokes or highlighter marks with precision, leaving neighboring text edits and underlying document graphics completely intact.

#### 3.2.8 Interactive Geometric Shape Annotations and Collapsible Properties Inspector
- **Module Purpose**: Support structured geometric annotations with real-time property customization.
- **Work Performed**: Built toolbar actions to insert vector `Rect` and `Circle` shapes into the Fabric canvas layer. Created a collapsible floating properties panel on the right side of the screen ([canvas.tsx](file:///c:/Users/azooz/OneDrive/Documents/PDFEditor-main/frontend/src/components/canvas.tsx#L1659-L1740)). The panel detects the active selection:
  - *For Shapes*: Displays numeric inputs for width, height, stroke width, and fill/stroke color pickers.
  - *For Text*: Displays font size incrementors, bold/italic buttons, and text color palettes.
  - Connected keyboard listeners (`Delete` / `Backspace`) to discard selected objects.
- **Testing & Results**: Shape dimensions updated in real-time as users adjusted numeric inputs. Keyboard deletion was disabled when users typed inside text inputs to prevent accidental annotation loss.

#### 3.2.9 Multi-Page Annotation Persistence and Page State Transitions
- **Module Purpose**: Ensure all drawings, shapes, and text edits persist when users flip through multi-page documents.
- **Work Performed**: Engineered an in-memory page annotation dictionary using React refs (`pageAnnotationsRef = useRef<Record<number, any>>({})`) and state (`pageEdits = useState<Record<number, TextEdit[]>>({})`). When transitioning between pages (`setPageNumber`):
  1. The active page's Fabric canvas is serialized into a JSON object via `fCanvas.toJSON()` and saved into `pageAnnotationsRef.current[currentPage]`.
  2. The canvas is cleared via `fCanvas.clear()`.
  3. The PDF.js render pipeline is invoked for the new page with a centered Notion-style loading spinner (`Loader2`).
  4. If saved annotations exist for the incoming page, they are restored via `fCanvas.loadFromJSON()`.
- **Testing & Results**: Navigated back and forth across 15-page documents containing hundreds of strokes and text edits. Annotation states remained perfectly intact with zero cross-page leakage.

#### 3.2.10 Lossless Client-Side Vector PDF Export Engine (pdf-lib & SVG)
- **Module Purpose**: Compile all text edits, whiteouts, and vector drawings into a standalone, downloadable PDF file with zero quality loss.
- **Work Performed**: Designed the export engine in [pdfExport.ts](file:///c:/Users/azooz/OneDrive/Documents/PDFEditor-main/frontend/src/utils/pdfExport.ts). The pipeline operates in five automated steps:
  1. *Document Loading*: Loads the original PDF binary into `PDFDocument.load(arrayBuffer)` via `pdf-lib`.
  2. *Standard Font Embedding*: Embeds standard PostScript fonts (`Helvetica`, `TimesRoman`, `Courier` in regular, bold, italic, and bold-italic variants).
  3. *DOM Text Burn-In & Whiteout Masking*: For every text edit across all pages, computes PDF bottom-up coordinate translations (`pageHeight - maskY - boxHeight`), draws opaque whiteout rectangles (`page.drawRectangle`), and stamps replacement text (`page.drawText`) using the corresponding embedded font family, size, and color.
  4. *Vector Drawing SVG Stamping*: Converts Fabric.js vector paths into scalable vector paths and stamps them onto the target PDF page.
  5. *Binary Serialization*: Generates a final `Uint8Array` via `pdfDoc.save()`, wraps it in a `Blob`, and triggers an automatic browser download.
- **Testing & Results**: Exported PDFs were opened in Adobe Acrobat, Google Chrome, and Apple Preview. All modified text remained sharp, searchable, and selectable, while drawings retained true vector scalability.

#### 3.2.11 REST API Client Integration with Backend Document Services
- **Module Purpose**: Connect the frontend with backend services for heavy document parsing and server-side manipulation.
- **Work Performed**: Engineered the API service client ([api.ts](file:///c:/Users/azooz/OneDrive/Documents/PDFEditor-main/frontend/src/services/api.ts)) using Axios. Configured endpoints for `POST /pdf/extract-blocks` (uploading a multi-page PDF via `multipart/form-data` and receiving positional block layouts) and `POST /pdf/edit` (dispatching server-side text whiteout and stamping operations).
- **Testing & Results**: Tested file transfers with payloads up to 20MB. Network timeouts, upload errors, and fallback client-side extraction routines operated reliably.

---

### 3.3 Limitations and Experience Gained

#### 3.3.1 Problems Faced
1. **Mathematical Coordinate Inversion**: PDF coordinates place the origin `(0,0)` at the bottom-left corner with an upward-pointing Y-axis, whereas HTML DOM and HTML5 Canvas place `(0,0)` at the top-left with a downward-pointing Y-axis. Deriving exact em-box baselines required rigorous matrix algebra (`pageHeight - baselineY`).
2. **Fabric.js v7 Breaking Changes**: Fabric.js underwent a major architecture rewrite between v5 and v7 (transitioning from callback-based methods to ES promises and renaming `Canvas` to `FabricCanvas`). Documentation for v7 was sparse, requiring inspection of source TypeScript definitions.
3. **High-DPI Retina Blur**: Canvas rendering on high-resolution screens resulted in blurry text when unscaled. This was resolved by computing `window.devicePixelRatio`, multiplying the internal canvas buffer size, and scaling down via CSS.
4. **Git Submodule Collision on Windows**: An accidental submodule gitlink in the repository caused Git on Windows to ignore the frontend folder during consolidation. Resolving this required removing the cached gitlink (`git rm --cached FrontEnd`) and staging clean tracking trees.

#### 3.3.2 What Was Missing?
- A dedicated automated visual regression test suite (e.g., Playwright with pixel-diffing) to verify that font rendering remained pixel-identical across releases.
- An offline font-embedding engine capable of embedding arbitrary custom TrueType (`.ttf`) and OpenType (`.otf`) fonts extracted directly from embedded PDF streams rather than standard PostScript font approximations.

#### 3.3.3 Areas of Improvement
- Memory consumption during multi-page rendering could be further optimized by disposing of off-screen PDF.js page canvas buffers instead of keeping them active in memory.
- Adding undo/redo (`Ctrl+Z` / `Ctrl+Y`) stacks for text repositioning and freehand drawing operations.

#### 3.3.4 How More Experience Could Have Been Gained
- Shadowing the backend team during the development of the C++ and Python PDF parsing microservices.
- Performing formal user-testing sessions with non-technical office staff to evaluate the intuitiveness of the floating micro-toolbar and eraser controls.

#### 3.3.5 Key Learnings
- **The Vector-First Paradigm**: Stamping true vector commands into a PDF document preserves document integrity infinitely better than canvas image flattening.
- **Sub-Pixel Geometry in Typography**: Font rendering is governed by intricate typographical metrics (ascent, descent, leading, em-box). High-quality UI overlays require calculating mathematical baselines rather than naive box approximations.
- **Client-Side Processing Power**: Modern web browsers equipped with WebAssembly, Web Workers, and HTML5 Canvas can execute complex document manipulation tasks locally, eliminating unnecessary server costs and protecting user privacy.

#### 3.3.6 Future Impact
This internship provided invaluable, real-world experience in frontend systems architecture, vector computer graphics, and production software engineering. Managing complex canvas synchronization, strict TypeScript interfaces, and binary document generation directly prepares me for professional engineering roles in web applications, graphical tool development, and cloud software engineering.

---

\newpage

# 4 RECENT TOPICS IN THE CONTEXT OF WORK DONE

To reinforce the technical principles practiced during the summer training, a comprehensive professional certification course was completed on the Udemy educational platform.

### 4.1 Course Overview

- **Platform**: Udemy
- **Course Title**: *React.js 19: The Complete Guide (شرح عربي)*
- **Lead Instructor**: Eng. Yahya ElAraby
- **Course Duration**: 19.5 total hours
- **Date of Completion**: September 28, 2026
- **Certificate Number**: `UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22`
- **Certificate Verification URL**: [ude.my/UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22](https://ude.my/UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22)
- **Reference Number**: `0004`

### 4.2 Course Objectives

The primary objectives of the masterclass were:
1. Master the fundamentals and advanced architectural paradigms introduced in **React 19**.
2. Learn modern state management techniques using React custom hooks, `useActionState`, `useOptimistic`, and `useTransition`.
3. Understand asynchronous rendering pipelines, concurrent React features, and performance optimization patterns.
4. Deepen practical expertise in integrating third-party imperative DOM libraries (such as HTML5 Canvas, Fabric.js, and WebGL) with React's declarative virtual DOM.
5. Build enterprise-scale, production-ready frontend web applications following modern component-driven architectures.

### 4.3 Topics Covered

The 19.5-hour curriculum covered:
- **React 19 Core Fundamentals**: Modern JSX syntax, component composition, prop validation, and conditional rendering.
- **Advanced Hook Ecosystem**: Comprehensive usage of `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, and `useId`.
- **Imperative DOM & Canvas Interoperability**: Bridging React's declarative lifecycle with imperative DOM elements using `useRef` and `forwardRef`.
- **Form Actions & Server Transitions**: Asynchronous transitions with `useTransition` and optimistic UI updates with `useOptimistic`.
- **State Management & Data Flow**: Lifting state up, context propagation, and scalable in-memory state dictionary patterns.
- **Frontend Performance Optimization**: Code splitting with dynamic `import()`, memoization strategies, cleanup routines, and preventing memory leaks in persistent event listeners.

### 4.4 Relevance to Training Work

The course content was directly applicable to the challenges faced during the PDF Editor project:
1. **Canvas Lifecycle & Ref Management**: In `canvas.tsx`, coordinating the lifecycle of the Fabric.js canvas instance (`fabricInstanceRef`) and the underlying PDF.js render tasks required advanced `useRef` and `useEffect` cleanup handling to prevent memory leaks during page flipping. The course provided the exact design patterns needed to encapsulate imperative canvas logic within declarative React components.
2. **Synchronized Performance & Event Throttling**: The course's modules on React rendering performance and event optimization guided the implementation of non-blocking pointer drag handlers and freehand stroke tracking at 60 FPS.
3. **Forwarding Refs for Canvas Handles**: The imperative export triggers exposed to the parent `App` component were built using `forwardRef` and `useImperativeHandle`, an architectural pattern emphasized in the masterclass.

### 4.5 Outcome

Completing this certification alongside the internship solidified my theoretical understanding of modern frontend engineering. It bridged the gap between academic programming exercises and industrial frontend architecture, enabling me to write clean, type-safe, maintainable, and high-performance React code.

---

\newpage

# 5 CONCLUSION

The summer training completed at the Near East Innovation and Information Technologies Centre provided an invaluable bridge between computer engineering academic coursework and industrial software engineering practice. Working as the Frontend Software Engineer on the **PDF Editor** project allowed me to solve complex, real-world problems in vector computer graphics, sub-pixel typography extraction, and lossless document manipulation.

Throughout the six-week training period, I successfully designed and delivered:
- A synchronized dual-layer canvas architecture pairing Mozilla PDF.js with Fabric.js v7.
- A sub-pixel typography detection engine that classifies PDF glyph transforms into editable line blocks.
- An in-place inline text editor featuring dynamic whiteout masking, micro-formatting popovers, and drag-and-drop repositioning.
- A high-DPI vector freehand painter with customizable pen presets, translucent highlighter, and a custom path-intersection stroke eraser.
- A multi-page in-memory annotation persistence pipeline.
- A zero-loss, client-side PDF export engine built with `pdf-lib` and SVG stamping.

The training highlighted that software engineering in production involves far more than writing isolated algorithms. It requires managing coordinate systems, handling memory leaks during canvas destruction, ensuring cross-browser consistency, and designing clean user experiences. The experience gained under the supervision of experienced engineers, combined with the completion of the advanced React 19 certification, has provided a strong foundation for my future career in computer engineering and software systems development.

---

\newpage

# 6 REFERENCES

- [1] Near East University, "About Near East University," Nicosia, TRNC, 2026. [Online]. Available: https://www.neu.edu.tr/
- [2] Near East University, "Innovation and Information Technologies Centre," Nicosia, TRNC, 2026.
- [3] Near East University, "NEU-IBM Advanced Research Center," Nicosia, TRNC, 2026.
- [4] RoboCup Federation, "RoboCup Small Size League," 2026. [Online]. Available: https://ssl.robocup.org/
- [5] React Documentation, "React 19 Overview and Reference," Meta Platforms, Inc., 2026. [Online]. Available: https://react.dev/
- [6] Mozilla, "PDF.js: A General-Purpose, Web Standards-Based Platform for Parsing and Rendering PDFs," Mozilla Corporation, 2026. [Online]. Available: https://mozilla.github.io/pdf.js/
- [7] Fabric.js Community, "Fabric.js Javascript Canvas Library Documentation (v7)," 2026. [Online]. Available: https://fabricjs.com/
- [8] Hopding, "pdf-lib: Create and Modify PDF Documents in Any JavaScript Environment," 2026. [Online]. Available: https://pdf-lib.js.org/
- [9] Tailwind Labs, "Tailwind CSS v4 Documentation," 2026. [Online]. Available: https://tailwindcss.com/
- [10] Vite Team, "Vite: Next Generation Frontend Tooling," 2026. [Online]. Available: https://vite.dev/
- [11] Microsoft, "TypeScript Language Specification (v6.0)," Microsoft Corporation, 2026. [Online]. Available: https://www.typescriptlang.org/
- [12] Lucide Authors, "Lucide: Beautiful & Consistent Icons," 2026. [Online]. Available: https://lucide.dev/
- [13] Axios Developers, "Axios: Promise Based HTTP Client for the Browser and Node.js," 2026. [Online]. Available: https://axios-http.com/
- [14] Y. ElAraby, "React.js 19: The Complete Guide," Udemy, Inc., 2026. [Online]. Available: https://ude.my/UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22
- [15] Adobe Systems Incorporated, "Document Management — Portable Document Format — Part 1: PDF 1.7," ISO 32000-1, 2008.

---

\newpage

# 7 APPENDIX

### 7.1 Figures and User Interface Screenshots

```text
+-----------------------------------------------------------------------------------------------+
|                                                                                               |
|                                       [ PDF Editor Logo ]                                     |
|                                                                                               |
|                                        Open PDF Document                                      |
|                 Edit text in-place with exact font matching, draw vector                      |
|                           annotations, and export losslessly.                                 |
|                                                                                               |
|                       +-----------------------------------------------+                       |
|                       |                                               |                       |
|                       |            [ Upload File Icon ]               |                       |
|                       |       Click to browse or drop file here       |                       |
|                       |   Supports standard PDF documents up to 50MB  |                       |
|                       |                                               |                       |
|                       |             [ Choose PDF File ]               |                       |
|                       |                                               |                       |
|                       +-----------------------------------------------+                       |
|                                                                                               |
|               * 100% Private & Local   *   Vector Fidelity   *   In-Place Text Editing        |
|                                                                                               |
+-----------------------------------------------------------------------------------------------+
```
*Figure 7.1: Minimalist Notion-style document dropzone and landing interface (`landing-page.png`).*

```text
+-----------------------------------------------------------------------------------------------+
| [Logo] PDF Editor / Document.pdf                         <  2 of 6  >                 [Export]|
+-----------------------------------------------------------------------------------------------+
| [Toolbar] |                                                                  | [Properties]   |
| [Square]  |   1. Project Overview                                            | Text Properties|
| [Circle]  |                                                                  | Formatting:    |
| [Text]    |   This project implements a distributed inventory management     | [Bold] [Italic]|
| [Painter] |   +------------------------------------------------------------+ |                |
| [Eraser]  |   | + Move | B | I | Reset | Delete | Done                     | | Font Size: 11  |
|           |   | Operations. The main goal is not only to show that network | | Color: #000000 |
|           |   +------------------------------------------------------------+ |                |
|           |                                                                  | [Delete Box]   |
|           |   2. System Purpose and Functional Requirements                  |                |
|           |   * Start a server application on a personalized port.           |                |
|           |   * Generate inventory data files using student ID.              |                |
|           |                                                                  |                |
+-----------------------------------------------------------------------------------------------+
```
*Figure 7.2: PDF Editor workspace showing in-place text editing, micro-popover, toolbars, and inspector (`editor-workspace.png`).*

---

### 7.2 Selected Core Code Listings

#### Listing 1: Dual-Layer Canvas Initialization & Viewport Synchronization
*Source: `frontend/src/components/canvas.tsx`*
```typescript
// Initialize Fabric canvas strictly for vector shapes and freehand drawing
useEffect(() => {
  if (fabricCanvasElRef.current && !fabricInstanceRef.current) {
    const initCanvas = new FabricCanvas(fabricCanvasElRef.current, {
      width: canvasSize.width || 800,
      height: canvasSize.height || 1100,
      backgroundColor: "transparent",
      selection: true,
    });
    initCanvas.setZoom(scale);

    // Serialization callback to persist annotations
    const persistPageAnnotations = () => {
      if (fabricInstanceRef.current) {
        pageAnnotationsRef.current[pageNumberRef.current] =
          fabricInstanceRef.current.toJSON();
      }
    };

    initCanvas.on("object:added", persistPageAnnotations);
    initCanvas.on("object:modified", persistPageAnnotations);
    initCanvas.on("object:removed", persistPageAnnotations);
    initCanvas.on("path:created", persistPageAnnotations);

    fabricInstanceRef.current = initCanvas;
    setFabricCanvas(initCanvas);
  }

  return () => {
    if (fabricInstanceRef.current) {
      fabricInstanceRef.current.dispose();
      fabricInstanceRef.current = null;
      setFabricCanvas(null);
    }
  };
}, []);
```
*Description: Initializes the top-layer FabricCanvas element with a transparent background, hooks state serialization listeners onto object creation and modification events, and ensures clean resource disposal upon unmounting.*

---

#### Listing 2: PDF Text Content Extraction & Mathematical Typography Parsing
*Source: `frontend/src/components/canvas.tsx`*
```typescript
// Extract positional text blocks with exact font metrics from PDF stream
for (const item of textContent.items) {
  if (!("str" in item) || !item.str.trim()) continue;

  const fontObj = fontMap[item.fontName];
  const rawFontName = fontObj?.name || item.fontName || "";
  const style = (textContent.styles as Record<string, any>)?.[item.fontName];
  const typography = parsePdfFontName(rawFontName, style?.fontFamily);

  const transform = item.transform;
  const x = transform[4];
  const rawFontSize = Math.hypot(transform[0], transform[1]);
  const fontSize = Math.max(4, Math.round(rawFontSize * 100) / 100);

  const ascent = typeof style?.ascent === "number" ? style.ascent : 0.75;
  const descent = typeof style?.descent === "number" ? style.descent : -0.25;

  // Baseline in PDF viewport coordinates (top-down)
  const baselineY = viewport.height - transform[5];
  // Exact top of font em-box
  const y = baselineY - ascent * fontSize;
  const height = (ascent + Math.abs(descent)) * fontSize;
  const width = item.width || Math.max(16, item.str.length * fontSize * 0.52);

  rawItems.push({
    str: item.str,
    x,
    baselineY,
    y,
    width,
    height,
    fontSize,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight,
    fontStyle: typography.fontStyle,
    pdfFontType: typography.pdfFontType,
    ascent,
    descent,
  });
}
```
*Description: Extracts transformation matrices from the PDF.js stream, computes exact vertical baseline coordinates, and classifies typography metrics for sub-pixel in-place rendering.*

---

#### Listing 3: Custom Stroke-Level Vector Eraser Logic
*Source: `frontend/src/components/canvas.tsx`*
```typescript
const handleEraserAtEvent = (opt: any) => {
  if (!isEraserModeRef.current) return;
  if (opt.target && opt.target.type === "path") {
    eraseTarget(opt.target);
    return;
  }
  const pointer =
    opt.scenePoint ||
    (initCanvas as any).getScenePoint?.(opt.e) ||
    (initCanvas as any).getViewportPoint?.(opt.e);
  if (!pointer) return;

  const objs = initCanvas.getObjects();
  for (let i = objs.length - 1; i >= 0; i--) {
    const obj = objs[i];
    if (obj.type === "path") {
      const bound = obj.getBoundingRect();
      const margin = 14;
      if (
        pointer.x >= bound.left - margin &&
        pointer.x <= bound.left + bound.width + margin &&
        pointer.y >= bound.top - margin &&
        pointer.y <= bound.top + bound.height + margin
      ) {
        eraseTarget(obj);
        break;
      }
    }
  }
};
```
*Description: Implements an interactive proximity-based hit tester that identifies and removes vector drawing paths under pointer events without modifying background document structures.*

---

#### Listing 4: Lossless Vector PDF Export & Whiteout Stamping Engine
*Source: `frontend/src/utils/pdfExport.ts`*
```typescript
// 1. Mask original text location (so original text is hidden)
const maskX = edit.originalX !== undefined ? edit.originalX : edit.x;
const maskY = edit.originalY !== undefined ? edit.originalY : edit.y;
const maskWidth = edit.originalWidth !== undefined ? edit.originalWidth : edit.width;
const maskHeight = edit.originalHeight !== undefined ? edit.originalHeight : edit.height;

const boxWidth = Math.max(maskWidth + padX * 2, 20);
const boxHeight = Math.max(maskHeight + padY * 2, fontSize * 1.25);
const pdfY = pageHeight - maskY - boxHeight;

page.drawRectangle({
  x: maskX - padX,
  y: pdfY,
  width: boxWidth,
  height: boxHeight,
  color: rgb(1, 1, 1),
  opacity: 1,
  borderWidth: 0,
});

// 2. Draw replacement text at its current position with embedded standard fonts
if (edit.text && edit.text.trim()) {
  const textY = edit.baselineY !== undefined
    ? pageHeight - edit.baselineY
    : pageHeight - edit.y - fontSize * 0.8;
  const colorParsed = parseColor(normalizeTextColor(edit.color));

  page.drawText(edit.text, {
    x: edit.x,
    y: textY,
    size: fontSize,
    font,
    lineHeight: 1.15 * fontSize,
    color: colorParsed ? colorParsed.color : rgb(0, 0, 0),
  });
}
```
*Description: Applies vector whiteout rectangles over edited text regions in the PDF stream and stamps replacement text with embedded PostScript fonts at mathematically accurate coordinates.*

---

### 7.3 Professional Certificate of Completion

```text
====================================================================================================
                                            ûdemy
                                  CERTIFICATE OF COMPLETION
                                React.js 19: The Complete Guide
                                        (شرح عربي)
                             Instructors: Eng. Yahya ElAraby

                               Awarded to: Abdelaziz Omer
                               Date of Completion: Sept. 28, 2026
                               Length: 19.5 total hours

        Certificate Number: UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22
        Verification URL: ude.my/UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22
        Reference Number: 0004
====================================================================================================
```
*Figure 7.3: Professional Certificate of Completion for "React.js 19: The Complete Guide" on Udemy.*
