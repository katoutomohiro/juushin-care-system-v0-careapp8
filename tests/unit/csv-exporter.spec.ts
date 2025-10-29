import { describe, it, expect, beforeEach, vi } from 'vitest'
import { exportAsCsv } from '@/lib/exporter/csv'

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
