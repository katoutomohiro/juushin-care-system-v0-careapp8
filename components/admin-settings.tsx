"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { DataStorageService } from "@/services/data-storage-service"

interface AdminSettingsProps {
  onUserNamesUpdate: (userNames: string[]) => void
  onAppTitleUpdate?: (title: string, subtitle: string) => void
}

export function AdminSettings({ onUserNamesUpdate, onAppTitleUpdate }: AdminSettingsProps) {
  const { toast } = useToast()
  const [userNames, setUserNames] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [tempUserNames, setTempUserNames] = useState<string[]>([])
  const [appTitle, setAppTitle] = useState("日常ケア記録システム")
  const [appSubtitle, setAppSubtitle] = useState("重症心身障害児者支援アプリ - PROJECT SOUL")
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [tempAppTitle, setTempAppTitle] = useState("")
  const [tempAppSubtitle, setTempAppSubtitle] = useState("")
  useEffect(() => {
    const savedUserNames = DataStorageService.getCustomUserNames()
    if (savedUserNames.length > 0) {
      setUserNames(savedUserNames)
      setTempUserNames([...savedUserNames])
    } else {
      // Initialize with default names A-X
      const defaultNames = Array.from({ length: 24 }, (_, i) => `利用者${String.fromCharCode(65 + i)}`)
      setUserNames(defaultNames)
      setTempUserNames([...defaultNames])
    }

    const savedAppTitle = localStorage.getItem("app-title")
    const savedAppSubtitle = localStorage.getItem("app-subtitle")
    if (savedAppTitle) {
      setAppTitle(savedAppTitle)
    }
    if (savedAppSubtitle) {
      setAppSubtitle(savedAppSubtitle)
    }
  }, [])

  const handleStartEditTitle = () => {
    setIsEditingTitle(true)
    setTempAppTitle(appTitle)
    setTempAppSubtitle(appSubtitle)
  }

  const handleCancelEditTitle = () => {
    setIsEditingTitle(false)
    setTempAppTitle("")
    setTempAppSubtitle("")
  }

  const handleSaveTitle = () => {
    try {
      const newTitle = tempAppTitle.trim() || "日常ケア記録システム"
      const newSubtitle = tempAppSubtitle.trim() || "重症心身障害児者支援アプリ - PROJECT SOUL"

      localStorage.setItem("app-title", newTitle)
      localStorage.setItem("app-subtitle", newSubtitle)

      setAppTitle(newTitle)
      setAppSubtitle(newSubtitle)
      setIsEditingTitle(false)

      if (onAppTitleUpdate) {
        onAppTitleUpdate(newTitle, newSubtitle)
      }

      toast({
        variant: "default",
        title: "保存完了",
        description: "アプリタイトルを更新しました",
      })
    } catch (error) {
      console.error("Failed to save app title:", error)
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "アプリタイトルの保存に失敗しました",
      })
    }
  }

  const handleResetTitle = () => {
    try {
      localStorage.removeItem("app-title")
      localStorage.removeItem("app-subtitle")

      const defaultTitle = "日常ケア記録システム"
      const defaultSubtitle = "重症心身障害児者支援アプリ - PROJECT SOUL"

      setAppTitle(defaultTitle)
      setAppSubtitle(defaultSubtitle)
      setIsEditingTitle(false)

      if (onAppTitleUpdate) {
        onAppTitleUpdate(defaultTitle, defaultSubtitle)
      }

      toast({
        variant: "default",
        title: "リセット完了",
        description: "アプリタイトルをデフォルトに戻しました",
      })
    } catch (error) {
      console.error("Failed to reset app title:", error)
      toast({
        variant: "destructive",
        title: "リセットエラー",
        description: "アプリタイトルのリセットに失敗しました",
      })
    }
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setTempUserNames([...userNames])
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setTempUserNames([...userNames])
  }

  const handleSaveChanges = () => {
    const filteredNames = tempUserNames.filter((name) => name.trim() !== "")
    if (filteredNames.length === 0) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: "少なくとも1つの利用者名を入力してください",
      })
      return
    }

    try {
      const oldNames = userNames
      const newNames = filteredNames

      for (let i = 0; i < Math.min(oldNames.length, newNames.length); i++) {
        if (oldNames[i] !== newNames[i]) {
          DataStorageService.updateUserNameInEvents(oldNames[i], newNames[i])
          DataStorageService.updateUserNameInProfiles(oldNames[i], newNames[i])
        }
      }

      DataStorageService.saveCustomUserNames(filteredNames)
      setUserNames(filteredNames)
      setIsEditing(false)

      onUserNamesUpdate(filteredNames)

      toast({
        variant: "default",
        title: "保存完了",
        description: `${filteredNames.length}名の利用者名を保存しました。既存の記録データも更新されました。`,
      })
    } catch (error) {
      console.error("Failed to save user names:", error)
      toast({
        variant: "destructive",
        title: "保存エラー",
        description: "利用者名の保存に失敗しました。もう一度お試しください。",
      })
    }
  }

  const handleResetToDefault = () => {
    try {
      const defaultNames = Array.from({ length: 24 }, (_, i) => `利用者${String.fromCharCode(65 + i)}`)

      const oldNames = userNames
      for (let i = 0; i < Math.min(oldNames.length, defaultNames.length); i++) {
        if (oldNames[i] !== defaultNames[i]) {
          DataStorageService.updateUserNameInEvents(oldNames[i], defaultNames[i])
          DataStorageService.updateUserNameInProfiles(oldNames[i], defaultNames[i])
        }
      }

      DataStorageService.saveCustomUserNames(defaultNames)
      setUserNames(defaultNames)
      setTempUserNames([...defaultNames])
      onUserNamesUpdate(defaultNames)
      setIsEditing(false)

      toast({
        variant: "default",
        title: "リセット完了",
        description: "利用者名をデフォルト（A～X）に戻しました。既存の記録データも更新されました。",
      })
    } catch (error) {
      console.error("Failed to reset user names:", error)
      toast({
        variant: "destructive",
        title: "リセットエラー",
        description: "利用者名のリセットに失敗しました。もう一度お試しください。",
      })
    }
  }

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...tempUserNames]
    newNames[index] = value
    setTempUserNames(newNames)
  }

  const handleAddUser = () => {
    setTempUserNames([...tempUserNames, ""])
  }

  const handleRemoveUser = (index: number) => {
    if (tempUserNames.length > 1) {
      const newNames = tempUserNames.filter((_, i) => i !== index)
      setTempUserNames(newNames)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-primary/10 rounded-lg">🏷️</div>
            アプリタイトル管理
          </CardTitle>
          <p className="text-sm text-muted-foreground">アプリのタイトルとサブタイトルをカスタマイズできます。</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {!isEditingTitle ? (
              <>
                <Button onClick={handleStartEditTitle} className="flex items-center gap-2">
                  ✏️ 編集開始
                </Button>
                <Button variant="outline" onClick={handleResetTitle} className="flex items-center gap-2 bg-transparent">
                  🔄 デフォルトに戻す
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSaveTitle} className="flex items-center gap-2">
                  💾 保存
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelEditTitle}
                  className="flex items-center gap-2 bg-transparent"
                >
                  ❌ キャンセル
                </Button>
              </>
            )}
          </div>

          <div className="space-y-4">
            {isEditingTitle ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="app-title">メインタイトル</Label>
                  <Input
                    id="app-title"
                    value={tempAppTitle}
                    onChange={(e) => setTempAppTitle(e.target.value)}
                    placeholder="日常ケア記録システム"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-subtitle">サブタイトル</Label>
                  <Input
                    id="app-subtitle"
                    value={tempAppSubtitle}
                    onChange={(e) => setTempAppSubtitle(e.target.value)}
                    placeholder="重症心身障害児者支援アプリ - PROJECT SOUL"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-lg">{appTitle}</div>
                  <div className="text-sm text-muted-foreground">{appSubtitle}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-primary/10 rounded-lg">👥</div>
            利用者名管理
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            実際の利用者名を設定できます。個人情報保護のため、この設定は端末内にのみ保存されます。
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {!isEditing ? (
              <>
                <Button onClick={handleStartEdit} className="flex items-center gap-2">
                  ✏️ 編集開始
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetToDefault}
                  className="flex items-center gap-2 bg-transparent"
                >
                  🔄 デフォルトに戻す
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSaveChanges} className="flex items-center gap-2">
                  💾 保存
                </Button>
                <Button variant="outline" onClick={handleCancelEdit} className="flex items-center gap-2 bg-transparent">
                  ❌ キャンセル
                </Button>
                <Button variant="outline" onClick={handleAddUser} className="flex items-center gap-2 bg-transparent">
                  ➕ 利用者追加
                </Button>
              </>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">利用者一覧 ({userNames.length}名)</Label>

            {isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {tempUserNames.map((name, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Label className="text-sm font-medium min-w-[30px]">{index + 1}.</Label>
                    <Input
                      value={name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      placeholder={`利用者${String.fromCharCode(65 + index)}`}
                      className="flex-1"
                    />
                    {tempUserNames.length > 1 && (
                      <Button variant="outline" size="sm" onClick={() => handleRemoveUser(index)} className="px-2">
                        🗑️
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                {userNames.map((name, index) => (
                  <div
                    key={index}
                    className="p-3 bg-muted/50 rounded-lg text-sm font-medium text-center hover:bg-muted transition-colors"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-amber-600 mt-0.5">⚠️</div>
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">プライバシー保護について</p>
                <p>
                  設定した利用者名は、お使いの端末内にのみ保存され、外部に送信されることはありません。アプリを削除すると設定も削除されます。
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">データ整合性について</p>
                <p>
                  利用者名を変更すると、既存のケア記録やプロフィールデータも自動的に新しい名前に更新されます。この処理により、過去の記録との整合性が保たれます。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
