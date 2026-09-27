import multer from 'multer'
import { env } from '../config/env.js'

const storage = multer.memoryStorage()

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  const isPdfMimeType = file.mimetype === 'application/pdf'
  const isPdfExtension = file.originalname
    .toLowerCase()
    .endsWith('.pdf')

  if (isPdfMimeType || isPdfExtension) {
    cb(null, true)
    return
  }

  cb(new Error('Only PDF files are allowed.'))
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSizeMb * 1024 * 1024,
  },
})

export const uploadPdf = (req: any, res: any, next: any) => {
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ])(req, res, (err: any) => {
    if (err) return next(err)
    if (req.files) {
      req.file = req.files['pdf']?.[0] || req.files['file']?.[0]
    }
    next()
  })
}