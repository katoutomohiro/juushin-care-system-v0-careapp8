import { promises as fs } from "fs"
import path from "path"

type RlsTableEntry = {
  table: string
  rls: boolean
  source: string
}

type RlsScanResult = {
  tables: RlsTableEntry[]
  missing_rls: string[]
}

const CREATE_TABLE_RE = /create table\s+(if not exists\s+)?public\.(\w+)/i
const ENABLE_RLS_RE = /alter table\s+public\.(\w+)\s+enable row level security/i

function normalizeTableName(name: string): string {
  return name.trim()
}

async function listMigrationFiles(migrationsDir: string): Promise<string[]> {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => path.join(migrationsDir, entry.name))
}

async function scanFile(
  filePath: string,
  tableMap: Map<string, RlsTableEntry>
): Promise<void> {
  const content = await fs.readFile(filePath, "utf8")
  const lines = content.split(/\r?\n/)
  const source = path.basename(filePath)

  for (const line of lines) {
    const createMatch = line.match(CREATE_TABLE_RE)
    if (createMatch?.[2]) {
      const table = normalizeTableName(createMatch[2])
      if (!tableMap.has(table)) {
        tableMap.set(table, { table, rls: false, source })
      }
    }

    const rlsMatch = line.match(ENABLE_RLS_RE)
    if (rlsMatch?.[1]) {
      const table = normalizeTableName(rlsMatch[1])
      const existing = tableMap.get(table)
      if (existing) {
        existing.rls = true
      } else {
        tableMap.set(table, { table, rls: true, source })
      }
    }
  }
}

export async function scanRlsMigrations(
  baseDir: string = process.cwd()
): Promise<RlsScanResult> {
  const migrationsDir = path.join(baseDir, "supabase", "migrations")
  const tableMap = new Map<string, RlsTableEntry>()

  const files = await listMigrationFiles(migrationsDir)
  for (const filePath of files) {
    await scanFile(filePath, tableMap)
  }

  const tables = Array.from(tableMap.values()).sort((a, b) =>
    a.table.localeCompare(b.table)
  )
  const missing_rls = tables
    .filter((entry) => !entry.rls)
    .map((entry) => entry.table)

  return { tables, missing_rls }
}

if (require.main === module) {
  scanRlsMigrations()
    .then((result) => {
      process.stdout.write(JSON.stringify(result, null, 2))
    })
    .catch((error) => {
      process.stderr.write(
        JSON.stringify({ ok: false, error: String(error) }, null, 2)
      )
      process.exitCode = 1
    })
}
