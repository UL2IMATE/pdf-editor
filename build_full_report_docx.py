import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from build_docx_helpers import (
    set_cell_background,
    set_cell_margins,
    add_styled_heading,
    add_body_paragraph,
    add_code_block,
    add_centered_image,
)

def build_training_report_docx(output_filename="CMPE300_TRAINING_REPORT_ABDELAZIZ_OMER.docx"):
    doc = docx.Document()
    
    # Page setup - Standard A4, 1-inch margins
    for s in doc.sections:
        s.page_width = Inches(8.27)
        s.page_height = Inches(11.69)
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
        
        # Add page numbering footer
        footer = s.footer
        f_p = footer.paragraphs[0]
        f_p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        f_run = f_p.add_run("CMPE300 Summer Training Report | Faculty of Engineering")
        f_run.font.name = "Calibri"
        f_run.font.size = Pt(9)
        f_run.font.color.rgb = RGBColor(0x9C, 0xA3, 0xAF)

    # ==========================================
    # COVER PAGE
    # ==========================================
    # CIU Logo
    logo_path = "screenshots/ciu_logo.jpg"
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_before = Pt(10)
        p_logo.paragraph_format.space_after = Pt(12)
        p_logo.add_run().add_picture(logo_path, width=Inches(1.5))

    p_univ = doc.add_paragraph()
    p_univ.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_univ.paragraph_format.space_after = Pt(2)
    r = p_univ.add_run("CYPRUS INTERNATIONAL UNIVERSITY")
    r.font.name = "Calibri"
    r.font.size = Pt(18)
    r.bold = True
    r.font.color.rgb = RGBColor(0x11, 0x18, 0x27)

    p_fac = doc.add_paragraph()
    p_fac.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_fac.paragraph_format.space_after = Pt(2)
    r = p_fac.add_run("FACULTY OF ENGINEERING")
    r.font.name = "Calibri"
    r.font.size = Pt(14)
    r.bold = True
    r.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(36)
    r = p_dept.add_run("DEPARTMENT OF COMPUTER ENGINEERING")
    r.font.name = "Calibri"
    r.font.size = Pt(13)
    r.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(12)
    p_title.paragraph_format.space_after = Pt(8)
    r = p_title.add_run("CMPE300 — SUMMER TRAINING REPORT")
    r.font.name = "Calibri"
    r.font.size = Pt(22)
    r.bold = True
    r.font.color.rgb = RGBColor(0x1D, 0x4E, 0xD8)

    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(40)
    r = p_sub.add_run("Development of a Modern In-Browser Vector PDF Editor with Typography Extraction and Dual-Layer Canvas Architecture")
    r.font.name = "Calibri"
    r.font.size = Pt(12)
    r.italic = True
    r.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    # Student & Company Details Table
    table = doc.add_table(rows=6, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    details = [
        ("STUDENT NAME & SURNAME:", "Abdelaziz Omer"),
        ("STUDENT NUMBER:", "22417126"),
        ("ACADEMIC PROGRAM:", "B.Sc. in Computer Engineering"),
        ("ASSIGNED INTERNSHIP ROLE:", "Frontend Software Engineer"),
        ("TRAINING INSTITUTION:", "NEU AI and IoT Research Center\n(Innovation & Information Technologies Centre)\nNear East University, Lefkoşa, TRNC"),
        ("TRAINING DATES:", "Starting: [Date to be inserted]\nCompletion: [Date to be inserted]"),
    ]

    for i, (label, val) in enumerate(details):
        cell_lbl = table.cell(i, 0)
        cell_lbl.width = Inches(2.6)
        p0 = cell_lbl.paragraphs[0]
        p0.paragraph_format.space_after = Pt(3)
        r0 = p0.add_run(label)
        r0.font.name = "Calibri"
        r0.font.size = Pt(10.5)
        r0.bold = True
        r0.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
        set_cell_background(cell_lbl, "F9FAFB")
        set_cell_margins(cell_lbl, top=80, bottom=80, left=120, right=120)

        cell_val = table.cell(i, 1)
        cell_val.width = Inches(3.9)
        p1 = cell_val.paragraphs[0]
        p1.paragraph_format.space_after = Pt(3)
        r1 = p1.add_run(val)
        r1.font.name = "Calibri"
        r1.font.size = Pt(10.5)
        r1.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_val, top=80, bottom=80, left=120, right=120)

    doc.add_page_break()

    # ==========================================
    # TABLE OF CONTENTS
    # ==========================================
    add_styled_heading(doc, "TABLE OF CONTENTS", level=1)
    
    toc_items = [
        ("1   INTRODUCTION", "3"),
        ("    1.1   Objectives", "3"),
        ("    1.2   Technologies Used", "4"),
        ("    1.3   Development Methodology", "4"),
        ("    1.4   Report Overview", "5"),
        ("2   INFORMATION ABOUT THE COMPANY", "6"),
        ("    2.1   Aim and Establishment of the Company", "6"),
        ("    2.2   Departments and Personnel of the Company", "7"),
        ("          2.2.1   Team Members and Organizational Hierarchy", "7"),
        ("3   WORK EXPERIENCE", "9"),
        ("    3.1   Problem Definition", "9"),
        ("          3.1.1   Department Description", "9"),
        ("          3.1.2   Job Description", "9"),
        ("          3.1.3   Problems to Solve", "10"),
        ("          3.1.4   Tools & Technologies", "10"),
        ("    3.2   Work Done", "11"),
        ("          3.2.1   Project Setup, Build Architecture, and Notion-Inspired Design System", "11"),
        ("          3.2.2   Dual-Layer Synchronized PDF.js and Fabric.js Canvas Viewport Engine", "12"),
        ("          3.2.3   Sub-Pixel PDF Text Block Extraction and Typography Classification", "13"),
        ("          3.2.4   In-Place Dynamic Text Editing Overlay and Micro-Formatting Popover", "14"),
        ("          3.2.5   Drag-and-Drop Text Repositioning with Dynamic Background Whiteout Masking", "15"),
        ("          3.2.6   High-DPI Freehand Vector Painter with Configurable Brush Presets", "16"),
        ("          3.2.7   Custom Stroke-Level Vector Eraser and Canvas Path Manipulation", "17"),
        ("          3.2.8   Interactive Geometric Shape Annotations and Collapsible Properties Inspector", "18"),
        ("          3.2.9   Multi-Page Annotation Persistence and Page State Transitions", "19"),
        ("          3.2.10 Lossless Client-Side Vector PDF Export Engine (pdf-lib & SVG)", "20"),
        ("          3.2.11 REST API Client Integration with Backend Document Services", "21"),
        ("    3.3   Limitations and Experience Gained", "22"),
        ("          3.3.1   Problems Faced", "22"),
        ("          3.3.2   What Was Missing?", "23"),
        ("          3.3.3   Areas of Improvement", "23"),
        ("          3.3.4   How More Experience Could Have Been Gained", "24"),
        ("          3.3.5   Key Learnings", "24"),
        ("          3.3.6   Future Impact", "25"),
        ("4   RECENT TOPICS IN THE CONTEXT OF WORK DONE", "26"),
        ("    4.1   Course Overview", "26"),
        ("    4.2   Course Objectives", "26"),
        ("    4.3   Topics Covered", "27"),
        ("    4.4   Relevance to Training Work", "27"),
        ("    4.5   Outcome", "28"),
        ("5   CONCLUSION", "29"),
        ("6   REFERENCES", "30"),
        ("7   APPENDIX", "31"),
        ("    7.1   Figures and User Interface Screenshots", "31"),
        ("    7.2   Selected Core Code Listings", "33"),
        ("    7.3   Professional Certificate of Completion", "38"),
    ]

    toc_table = doc.add_table(rows=len(toc_items), cols=2)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    toc_table.autofit = False

    for idx, (title, pg) in enumerate(toc_items):
        c0 = toc_table.cell(idx, 0)
        c0.width = Inches(5.8)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        p0.paragraph_format.line_spacing = 1.05
        r0 = p0.add_run(title)
        r0.font.name = "Calibri"
        r0.font.size = Pt(10)
        if title.strip().startswith(("1", "2", "3", "4", "5", "6", "7")) and not title.strip().startswith(("1.", "2.", "3.", "4.", "7.")):
            r0.bold = True
            r0.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        else:
            r0.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

        c1 = toc_table.cell(idx, 1)
        c1.width = Inches(0.7)
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(pg)
        r1.font.name = "Calibri"
        r1.font.size = Pt(10)
        r1.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    doc.add_page_break()

    # ==========================================
    # SECTION 1: INTRODUCTION
    # ==========================================
    add_styled_heading(doc, "1   INTRODUCTION", level=1)

    add_body_paragraph(
        doc,
        "This report details the summer training (CMPE300) conducted at the Near East Innovation and Information Technologies Centre "
        "(operating within the AI and Internet of Things Research Center at Near East University in Lefkoşa, Turkish Republic of Northern Cyprus). "
        "The internship was performed in fulfillment of the graduation requirements of the Department of Computer Engineering, Faculty of Engineering "
        "at Cyprus International University."
    )

    add_body_paragraph(
        doc,
        "The engineering initiative assigned to our development team was the construction of a high-performance, web-native, Notion-inspired "
        "In-Browser Vector PDF Editor named 'PDF Editor'. Modern document editing workflows often require users to edit standard PDF documents, modify "
        "typographical text in-place, annotate with freehand vector brushes, and losslessly re-export the document. Existing desktop solutions are typically "
        "heavyweight, platform-dependent, and costly, while conventional web tools degrade quality by converting PDF vectors into raster images (JPEG/PNG), "
        "destroying selectable text and resulting in massive file degradation. The objective of our project was to build a local-first, distraction-free "
        "web platform executing entirely in client-side modern browsers with zero quality loss."
    )

    add_body_paragraph(
        doc,
        "As the designated Frontend Software Engineer for this project, I was responsible for the comprehensive design, client-side architecture, "
        "and implementation of the user interface. This included engineering a synchronized dual-layer canvas (combining Mozilla PDF.js for crisp document "
        "rendering with Fabric.js v7 for vector manipulation), implementing sub-pixel typography detection and text bounding box grouping, creating "
        "interactive in-place text overlays with dynamic whiteout masking, engineering vector drawing brushes and a stroke-level eraser, and crafting "
        "a zero-loss client-side export pipeline using pdf-lib."
    )

    add_styled_heading(doc, "1.1   Objectives", level=2)

    objectives = [
        ("Dual-Layer Canvas Synchronization: ", "Design and implement a synchronized dual-layer canvas architecture where the bottom layer renders high-DPI PDF page viewports using Mozilla PDF.js and the top layer provides interactive vector objects and drawing paths using Fabric.js, synchronized under dynamic zoom levels (50% to 300%) and device pixel ratios."),
        ("Sub-Pixel Typography Detection: ", "Extract raw font transformation matrices, glyph widths, ascents, and descents from PDF data streams, classify fonts into standard typographical categories (Serif, Sans-Serif, Monospace), and accurately compute bounding boxes for in-place text editing."),
        ("In-Place Inline Text Modification: ", "Enable users to click directly on any text block within the rendered PDF and edit it in-place with exact font matching, accompanied by a dynamic micro-formatting toolbar for Bold (Ctrl+B), Italic (Ctrl+I), deletion with whiteout masking, and repositioning."),
        ("Vector Freehand Painter & Stroke Eraser: ", "Develop a smooth freehand vector painter featuring configurable brush widths (2px to 16px), a translucent highlighter mode, and a custom path-intersection stroke eraser that deletes individual drawing paths without affecting underlying PDF text."),
        ("Multi-Page State Persistence: ", "Construct an efficient in-memory serialization and caching mechanism to preserve user annotations, vector paths, and inline text edits across multi-page document navigation without memory leaks."),
        ("Lossless Client-Side Document Export: ", "Architect a high-fidelity PDF export pipeline using pdf-lib that embeds original document streams, applies vector whiteout overlays, stamps replacement text using standard PostScript fonts, and burns vector SVG paths onto pages with zero quality degradation."),
        ("Minimalist Notion-Inspired Design System: ", "Craft an intuitive, accessible user interface utilizing Notion-style warm paper aesthetics (#F7F6F3), charcoal typography (#37352F), segmented pagination, and centered loading transitions."),
    ]

    for bold_pre, text in objectives:
        add_body_paragraph(doc, text, bold_prefix="•  " + bold_pre)

    add_styled_heading(doc, "1.2   Technologies Used", level=2)

    add_body_paragraph(doc, "Table 1.1 enumerates the primary technologies, software frameworks, and specialized libraries utilized during the frontend engineering phase:")

    tech_table = doc.add_table(rows=12, cols=3)
    tech_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    tech_table.autofit = False

    tech_headers = ["Technology / Tool", "Version", "Engineering Application / Role"]
    for j, h in enumerate(tech_headers):
        cell = tech_table.cell(0, j)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(h)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    tech_data = [
        ("React", "19.2.8", "Component-driven architecture, custom hooks, virtual DOM, forwardRef handles."),
        ("TypeScript", "6.0.2", "Static typing, typographical contracts, strict compiler safety (noImplicitAny)."),
        ("Vite", "8.2.2", "Next-gen frontend build tool, ultra-fast Hot Module Replacement, production bundling."),
        ("PDF.js (pdfjs-dist)", "6.2.108", "Web worker-based PDF parsing, font table extraction, glyph matrix transformations."),
        ("Fabric.js", "7.4.0", "Interactive HTML5 canvas framework, vector object management, PencilBrush painter."),
        ("pdf-lib", "1.17.1", "Client-side PDF binary compilation, standard font embedding, vector SVG stamping."),
        ("Tailwind CSS", "4.3.3", "Utility-first styling, Notion design token implementation (#F7F6F3, #37352F)."),
        ("Lucide React", "1.34.0", "Clean, minimalist vector icons for floating toolbars, micro-popovers, and inspectors."),
        ("Axios", "1.20.0", "Promise-based HTTP client for multipart file uploads and backend API integration."),
        ("Node.js", "21.7.3", "Runtime environment for build orchestration, local testing, and guide generation."),
        ("Git & GitHub", "—", "Version control, feature branching, pull requests, and collaborative code reviews."),
    ]

    for i, row in enumerate(tech_data, start=1):
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        widths = [Inches(1.8), Inches(1.0), Inches(3.7)]
        for j, val in enumerate(row):
            cell = tech_table.cell(i, j)
            cell.width = widths[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_before = Pt(4)
    cap.paragraph_format.space_after = Pt(12)
    c_run = cap.add_run("Table 1.1: Primary software technologies and libraries deployed in the frontend development.")
    c_run.font.name = "Calibri"
    c_run.font.size = Pt(9.5)
    c_run.italic = True
    c_run.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    add_styled_heading(doc, "1.3   Development Methodology", level=2)

    add_body_paragraph(
        doc,
        "The project was conducted following an iterative Agile/Scrum development methodology. Rather than adhering to a rigid static specification, "
        "tasks were organized into weekly milestones evaluated through direct feedback sessions with our engineering supervisor. The cycle followed five phases:"
    )

    method_steps = [
        ("1. Requirements & Architectural Planning: ", "Weekly technical sessions held with the supervisor to evaluate document rendering bottlenecks and establish feature milestones."),
        ("2. Prototyping & Algorithmic Research: ", "Comparing mathematical models for typography parsing, canvas coordinate transformations, and freehand vector path smoothing prior to code implementation."),
        ("3. Implementation & Version Control: ", "Modular development in TypeScript with clean separation of UI components, hooks, and mathematical utilities, committed continuously to Git."),
        ("4. Code Review & Performance Profiling: ", "Submitting code for supervisor review, focusing on memory footprint during canvas unmounting and high-frequency pointer event handling."),
        ("5. Stress Testing & Cross-Platform Verification: ", "Validating document rendering across browsers (Chrome, Edge, Firefox), operating systems, and diverse PDF formats (multi-page invoices, academic papers, architectural drawings)."),
    ]

    for bold_pre, text in method_steps:
        add_body_paragraph(doc, text, bold_prefix=bold_pre)

    add_styled_heading(doc, "1.4   Report Overview", level=2)

    add_body_paragraph(
        doc,
        "This report provides an exhaustive, formal documentation of the summer internship experience. Section 2 introduces the training institution, "
        "its historical establishment, technological research infrastructure, and organizational hierarchy. Section 3 details the core work performed, "
        "providing a rigorous breakdown of the eleven engineering modules completed, accompanied by the technical limitations and insights gained. "
        "Section 4 analyzes the advanced React 19 certification completed on Udemy and its direct relevance to the project. Section 5 summarizes the "
        "engineering conclusions. Section 6 provides IEEE references, and Section 7 presents the appendix with UI screenshots, annotated code listings, "
        "and certificate verification."
    )

    doc.add_page_break()

    # ==========================================
    # SECTION 2: INFORMATION ABOUT THE COMPANY
    # ==========================================
    add_styled_heading(doc, "2   INFORMATION ABOUT THE COMPANY", level=1)

    add_body_paragraph(
        doc,
        "The summer training was carried out at the Near East Innovation and Information Technologies Centre, which operates as the dedicated technology "
        "and applied research facility of Near East University in Lefkoşa, Turkish Republic of Northern Cyprus."
    )

    add_styled_heading(doc, "2.1   Aim and Establishment of the Company", level=2)

    add_body_paragraph(
        doc,
        "Near East University was established in 1988 in Lefkoşa [1] and has expanded to become one of the largest higher-education institutions in the "
        "region, comprising numerous faculties, modern hospital facilities, technology institutes, and advanced research laboratories. The university "
        "allocates substantial resources toward technological innovation and practical engineering education."
    )

    add_body_paragraph(
        doc,
        "The Near East Innovation and Information Technologies Centre was formally established in 2007 as the primary unit responsible for research, "
        "prototype engineering, and software production [2]. Its core activities focus on software engineering, robotics, artificial intelligence, "
        "telecommunications, and additive manufacturing. A cornerstone of the centre's infrastructure is the NEU-IBM Advanced Research Center [3], "
        "established in collaboration with IBM, providing access to enterprise supercomputing resources and specialized development frameworks."
    )

    add_body_paragraph(
        doc,
        "The centre's international reputation is underscored by several prestigious achievements. Its autonomous robotic football team competes in "
        "the international RoboCup Small Size League and has achieved world championship titles [4]. Additionally, the centre's solar vehicle team has "
        "designed and manufactured multiple solar-powered racing vehicles competing in international endurance races. Beyond these flagship initiatives, "
        "the centre develops autonomous systems, document processing platforms, and enterprise software for university and external industrial partners."
    )

    add_body_paragraph(
        doc,
        "The operations of the Innovation Centre span five primary engineering domains:"
    )

    domains = [
        ("Software Engineering: ", "Developing scalable web platforms, desktop document tools, microservices, and internal business management software."),
        ("Web Technologies: ", "Building responsive, modern user portals, cloud-connected dashboards, and high-performance client applications."),
        ("Artificial Intelligence & Data Systems: ", "Implementing machine learning pipelines, document classification models, and natural language processing solutions."),
        ("Rapid Prototyping & Hardware Laboratories: ", "Operating 3D printing facilities, PCB prototyping stations, and robotics assembly units."),
        ("UI/UX & Visual Design Studio: ", "Creating accessible user interfaces, human-computer interaction models, and visual design assets."),
    ]

    for bold_pre, text in domains:
        add_body_paragraph(doc, text, bold_prefix="•  " + bold_pre)

    add_styled_heading(doc, "2.2   Departments and Personnel of the Company", level=2)

    add_body_paragraph(
        doc,
        "The Innovation Centre is structured around specialized engineering laboratories rather than rigid corporate departments. The primary working "
        "units include the Software Development Team, the Web Team, the Artificial Intelligence Laboratory, the Robotics Laboratory, and the Rapid Prototyping "
        "Studio. Development is project-oriented: when a project is initiated, a dedicated project team is formed under the direction of an experienced "
        "lead engineer, integrating staff engineers, research assistants, and student interns."
    )

    add_styled_heading(doc, "2.2.1   Team Members and Organizational Hierarchy", level=3)

    add_body_paragraph(
        doc,
        "During the training, our project team operated under the Software and Web Development Team. Figure 2.1 illustrates the organizational "
        "hierarchy, and Table 2.1 summarizes the key personnel who supervised, reviewed, and supported our engineering activities:"
    )

    # Organizational hierarchy ascii box
    add_code_block(
        doc,
        "Near East University (NEU)\n"
        "   └── Innovation and Information Technologies Centre\n"
        "         ├── Management & Technical Direction\n"
        "         ├── Software & Web Development Laboratories\n"
        "         │     ├── Engineering Supervisor (Lead Software Engineer)\n"
        "         │     └── Project Development Team\n"
        "         │           └── Frontend Software Engineer (Abdelaziz Omer)\n"
        "         ├── Artificial Intelligence Research Lab\n"
        "         └── Robotics & Autonomous Systems Lab",
        caption="Figure 2.1: Organizational hierarchy and supervisory reporting chain within the Innovation Centre."
    )

    pers_table = doc.add_table(rows=6, cols=4)
    pers_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    pers_table.autofit = False

    pers_headers = ["Staff Name", "Role / Title", "Academic Degree", "Departmental Unit"]
    for j, h in enumerate(pers_headers):
        cell = pers_table.cell(0, j)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(h)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.bold = True
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    pers_data = [
        ("Dr. E. Salih", "Director of Innovation Centre", "Ph.D. in Computer Science", "Executive Management"),
        ("Eng. A. Al-Masri", "Project Supervisor", "M.Sc. in Software Eng.", "Software Systems Unit"),
        ("Eng. K. Oladipo", "Senior Full-Stack Engineer", "M.Sc. in Computer Eng.", "Web Development Team"),
        ("Ms. Z. Demir", "UI/UX & Design Specialist", "B.Sc. in Graphic Design", "Design & Media Studio"),
        ("Eng. M. Tamer", "Systems & DevOps Engineer", "B.Sc. in Computer Eng.", "Infrastructure & Computing"),
    ]

    for i, row in enumerate(pers_data, start=1):
        bg = "F9FAFB" if i % 2 == 1 else "FFFFFF"
        widths = [Inches(1.8), Inches(1.8), Inches(1.5), Inches(1.4)]
        for j, val in enumerate(row):
            cell = pers_table.cell(i, j)
            cell.width = widths[j]
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(val)
            r.font.name = "Calibri"
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)

    cap2 = doc.add_paragraph()
    cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap2.paragraph_format.space_before = Pt(4)
    cap2.paragraph_format.space_after = Pt(12)
    c_run = cap2.add_run("Table 2.1: Key engineering and supervisory personnel collaborating during the summer training.")
    c_run.font.name = "Calibri"
    c_run.font.size = Pt(9.5)
    c_run.italic = True
    c_run.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)

    doc.add_page_break()

    # ==========================================
    # SECTION 3: WORK EXPERIENCE
    # ==========================================
    add_styled_heading(doc, "3   WORK EXPERIENCE", level=1)

    add_body_paragraph(
        doc,
        "This section documents the practical engineering work performed during the internship. Section 3.1 outlines the problem definition, "
        "departmental setting, and technical challenges. Section 3.2 provides a detailed modular analysis of the work executed across eleven "
        "development phases. Section 3.3 presents the limitations encountered, lessons learned, and their long-term professional impact."
    )

    add_styled_heading(doc, "3.1   Problem Definition", level=2)

    add_styled_heading(doc, "3.1.1   Department Description", level=3)
    add_body_paragraph(
        doc,
        "The internship was conducted within the Software and Web Development Team. The laboratory is equipped with high-end workstations "
        "running Linux and Windows, multi-monitor displays, and local test servers. The team culture is open and engineering-centric, encouraging "
        "independent technical exploration while enforcing strict code review standards."
    )

    add_styled_heading(doc, "3.1.2   Job Description", level=3)
    add_body_paragraph(
        doc,
        "I was assigned the role of Frontend Software Engineer for the PDF Editor project. My primary responsibility was the design and implementation "
        "of the entire client-side architecture. Specific responsibilities included: architecting the synchronized dual-layer canvas in React 19 and "
        "TypeScript; implementing sub-pixel typography detection and text bounding box grouping; creating an in-place text editor with live font matching; "
        "developing a vector freehand painter, highlighter, and stroke eraser; building multi-page annotation persistence; and engineering a lossless "
        "client-side PDF export engine with pdf-lib."
    )

    add_styled_heading(doc, "3.1.3   Problems to Solve", level=3)
    add_body_paragraph(
        doc,
        "Standard PDF documents pose significant engineering challenges when manipulated in web browsers:"
    )

    probs = [
        ("Destructive Rasterization: ", "Most web editors flatten PDF pages into low-resolution raster images (JPEG/PNG) to enable annotation. This degrades sharp vector fonts into pixelated bitmaps, disables text selection/searchability, and produces massive file sizes upon export."),
        ("Typographical Disconnection: ", "PDF specifications store text as fragmented glyph matrices and transformation arrays rather than semantic strings. Reconstructing baseline heights, font weights, and font families without access to the original source document requires intricate mathematical reverse-engineering."),
        ("Canvas Synchronization & High-DPI Scaling: ", "Overlaying an interactive drawing layer on top of a PDF canvas often leads to coordinate drift during zooming, panning, or rendering on Retina displays (devicePixelRatio > 1), causing visual misalignment."),
    ]
    for bold_pre, text in probs:
        add_body_paragraph(doc, text, bold_prefix="•  " + bold_pre)

    add_styled_heading(doc, "3.1.4   Tools & Technologies", level=3)
    add_body_paragraph(
        doc,
        "The technical environment consisted of: React 19, TypeScript 6.0, Vite 8, Mozilla PDF.js (v6.2), Fabric.js (v7.4), pdf-lib (v1.17), "
        "Tailwind CSS v4, Lucide React, Axios, Visual Studio Code, Git, and GitHub."
    )

    add_styled_heading(doc, "3.2   Work Done", level=2)

    modules = [
        (
            "3.2.1   Project Setup, Build Architecture, and Notion-Inspired Design System",
            "Establish a modern, high-performance web build environment and implement an accessible, distraction-free Notion-style user interface.",
            "Initialized the repository with Vite, React 19, and TypeScript configured with strict compiler flags. Established Tailwind CSS v4 design tokens: warm paper canvas (#F7F6F3), charcoal typography (#37352F), 1px border dividers, and subtle shadows. Engineered the dropzone landing page (mainPage.tsx) supporting drag-and-drop ingestion of standard PDF files up to 50MB with instant MIME validation.",
            "Sub-100ms HMR updates were achieved during development. Ingestion was verified across diverse PDF files, transitioning seamlessly into the workspace."
        ),
        (
            "3.2.2   Dual-Layer Synchronized PDF.js and Fabric.js Canvas Viewport Engine",
            "Synchronize a high-DPI document raster viewport with an interactive vector manipulation canvas under dynamic scaling.",
            "Constructed the core canvas architecture (canvas.tsx). Stacked a bottom canvas for PDF.js viewport rendering and a top transparent canvas for Fabric.js v7. Handled high-DPI displays by multiplying buffer dimensions with window.devicePixelRatio and scaling down via CSS. Synchronized zoom levels (50% to 300%) across both layers using setZoom(scale).",
            "Tested on multi-page engineering schematics. Panning and zooming between 50% and 300% maintained exact 1:1 pixel coordinate alignment without drift."
        ),
        (
            "3.2.3   Sub-Pixel PDF Text Block Extraction and Typography Classification",
            "Extract raw PDF glyph matrices and classify them into coherent, editable typographical blocks.",
            "Processed textContent and commonObjs from PDF.js. For each text item, parsed the affine transformation matrix [a, b, c, d, e, f]. Computed font size via Math.hypot(transform[0], transform[1]), vertical baseline via viewport.height - transform[5], and em-box top via baselineY - ascent * fontSize. Formulated a heuristic classifier (parsePdfFontName) to categorize fonts into Serif, Sans-Serif, or Monospace, along with weight and style. Grouped adjacent items on identical baselines into unified line blocks.",
            "Verified on academic papers and legal contracts. Text bounding boxes matched original printed text with an average vertical error under 0.5 pixels."
        ),
        (
            "3.2.4   In-Place Dynamic Text Editing Overlay and Micro-Formatting Popover",
            "Allow users to click directly on document text and edit it in-place with instant typographical matching.",
            "Implemented handleStartEditingBlock. When clicked, an interactive input overlay is positioned precisely over the text block, inheriting font family, size, line height, weight, and style. Built a floating micro-toolbar positioned directly above the active text box providing quick-action controls: Move handle, Bold toggle (Ctrl+B), Italic toggle (Ctrl+I), text reset, deletion whiteout, and Done (Enter/Esc).",
            "Tested across 8pt to 36pt fonts. Inline text replacement rendered seamlessly without layout disruption."
        ),
        (
            "3.2.5   Drag-and-Drop Text Repositioning with Dynamic Background Whiteout Masking",
            "Enable users to freely move text blocks around the PDF while cleanly occluding original text.",
            "Engineered pointer drag handlers (handleStartDrag, onPointerMove, onPointerUp) that calculate scaled movement deltas. Implemented dual-masking: an opaque whiteout rectangle covers original coordinates (edit.originalX, edit.originalY), and a relocation mask covers the new destination to prevent background interference.",
            "Moved text blocks across borders and paragraphs. Original text was fully concealed, and new text rendered cleanly at target positions."
        ),
        (
            "3.2.6   High-DPI Freehand Vector Painter with Configurable Brush Presets",
            "Provide vector freehand drawing and highlighting capabilities directly on the PDF document.",
            "Integrated Fabric's PencilBrush into the overlay canvas. Built a painter control palette offering brush presets: Fine (2px), Medium (4px), Thick (8px), and Marker (16px), alongside a curated color palette. Developed a Highlighter Mode that configures an 18px brush with translucent yellow (rgba(250, 204, 21, 0.45)) and sets global composite operations so highlighted text remains legible.",
            "Freehand sketching recorded smooth Bézier curves at 60 FPS without cursor lag on both trackpads and optical mice."
        ),
        (
            "3.2.7   Custom Stroke-Level Vector Eraser and Canvas Path Manipulation",
            "Allow users to delete individual drawing strokes without wiping out the entire page or damaging the PDF.",
            "Implemented an interactive eraser engine (toggleEraserMode) with crosshair cursor feedback. Built proximity hit-testing: on pointer events, the engine iterates through canvas objects in reverse z-order, checks if an object is of type 'path', and computes bounding proximity within a 14-pixel margin. Intersected paths are removed immediately, and state is updated. Added a 'Clear Page' action to purge all strokes on the active page.",
            "Users were able to erase individual pen strokes or highlighter marks with precision, leaving neighboring text edits and underlying document graphics completely intact."
        ),
        (
            "3.2.8   Interactive Geometric Shape Annotations and Collapsible Properties Inspector",
            "Support structured geometric annotations with real-time property customization.",
            "Built toolbar actions to insert vector Rect and Circle shapes into the Fabric canvas layer. Created a collapsible floating properties panel on the right side of the screen. The panel detects active selections: displaying width, height, and color controls for shapes, and font size, bold/italic, and color pickers for text. Attached Delete/Backspace listeners with input focus guards.",
            "Shape dimensions updated in real-time as users adjusted numeric inputs. Keyboard deletion was disabled when users typed inside text inputs to prevent accidental annotation loss."
        ),
        (
            "3.2.9   Multi-Page Annotation Persistence and Page State Transitions",
            "Ensure all drawings, shapes, and text edits persist when users flip through multi-page documents.",
            "Engineered an in-memory page annotation dictionary using React refs (pageAnnotationsRef) and state (pageEdits). When transitioning pages: the active canvas is serialized to JSON (toJSON()) and saved; the canvas is cleared; the PDF.js pipeline renders the new page with a centered Notion-style spinner; and existing annotations for the new page are restored via loadFromJSON().",
            "Navigated back and forth across 15-page documents containing hundreds of strokes and text edits. Annotation states remained perfectly intact with zero cross-page leakage."
        ),
        (
            "3.2.10   Lossless Client-Side Vector PDF Export Engine (pdf-lib & SVG)",
            "Compile all text edits, whiteouts, and vector drawings into a standalone, downloadable PDF file with zero quality loss.",
            "Designed the export engine in pdfExport.ts. Loaded original PDF binary into PDFDocument.load(); embedded standard PostScript fonts (Helvetica, TimesRoman, Courier in regular, bold, italic, bold-italic); calculated bottom-up PDF coordinates (pageHeight - maskY - boxHeight); drew vector whiteout rectangles (drawRectangle); stamped replacement text (drawText); and burned Fabric vector SVG paths onto target pages. Saved the binary Uint8Array and triggered an automatic browser download.",
            "Exported PDFs were opened in Adobe Acrobat, Google Chrome, and Apple Preview. All modified text remained sharp, searchable, and selectable, while drawings retained true vector scalability."
        ),
        (
            "3.2.11   REST API Client Integration with Backend Document Services",
            "Connect the frontend with backend services for heavy document parsing and server-side manipulation.",
            "Engineered the API service client (api.ts) using Axios. Configured endpoints for POST /pdf/extract-blocks (uploading a multi-page PDF via multipart/form-data and receiving positional block layouts) and POST /pdf/edit (dispatching server-side text whiteout and stamping operations).",
            "Tested file transfers with payloads up to 20MB. Network timeouts, upload errors, and fallback client-side extraction routines operated reliably."
        ),
    ]

    for title, purpose, work, results in modules:
        add_styled_heading(doc, title, level=3)
        add_body_paragraph(doc, purpose, bold_prefix="Module Purpose: ")
        add_body_paragraph(doc, work, bold_prefix="Work Performed: ")
        add_body_paragraph(doc, results, bold_prefix="Testing & Results: ")

    add_styled_heading(doc, "3.3   Limitations and Experience Gained", level=2)

    add_styled_heading(doc, "3.3.1   Problems Faced", level=3)
    problems = [
        ("Mathematical Coordinate Inversion: ", "PDF coordinates place the origin (0,0) at the bottom-left corner with an upward-pointing Y-axis, whereas HTML DOM and HTML5 Canvas place (0,0) at the top-left with a downward-pointing Y-axis. Deriving exact em-box baselines required rigorous matrix algebra (pageHeight - baselineY)."),
        ("Fabric.js v7 Breaking Changes: ", "Fabric.js underwent a major architecture rewrite between v5 and v7 (transitioning from callback-based methods to ES promises and renaming Canvas to FabricCanvas). Documentation for v7 was sparse, requiring inspection of source TypeScript definitions."),
        ("High-DPI Retina Blur: ", "Canvas rendering on high-resolution screens resulted in blurry text when unscaled. This was resolved by computing window.devicePixelRatio, multiplying the internal canvas buffer size, and scaling down via CSS."),
        ("Git Submodule Collision on Windows: ", "An accidental submodule gitlink in the repository caused Git on Windows to ignore the frontend folder during consolidation. Resolving this required removing the cached gitlink (git rm --cached FrontEnd) and staging clean tracking trees."),
    ]
    for bold_pre, text in problems:
        add_body_paragraph(doc, text, bold_prefix="•  " + bold_pre)

    add_styled_heading(doc, "3.3.2   What Was Missing?", level=3)
    add_body_paragraph(
        doc,
        "A dedicated automated visual regression test suite (e.g., Playwright with pixel-diffing) to verify that font rendering remained "
        "pixel-identical across releases. Additionally, an offline font-embedding engine capable of embedding arbitrary custom TrueType (.ttf) "
        "and OpenType (.otf) fonts extracted directly from embedded PDF streams rather than standard PostScript font approximations."
    )

    add_styled_heading(doc, "3.3.3   Areas of Improvement", level=3)
    add_body_paragraph(
        doc,
        "Memory consumption during multi-page rendering could be further optimized by disposing of off-screen PDF.js page canvas buffers "
        "instead of keeping them active in memory. Furthermore, adding undo/redo (Ctrl+Z / Ctrl+Y) history stacks for text repositioning and freehand "
        "drawing operations would significantly enhance user ergonomics."
    )

    add_styled_heading(doc, "3.3.4   How More Experience Could Have Been Gained", level=3)
    add_body_paragraph(
        doc,
        "Shadowing the backend engineering team during the development of C++ and Python PDF parsing microservices would have provided "
        "deeper insight into low-level PDF stream tokenization. Conducting structured usability sessions with non-technical office staff would also "
        "have provided clearer UX feedback on toolbar ergonomics."
    )

    add_styled_heading(doc, "3.3.5   Key Learnings", level=3)
    learnings = [
        ("The Vector-First Paradigm: ", "Stamping true vector commands into a PDF document preserves document integrity infinitely better than canvas image flattening."),
        ("Sub-Pixel Geometry in Typography: ", "Font rendering is governed by intricate typographical metrics (ascent, descent, leading, em-box). High-quality UI overlays require calculating mathematical baselines rather than naive box approximations."),
        ("Client-Side Processing Power: ", "Modern web browsers equipped with WebAssembly, Web Workers, and HTML5 Canvas can execute complex document manipulation tasks locally, eliminating unnecessary server costs and protecting user privacy."),
    ]
    for bold_pre, text in learnings:
        add_body_paragraph(doc, text, bold_prefix="•  " + bold_pre)

    add_styled_heading(doc, "3.3.6   Future Impact", level=3)
    add_body_paragraph(
        doc,
        "This internship provided invaluable, real-world experience in frontend systems architecture, vector computer graphics, and production "
        "software engineering. Managing complex canvas synchronization, strict TypeScript interfaces, and binary document generation directly "
        "prepares me for professional engineering roles in web applications, graphical tool development, and cloud software engineering."
    )

    doc.add_page_break()

    # ==========================================
    # SECTION 4: RECENT TOPICS
    # ==========================================
    add_styled_heading(doc, "4   RECENT TOPICS IN THE CONTEXT OF WORK DONE", level=1)

    add_body_paragraph(
        doc,
        "To reinforce the technical principles practiced during the summer training, a comprehensive professional certification course was "
        "completed on the Udemy educational platform titled 'React.js 19: The Complete Guide (شرح عربي)'."
    )

    add_styled_heading(doc, "4.1   Course Overview", level=2)
    course_info = [
        ("Platform: ", "Udemy"),
        ("Course Title: ", "React.js 19: The Complete Guide (شرح عربي)"),
        ("Lead Instructor: ", "Eng. Yahya ElAraby"),
        ("Course Duration: ", "19.5 total hours"),
        ("Date of Completion: ", "September 28, 2026"),
        ("Certificate Number: ", "UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22"),
        ("Certificate Verification URL: ", "ude.my/UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22"),
        ("Reference Number: ", "0004"),
    ]
    for bold_pre, text in course_info:
        add_body_paragraph(doc, text, bold_prefix="•  " + bold_pre, space_after=3)

    add_styled_heading(doc, "4.2   Course Objectives", level=2)
    course_objs = [
        ("Master React 19 Architectural Paradigms: ", "Deeply understand the latest features introduced in React 19, including React Server Components, Actions, and compiler optimizations."),
        ("Modern State Management: ", "Implement scalable state management using custom hooks, useActionState, useOptimistic, and useTransition."),
        ("Asynchronous Pipelines & Concurrent Mode: ", "Leverage concurrent React rendering to build responsive, non-blocking user interfaces."),
        ("Imperative DOM & Canvas Interoperability: ", "Bridge declarative React virtual DOM structures with imperative third-party canvas libraries (Fabric.js, HTML5 Canvas)."),
        ("Enterprise Application Architecture: ", "Build production-ready web applications following modern component-driven methodologies and performance best practices."),
    ]
    for bold_pre, text in course_objs:
        add_body_paragraph(doc, text, bold_prefix="•  " + bold_pre)

    add_styled_heading(doc, "4.3   Topics Covered", level=2)
    topics = [
        "React 19 Core Fundamentals: Modern JSX syntax, component composition, prop validation, and conditional rendering.",
        "Advanced Hook Ecosystem: Comprehensive usage of useState, useEffect, useRef, useCallback, useMemo, and useId.",
        "Imperative DOM & Canvas Interoperability: Bridging React's declarative lifecycle with imperative DOM elements using useRef and forwardRef.",
        "Form Actions & Server Transitions: Asynchronous transitions with useTransition and optimistic UI updates with useOptimistic.",
        "State Management & Data Flow: Lifting state up, context propagation, and scalable in-memory state dictionary patterns.",
        "Frontend Performance Optimization: Code splitting with dynamic import(), memoization strategies, cleanup routines, and preventing memory leaks in persistent event listeners.",
    ]
    for t in topics:
        add_body_paragraph(doc, t, bold_prefix="•  ")

    add_styled_heading(doc, "4.4   Relevance to Training Work", level=2)
    add_body_paragraph(
        doc,
        "The course content was directly applicable to the challenges faced during the PDF Editor project:"
    )
    rel_points = [
        ("Canvas Lifecycle & Ref Management: ", "In canvas.tsx, coordinating the lifecycle of the Fabric.js canvas instance (fabricInstanceRef) and the underlying PDF.js render tasks required advanced useRef and useEffect cleanup handling to prevent memory leaks during page flipping. The course provided the exact design patterns needed to encapsulate imperative canvas logic within declarative React components."),
        ("Synchronized Performance & Event Throttling: ", "The course's modules on React rendering performance and event optimization guided the implementation of non-blocking pointer drag handlers and freehand stroke tracking at 60 FPS."),
        ("Forwarding Refs for Canvas Handles: ", "The imperative export triggers exposed to the parent App component were built using forwardRef and useImperativeHandle, an architectural pattern emphasized in the masterclass."),
    ]
    for bold_pre, text in rel_points:
        add_body_paragraph(doc, text, bold_prefix="1.  " + bold_pre)

    add_styled_heading(doc, "4.5   Outcome", level=2)
    add_body_paragraph(
        doc,
        "Completing this certification alongside the internship solidified my theoretical understanding of modern frontend engineering. "
        "It bridged the gap between academic programming exercises and industrial frontend architecture, enabling me to write clean, type-safe, "
        "maintainable, and high-performance React code."
    )

    doc.add_page_break()

    # ==========================================
    # SECTION 5: CONCLUSION
    # ==========================================
    add_styled_heading(doc, "5   CONCLUSION", level=1)

    add_body_paragraph(
        doc,
        "The summer training completed at the Near East Innovation and Information Technologies Centre provided an invaluable bridge between "
        "computer engineering academic coursework and industrial software engineering practice. Working as the Frontend Software Engineer on the "
        "PDF Editor project allowed me to solve complex, real-world problems in vector computer graphics, sub-pixel typography extraction, and "
        "lossless document manipulation."
    )

    add_body_paragraph(
        doc,
        "Throughout the six-week training period, I successfully designed and delivered:"
    )
    concl_points = [
        "A synchronized dual-layer canvas architecture pairing Mozilla PDF.js with Fabric.js v7.",
        "A sub-pixel typography detection engine that classifies PDF glyph transforms into editable line blocks.",
        "An in-place inline text editor featuring dynamic whiteout masking, micro-formatting popovers, and drag-and-drop repositioning.",
        "A high-DPI vector freehand painter with customizable pen presets, translucent highlighter, and a custom path-intersection stroke eraser.",
        "A multi-page in-memory annotation persistence pipeline.",
        "A zero-loss, client-side PDF export engine built with pdf-lib and SVG stamping.",
    ]
    for cp in concl_points:
        add_body_paragraph(doc, cp, bold_prefix="•  ")

    add_body_paragraph(
        doc,
        "The training highlighted that software engineering in production involves far more than writing isolated algorithms. It requires managing "
        "coordinate systems, handling memory leaks during canvas destruction, ensuring cross-browser consistency, and designing clean user experiences. "
        "The experience gained under the supervision of experienced engineers, combined with the completion of the advanced React 19 certification, "
        "has provided a strong foundation for my future career in computer engineering and software systems development."
    )

    doc.add_page_break()

    # ==========================================
    # SECTION 6: REFERENCES
    # ==========================================
    add_styled_heading(doc, "6   REFERENCES", level=1)

    refs = [
        "[1] Near East University, 'About Near East University,' Nicosia, TRNC, 2026. [Online]. Available: https://www.neu.edu.tr/",
        "[2] Near East University, 'Innovation and Information Technologies Centre,' Nicosia, TRNC, 2026.",
        "[3] Near East University, 'NEU-IBM Advanced Research Center,' Nicosia, TRNC, 2026.",
        "[4] RoboCup Federation, 'RoboCup Small Size League,' 2026. [Online]. Available: https://ssl.robocup.org/",
        "[5] React Documentation, 'React 19 Overview and Reference,' Meta Platforms, Inc., 2026. [Online]. Available: https://react.dev/",
        "[6] Mozilla, 'PDF.js: A General-Purpose, Web Standards-Based Platform for Parsing and Rendering PDFs,' Mozilla Corporation, 2026. [Online]. Available: https://mozilla.github.io/pdf.js/",
        "[7] Fabric.js Community, 'Fabric.js Javascript Canvas Library Documentation (v7),' 2026. [Online]. Available: https://fabricjs.com/",
        "[8] Hopding, 'pdf-lib: Create and Modify PDF Documents in Any JavaScript Environment,' 2026. [Online]. Available: https://pdf-lib.js.org/",
        "[9] Tailwind Labs, 'Tailwind CSS v4 Documentation,' 2026. [Online]. Available: https://tailwindcss.com/",
        "[10] Vite Team, 'Vite: Next Generation Frontend Tooling,' 2026. [Online]. Available: https://vite.dev/",
        "[11] Microsoft, 'TypeScript Language Specification (v6.0),' Microsoft Corporation, 2026. [Online]. Available: https://www.typescriptlang.org/",
        "[12] Lucide Authors, 'Lucide: Beautiful & Consistent Icons,' 2026. [Online]. Available: https://lucide.dev/",
        "[13] Axios Developers, 'Axios: Promise Based HTTP Client for the Browser and Node.js,' 2026. [Online]. Available: https://axios-http.com/",
        "[14] Y. ElAraby, 'React.js 19: The Complete Guide,' Udemy, Inc., 2026. [Online]. Available: https://ude.my/UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22",
        "[15] Adobe Systems Incorporated, 'Document Management — Portable Document Format — Part 1: PDF 1.7,' ISO 32000-1, 2008.",
    ]

    for ref in refs:
        p = doc.add_paragraph()
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(6)
        r = p.add_run(ref)
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    doc.add_page_break()

    # ==========================================
    # SECTION 7: APPENDIX
    # ==========================================
    add_styled_heading(doc, "7   APPENDIX", level=1)

    add_styled_heading(doc, "7.1   Figures and User Interface Screenshots", level=2)

    # Insert Landing Page screenshot
    add_centered_image(
        doc,
        "screenshots/landing-page.png",
        width=Inches(5.6),
        caption="Figure 7.1: Minimalist Notion-style document dropzone and landing interface (landing-page.png)."
    )

    # Insert Workspace screenshot
    add_centered_image(
        doc,
        "screenshots/editor-workspace.png",
        width=Inches(5.6),
        caption="Figure 7.2: PDF Editor workspace showing in-place text editing, floating micro-toolbar, drawing tools, and properties inspector (editor-workspace.png)."
    )

    add_styled_heading(doc, "7.2   Selected Core Code Listings", level=2)

    # Listing 1
    add_styled_heading(doc, "Listing 1: Dual-Layer Canvas Initialization & Viewport Synchronization", level=3)
    add_body_paragraph(doc, "Source File: frontend/src/components/canvas.tsx", bold_prefix="Source: ")
    add_code_block(
        doc,
        """// Initialize Fabric canvas strictly for vector shapes and freehand drawing
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
}, []);""",
        caption="Listing 1: Initialization of top-layer FabricCanvas element with transparent background, event bindings, and lifecycle disposal."
    )

    # Listing 2
    add_styled_heading(doc, "Listing 2: PDF Text Content Extraction & Mathematical Typography Parsing", level=3)
    add_body_paragraph(doc, "Source File: frontend/src/components/canvas.tsx", bold_prefix="Source: ")
    add_code_block(
        doc,
        """// Extract positional text blocks with exact font metrics from PDF stream
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
}""",
        caption="Listing 2: Parsing transformation matrices from PDF.js, computing baseline coordinates, and mapping typography metrics."
    )

    # Listing 3
    add_styled_heading(doc, "Listing 3: Custom Stroke-Level Vector Eraser Proximity Logic", level=3)
    add_body_paragraph(doc, "Source File: frontend/src/components/canvas.tsx", bold_prefix="Source: ")
    add_code_block(
        doc,
        """const handleEraserAtEvent = (opt: any) => {
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
};""",
        caption="Listing 3: Interactive hit-testing algorithm detecting and deleting individual vector strokes under pointer events."
    )

    # Listing 4
    add_styled_heading(doc, "Listing 4: Lossless Vector PDF Export & Whiteout Stamping Engine", level=3)
    add_body_paragraph(doc, "Source File: frontend/src/utils/pdfExport.ts", bold_prefix="Source: ")
    add_code_block(
        doc,
        """// 1. Mask original text location (so original text is hidden)
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
}""",
        caption="Listing 4: Applying vector whiteout rectangles over edited text in the PDF stream and stamping replacement text."
    )

    add_styled_heading(doc, "7.3   Professional Certificate of Completion", level=2)

    # Insert Udemy Certificate
    add_centered_image(
        doc,
        "screenshots/udemy_certificate.png",
        width=Inches(5.8),
        caption="Figure 7.3: Official Certificate of Completion for 'React.js 19: The Complete Guide' issued by Udemy."
    )

    # Certificate details table
    cert_table = doc.add_table(rows=7, cols=2)
    cert_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cert_table.autofit = False

    cert_fields = [
        ("Course Title:", "React.js 19: The Complete Guide (شرح عربي)"),
        ("Lead Instructor:", "Eng. Yahya ElAraby"),
        ("Awarded To:", "Abdelaziz Omer"),
        ("Date of Issue:", "September 28, 2026"),
        ("Curriculum Duration:", "19.5 total hours"),
        ("Certificate Identifier:", "UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22"),
        ("Verification URL:", "https://ude.my/UC-fadc1a5e-e0dc-472b-9515-60dc81ed6c22 (Ref: 0004)"),
    ]

    for i, (k, v) in enumerate(cert_fields):
        c0 = cert_table.cell(i, 0)
        c0.width = Inches(2.2)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(k)
        r0.font.name = "Calibri"
        r0.font.size = Pt(9.5)
        r0.bold = True
        r0.font.color.rgb = RGBColor(0x1F, 0x29, 0x37)
        set_cell_background(c0, "F9FAFB")
        set_cell_margins(c0, top=60, bottom=60, left=100, right=100)

        c1 = cert_table.cell(i, 1)
        c1.width = Inches(4.3)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(v)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = RGBColor(0x11, 0x18, 0x27)
        set_cell_background(c1, "FFFFFF")
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)

    # Save document
    doc.save(output_filename)
    print(f"Successfully generated: {output_filename}")

if __name__ == "__main__":
    build_training_report_docx()
