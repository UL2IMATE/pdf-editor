import type { Request, Response, NextFunction } from 'express'

export function validateEdits(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.body.edits) {
    res.status(400).json({
      success: false,
      message: 'No text edits were provided.',
    })
    return
  }

  let edits: unknown

  try {
    edits = JSON.parse(req.body.edits)
  } catch {
    res.status(400).json({
      success: false,
      message: 'The edits field must contain valid JSON.',
    })
    return
  }

  if (!Array.isArray(edits)) {
    res.status(400).json({
      success: false,
      message: 'Edits must be an array.',
    })
    return
  }

  if (edits.length === 0) {
    res.status(400).json({
      success: false,
      message: 'At least one text edit is required.',
    })
    return
  }

  if (edits.length > 100) {
    res.status(400).json({
      success: false,
      message: 'A maximum of 100 edits can be submitted at once.',
    })
    return
  }

  for (const edit of edits) {
    if (!edit || typeof edit !== 'object') {
      res.status(400).json({
        success: false,
        message: 'Each edit must be an object.',
      })
      return
    }

    const item = edit as Record<string, unknown>

    const numericFields = [
      'pageNumber',
      'x',
      'y',
      'width',
      'height',
    ]

    for (const field of numericFields) {
      if (
        typeof item[field] !== 'number' ||
        !Number.isFinite(item[field] as number)
      ) {
        res.status(400).json({
          success: false,
          message: `${field} must be a valid number.`,
        })
        return
      }
    }

    if (typeof item.newText !== 'string') {
      res.status(400).json({
        success: false,
        message: 'newText must be a string.',
      })
      return
    }

    if (!item.newText.trim()) {
      res.status(400).json({
        success: false,
        message: 'newText cannot be empty.',
      })
      return
    }

    if (
      (item.pageNumber as number) < 1
    ) {
      res.status(400).json({
        success: false,
        message: 'Page number must be at least 1.',
      })
      return
    }

    if (
      (item.x as number) < 0 ||
      (item.y as number) < 0
    ) {
      res.status(400).json({
        success: false,
        message: 'x and y coordinates cannot be negative.',
      })
      return
    }

    if (
      (item.width as number) <= 0 ||
      (item.height as number) <= 0
    ) {
      res.status(400).json({
        success: false,
        message:
          'Edit width and height must be greater than zero.',
      })
      return
    }

    if (
      typeof item.fontSize !== 'undefined' &&
      (
        typeof item.fontSize !== 'number' ||
        !Number.isFinite(item.fontSize) ||
        item.fontSize <= 0
      )
    ) {
      res.status(400).json({
        success: false,
        message: 'fontSize must be a positive number.',
      })
      return
    }
  }

  req.body.parsedEdits = edits

  next()
}