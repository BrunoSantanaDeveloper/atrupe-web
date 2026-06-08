const EXCEL_CSV_DELIMITER = ';'
const UTF8_BOM = '\ufeff'

function escapeCsvCell(value: string, delimiter = EXCEL_CSV_DELIMITER) {
  const normalizedValue = value ?? ''

  if (
    normalizedValue.includes(delimiter) ||
    normalizedValue.includes('"') ||
    normalizedValue.includes('\n') ||
    normalizedValue.includes('\r')
  ) {
    return `"${normalizedValue.replace(/"/g, '""')}"`
  }

  return normalizedValue
}

function parseDelimitedLine(line: string, delimiter: string) {
  const cells: string[] = []
  let currentCell = ''
  let insideQuotes = false

  for (let index = 0; index < line.length; index++) {
    const char = line[index]
    const nextChar = line[index + 1]

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentCell += '"'
      index++
      continue
    }

    if (char === '"') {
      insideQuotes = !insideQuotes
      continue
    }

    if (char === delimiter && !insideQuotes) {
      cells.push(currentCell)
      currentCell = ''
      continue
    }

    currentCell += char
  }

  cells.push(currentCell)
  return cells
}

function convertDelimitedText(
  content: string,
  sourceDelimiter = ',',
  targetDelimiter = EXCEL_CSV_DELIMITER,
) {
  return content
    .trim()
    .split(/\r?\n/)
    .map((line) =>
      parseDelimitedLine(line, sourceDelimiter)
        .map((cell) => escapeCsvCell(cell, targetDelimiter))
        .join(targetDelimiter),
    )
    .join('\r\n')
}

export function downloadExcelCsvTemplate(
  csvContent: string,
  filename: string,
  sourceDelimiter = ',',
) {
  const excelCsvContent = `${UTF8_BOM}sep=${EXCEL_CSV_DELIMITER}\r\n${convertDelimitedText(
    csvContent,
    sourceDelimiter,
  )}`

  const blob = new Blob([excelCsvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
