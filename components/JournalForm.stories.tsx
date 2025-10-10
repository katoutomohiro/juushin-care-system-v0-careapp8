import type { Meta, StoryObj } from "@storybook/react"
import { JournalForm } from "./JournalForm"
import { fn } from "@storybook/test"

const meta: Meta<typeof JournalForm> = {
  title: "Forms/JournalForm",
  component: JournalForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {},
}

export const WithInitialData: Story = {
  args: {
    initialData: {
      title: "朝の観察記録",
      content: "患者様の状態は安定しています。バイタルサインも正常範囲内です。",
      category: "observation",
    },
  },
}

export const WithError: Story = {
  args: {
    onSubmit: async () => {
      throw new Error("保存に失敗しました")
    },
  },
}
