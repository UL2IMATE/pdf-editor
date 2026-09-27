import {
  PDFDocument,
  rgb,
  StandardFonts,
} from 'pdf-lib'

export interface TextEdit {
  pageNumber: number
  x: number
  y: number
  width: number
  height: number
    fontSize?: number

  newText: string
  
}

export async function applyTextEdits(
  buffer: Buffer,
  edits: TextEdit[],
): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(buffer)

  const font = await pdf.embedFont(
    StandardFonts.Helvetica,
  )

  for (const edit of edits) {
    if (
      edit.pageNumber < 1 ||
      edit.pageNumber > pdf.getPageCount()
    ) {
      throw new Error(
        `Invalid page number: ${edit.pageNumber}`,
      )
    }

    if (edit.width <= 0 || edit.height <= 0) {
      throw new Error(
        'Edit width and height must be greater than zero.',
      )
    }

    const page = pdf.getPage(
      edit.pageNumber - 1,
    )
const pageWidth = page.getWidth()
const pageHeight = page.getHeight()

if (
  edit.x >= pageWidth ||
  edit.y >= pageHeight
) {
  throw new Error(
    `Edit coordinates are outside page ${edit.pageNumber}.`,
  )
}

if (
  edit.x + edit.width > pageWidth ||
  edit.y + edit.height > pageHeight
) {
  throw new Error(
    `Edit area exceeds the boundaries of page ${edit.pageNumber}.`,
  )
}
    const pdfY =
      page.getHeight() -
      edit.y -
      edit.height

    // Small padding so replacement text does not
    // touch the edges of the original text box.
    const padding = Math.min(
      edit.height * 0.1,
      2,
    )

    const availableWidth =
      edit.width - padding * 2

    const availableHeight =
      edit.height - padding * 2

    /*
     * Start with a font size based on the
     * original text height.
     */
    const fontSize =
  edit.fontSize ??
  Math.max(availableHeight * 0.9, 8)

    /*
     * Cover the original text.
     *
     * This is visual replacement only and should
     * NOT be considered secure redaction.
     */
    page.drawRectangle({
      x: edit.x,
      y: pdfY,
      width: edit.width,
      height: edit.height,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    })

    /*
     * pdf-lib's drawText y-coordinate represents
     * the text baseline, so move upward slightly
     * from the bottom of the text box.
     */
    const textHeight =
      font.heightAtSize(fontSize)

    const textY =
      pdfY +
      (availableHeight - textHeight) / 2 +
      padding

    page.drawText(edit.newText, {
      x: edit.x + padding,
      y: textY,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    })
  }

  return pdf.save()
}