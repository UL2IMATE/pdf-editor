import type { Request, Response, NextFunction } from 'express'
import { getPdfInfo } from '../services/pdf.service.js'
import { extractTextBlocks } from '../services/pdfText.service.js'
import { applyTextEdits, type TextEdit } from '../services/pdfEdit.service.js'

export async function uploadPdf(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No PDF file was uploaded.',
      })
      return
    }

    const info = await getPdfInfo(req.file.buffer)

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully.',
      file: {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        pageCount: info.pageCount,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function extractPdfText(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No PDF file was uploaded.',
      })
      return
    }

    const pages = await extractTextBlocks(req.file.buffer)

    res.status(200).json({
      success: true,
      pages,
    })
  } catch (error) {
    next(error)
  }
}

export async function editPdf(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: 'No PDF file was uploaded.',
      })
      return
    }

    const edits = req.body.parsedEdits as TextEdit[]

    const editedPdf = await applyTextEdits(
      req.file.buffer,
      edits,
    )

    res.setHeader(
      'Content-Type',
      'application/pdf',
    )

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="edited.pdf"',
    )

    res.status(200).send(
      Buffer.from(editedPdf),
    )
  } catch (error) {
    next(error)
  }
}
