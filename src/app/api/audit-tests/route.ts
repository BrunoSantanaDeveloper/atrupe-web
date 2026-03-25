import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const DATA_DIR = join(process.cwd(), 'data')
const DATA_FILE = join(DATA_DIR, 'audit-test-results.json')

async function loadData(): Promise<Record<string, unknown>> {
  try {
    const content = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function saveData(data: Record<string, unknown>): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  await writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET() {
  const data = await loadData()
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { id, state } = payload

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const data = await loadData()

    if (state && Object.keys(state).length > 0) {
      data[id] = state
    } else {
      delete data[id]
    }

    await saveData(data)
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
