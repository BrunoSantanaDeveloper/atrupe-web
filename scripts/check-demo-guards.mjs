// Checagem da fronteira do mock (plano de implantação dos planos, 5.4).
//
// Toda action exportada de um arquivo de exemplo de src/actions (os que têm
// a marca PROVISÓRIO e 'use server') precisa começar pela guarda da flag de
// demonstração: `if (!DEMO_DATA) ...`. Server action é endereçável por id
// mesmo sem tela, então uma action sem guarda leria ou gravaria os dados de
// exemplo em produção. Também recusa outras formas de export nesses arquivos
// (export default, reexport), que a checagem não consegue conferir.
//
//   node scripts/check-demo-guards.mjs
//
// Sai com código 1 e a lista do que falta quando alguma action está sem a
// guarda. Roda no workflow da fronteira (.github/workflows/fronteira.yml).
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('typescript')

const ACTIONS_DIR = path.join(process.cwd(), 'src', 'actions')
const MARK = /PROVIS[ÓO]RIO/
const GUARD = /^if\s*\(\s*!DEMO_DATA\s*\)/

const hasExport = (node) =>
  (ts.getModifiers?.(node) ?? node.modifiers ?? []).some(
    (m) => m.kind === ts.SyntaxKind.ExportKeyword,
  )

const problems = []
let files = 0
let actions = 0

for (const name of fs.readdirSync(ACTIONS_DIR)) {
  if (!name.endsWith('.ts')) continue
  const file = path.join(ACTIONS_DIR, name)
  const text = fs.readFileSync(file, 'utf8')
  const useServer = /^\s*['"]use server['"]/.test(text)
  if (!useServer || !MARK.test(text)) continue
  files++

  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  const check = (exportName, fn) => {
    actions++
    const body = fn.body
    if (!body || !ts.isBlock(body)) {
      problems.push(
        `${name}: ${exportName} tem corpo de expressão, sem a guarda`,
      )
      return
    }
    const first = body.statements[0]
    if (!first || !GUARD.test(first.getText(source))) {
      problems.push(`${name}: ${exportName} não começa com if (!DEMO_DATA)`)
    }
  }

  source.forEachChild((node) => {
    if (ts.isFunctionDeclaration(node) && hasExport(node)) {
      check(node.name ? node.name.text : '(default)', node)
    } else if (ts.isVariableStatement(node) && hasExport(node)) {
      for (const declaration of node.declarationList.declarations) {
        const init = declaration.initializer
        if (
          init &&
          (ts.isArrowFunction(init) || ts.isFunctionExpression(init))
        ) {
          check(declaration.name.getText(source), init)
        } else {
          problems.push(
            `${name}: export ${declaration.name.getText(source)} não é função`,
          )
        }
      }
    } else if (ts.isExportDeclaration(node) || ts.isExportAssignment(node)) {
      problems.push(
        `${name}: export que a checagem não confere (${node.getText(source).slice(0, 60)})`,
      )
    }
  })
}

if (problems.length) {
  console.error(
    `Fronteira do mock: ${problems.length} problema(s) em ${files} arquivo(s) de exemplo`,
  )
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

if (files === 0) {
  console.log('Fronteira do mock: nenhum arquivo de exemplo em src/actions')
} else {
  console.log(
    `Fronteira do mock: ${actions} actions em ${files} arquivos de exemplo, todas com a guarda da flag`,
  )
}
