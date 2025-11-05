"use client"

import { Input } from "@/components/ui/input"

interface UserNameInputProps {
  id: string
  value: string
  onChange: (value: string) => void
  suggestions: string[]
  placeholder?: string
}

export const UserNameInput = ({ id, value, onChange, suggestions, placeholder }: UserNameInputProps) => {
  const listId = `${id}-suggestions`

  return (
    <>
      <Input
        id={id}
        list={listId}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {suggestions.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </>
  )
}
