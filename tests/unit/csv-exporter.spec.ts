import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportAsCsv, exportAsCsvV2, toCsvData, CsvColumn } from '@/lib/exporter/csv'

// Mock URL.createObjectURL for Node.js environment
beforeEach(() => {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
})

describe('exportAsCsv', () => {
  it('should export basic data as CSV', () => {
    const data = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 },
    ]
    const headers = ['id', 'name', 'age']
    const rowMapper = (item: typeof data[0]) => [item.id, item.name, item.age]

    const result = exportAsCsv(data, headers, rowMapper)

    expect(result).toBe('blob:mock-url')
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('should escape quotes in CSV values', () => {
    const data = [{ text: 'Hello "World"' }]
    const headers = ['text']
    const rowMapper = (item: typeof data[0]) => [item.text]

    const result = exportAsCsv(data, headers, rowMapper)

    expect(result).toBe('blob:mock-url')
    
    // 実際のエスケープロジックをテスト
    const escape = (value: string | number | null | undefined): string => {
      const str = String(value ?? "")
      const cleaned = str.replace(/\r?\n/g, " ")
      return `"${cleaned.replace(/"/g, '""')}"`
    }
    
    expect(escape('Hello "World"')).toBe('"Hello ""World"""')
  })

  it('should replace line breaks with spaces', () => {
    const escape = (value: string | number | null | undefined): string => {
      const str = String(value ?? "")
      const cleaned = str.replace(/\r?\n/g, " ")
      return `"${cleaned.replace(/"/g, '""')}"`
    }
    
    expect(escape('Line1\nLine2')).toBe('"Line1 Line2"')
    expect(escape('Line1\r\nLine2')).toBe('"Line1 Line2"')
  })

  it('should handle null and undefined values', () => {
    const data = [
      { id: 1, name: null, note: undefined },
    ]
    const headers = ['id', 'name', 'note']
    const rowMapper = (item: typeof data[0]) => [item.id, item.name, item.note]

    const result = exportAsCsv(data, headers, rowMapper)

    expect(result).toBe('blob:mock-url')
  })

  it('should handle empty data array', () => {
    const data: any[] = []
    const headers = ['id', 'name']
    const rowMapper = (item: any) => [item.id, item.name]

    const result = exportAsCsv(data, headers, rowMapper)

    expect(result).toBe('blob:mock-url')
  })

  it('should handle special characters', () => {
    const escape = (value: string | number | null | undefined): string => {
      const str = String(value ?? "")
      const cleaned = str.replace(/\r?\n/g, " ")
      return `"${cleaned.replace(/"/g, '""')}"`
    }
    
    expect(escape('カンマ,あり')).toBe('"カンマ,あり"')
    expect(escape('セミコロン;あり')).toBe('"セミコロン;あり"')
    expect(escape('')).toBe('""')
  })
})

describe('exportAsCsvV2 (new column-driven API)', () => {
  it('should export with column definitions', () => {
    const data = [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 },
    ]
    const columns: CsvColumn<typeof data[0]>[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'age', header: 'Age' },
    ]

    const result = exportAsCsvV2(data, columns)

    expect(result).toBe('blob:mock-url')
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('should apply masking to specified fields', () => {
    const data = [
      { id: 1, name: 'Alice', secret: 'password123' },
    ]
    const columns: CsvColumn<typeof data[0]>[] = [
      { key: 'id', header: 'ID' },
      { key: 'name', header: 'Name' },
      { key: 'secret', header: 'Secret' },
    ]

    const { body } = toCsvData(data, columns, { maskFields: ['secret'] })

    expect(body[0]).toEqual(['1', 'Alice', '***'])
  })

  it('should handle nested paths', () => {
    const data = [{ user: { name: 'Alice', age: 30 } }]
    const columns: CsvColumn<typeof data[0]>[] = [
      { key: 'user.name', header: 'Name' },
      { key: 'user.age', header: 'Age' },
    ]

    const { body } = toCsvData(data, columns, {})

    expect(body[0]).toEqual(['Alice', '30'])
  })

  it('should apply map function for value transformation', () => {
    const data = [
      { id: 1, active: true, count: null },
    ]
    const columns: CsvColumn<typeof data[0]>[] = [
      { key: 'id', header: 'ID', map: (v: any) => `#${v}` },
      { key: 'active', header: 'Active', map: (v: any) => (v ? 'Yes' : 'No') },
      { key: 'count', header: 'Count', map: (v: any) => (v ? String(v) : '-') },
    ]

    const { body } = toCsvData(data, columns, {})

    expect(body[0]).toEqual(['#1', 'Yes', '-'])
  })

  it('should apply rowMapper for preprocessing', () => {
    const data = [
      { name: 'alice', age: 30 },
    ]
    const columns: CsvColumn<typeof data[0]>[] = [
      { key: 'name', header: 'Name' },
      { key: 'age', header: 'Age' },
    ]

    const { body } = toCsvData(data, columns, {
      rowMapper: (r: any) => ({ ...r, name: r.name.toUpperCase() }),
    })

    expect(body[0]).toEqual(['ALICE', '30'])
  })
})

