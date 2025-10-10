"use client"

import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { JournalForm } from "../components/JournalForm"
import type { JournalEntry } from "../schemas/journal"

describe("JournalForm", () => {
  it("正常な入力で送信が成功する", async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined)

    render(<JournalForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText("タイトル"), "テストエントリー")
    await user.click(screen.getByLabelText("カテゴリーを選択"))
    await user.click(screen.getByText("観察"))
    await user.type(screen.getByLabelText("内容"), "これはテスト内容です")

    await user.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "テストエントリー",
          category: "observation",
          content: "これはテスト内容です",
        }),
      )
    })
  })

  it("バリデーションエラーを表示する", async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn()

    render(<JournalForm onSubmit={mockOnSubmit} />)

    await user.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => {
      expect(screen.getByText("タイトルは必須です")).toBeInTheDocument()
      expect(screen.getByText("内容は必須です")).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it("送信失敗時に入力内容を保持する", async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockRejectedValue(new Error("保存失敗"))

    render(<JournalForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText("タイトル"), "エラーテスト")
    await user.type(screen.getByLabelText("内容"), "エラー時の内容")

    await user.click(screen.getByRole("button", { name: "保存" }))

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalled()
    })

    expect(screen.getByDisplayValue("エラーテスト")).toBeInTheDocument()
    expect(screen.getByDisplayValue("エラー時の内容")).toBeInTheDocument()
  })

  it("二重送信を防止する", async () => {
    const user = userEvent.setup()
    const mockOnSubmit = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    render(<JournalForm onSubmit={mockOnSubmit} />)

    await user.type(screen.getByLabelText("タイトル"), "テスト")
    await user.type(screen.getByLabelText("内容"), "テスト内容")

    const submitButton = screen.getByRole("button", { name: "保存" })
    await user.click(submitButton)
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1)
    })
  })

  it("初期データを正しく表示する", () => {
    const initialData: Partial<JournalEntry> = {
      title: "既存エントリー",
      content: "既存の内容",
      category: "care",
    }

    render(<JournalForm onSubmit={vi.fn()} initialData={initialData} />)

    expect(screen.getByDisplayValue("既存エントリー")).toBeInTheDocument()
    expect(screen.getByDisplayValue("既存の内容")).toBeInTheDocument()
  })
})
