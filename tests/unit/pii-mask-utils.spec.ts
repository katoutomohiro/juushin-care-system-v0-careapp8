import { describe, it, expect } from 'vitest'
import { 
  getDefaultMaskFields, 
  getMaskFieldsByCategory, 
  getAllMaskFields,
  mergeMaskFields 
} from '../../lib/pii-mask-utils'

describe('pii-mask-utils', () => {
  describe('getDefaultMaskFields', () => {
    it('returns default mask fields', () => {
      const fields = getDefaultMaskFields()
      expect(fields.length).toBeGreaterThan(0)
      expect(fields).toContain('note')
      expect(fields).toContain('memo')
    })
  })

  describe('getMaskFieldsByCategory', () => {
    it('returns freeText category fields', () => {
      const fields = getMaskFieldsByCategory('freeText')
      expect(fields).toContain('note')
      expect(fields).toContain('memo')
    })

    it('returns contact category fields', () => {
      const fields = getMaskFieldsByCategory('contact')
      expect(fields).toContain('familyContact')
    })

    it('returns medical category fields', () => {
      const fields = getMaskFieldsByCategory('medical')
      expect(fields.length).toBeGreaterThan(0)
    })
  })

  describe('getAllMaskFields', () => {
    it('returns all PII fields from all categories', () => {
      const fields = getAllMaskFields()
      expect(fields.length).toBeGreaterThan(0)
      // Should include fields from default and all categories
      expect(fields).toContain('note')
      expect(fields).toContain('familyContact')
    })

    it('de-duplicates fields', () => {
      const fields = getAllMaskFields()
      const uniqueFields = new Set(fields)
      expect(fields.length).toBe(uniqueFields.size)
    })
  })

  describe('mergeMaskFields', () => {
    it('merges custom fields with defaults', () => {
      const merged = mergeMaskFields(['customField'])
      expect(merged).toContain('note')
      expect(merged).toContain('customField')
    })

    it('de-duplicates merged fields', () => {
      const merged = mergeMaskFields(['note', 'memo', 'customField'])
      const uniqueFields = new Set(merged)
      expect(merged.length).toBe(uniqueFields.size)
    })

    it('returns defaults when no custom fields provided', () => {
      const merged = mergeMaskFields()
      const defaults = getDefaultMaskFields()
      expect(merged).toEqual(defaults)
    })

    it('handles empty array', () => {
      const merged = mergeMaskFields([])
      const defaults = getDefaultMaskFields()
      expect(merged).toEqual(defaults)
    })
  })
})
