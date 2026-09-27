import fs from 'node:fs/promises'
import path from 'node:path'
import { applyTextEdits } from '../src/services/pdfEdit.service.js'

async function main() {
  const inputPath = path.resolve('test-files/sample.pdf')
  const outputPath = path.resolve('test-files/sample-edited.pdf')

  const inputBuffer = await fs.readFile(inputPath)

  const editedPdf = await applyTextEdits(inputBuffer, [
    {
      pageNumber: 1,
      x: 100,
      y: 100,
      width: 150,
      height: 20,
      newText: 'Edited Text',
    },
  ])

  await fs.writeFile(outputPath, editedPdf)

  console.log('PDF editing test completed.')
  console.log(`Output: ${outputPath}`)
}

main().catch((error) => {
  console.error('PDF editing test failed:', error)
  process.exit(1)
})