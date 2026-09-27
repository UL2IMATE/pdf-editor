import { PDFDocument } from 'pdf-lib'

export interface PdfInfo {
  pageCount: number
  fileSize: number
}

export async function getPdfInfo(buffer: Buffer): Promise<PdfInfo> {
  const pdf = await PDFDocument.load(buffer)

  return {
    pageCount: pdf.getPageCount(),
    fileSize: buffer.length,
  }
}
