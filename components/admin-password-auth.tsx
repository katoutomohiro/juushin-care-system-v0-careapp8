"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/toast"
import { AdminSettings } from "@/components/admin-settings"
import { FormOptionsManager } from "@/components/form-options-manager"

interface AdminPasswordAuthProps {
  onUserNamesUpdate: (userNames: string[]) => void
  onAppTitleUpdate: (title: string, subtitle: string) => void
}

export function AdminPasswordAuth({ onUserNamesUpdate, onAppTitleUpdate }: AdminPasswordAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const { addToast } = useToast()

  // デフォルトパスワード: 1122
  const getStoredPassword = () => {
    return localStorage.getItem("admin-password") || "1122"
  }

  const handleLogin = () => {
    const storedPassword = getStoredPassword()
    if (password === storedPassword) {
      setIsAuthenticated(true)
      setPassword("")
      addToast({
        type: "success",
        title: "認証成功",
        description: "管理者機能にアクセスできます",
      })
    } else {
      addToast({
        type: "error",
        title: "認証失敗",
        description: "パスワードが正しくありません",
      })
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    addToast({
      type: "default",
      title: "ログアウト",
      description: "管理者機能からログアウトしました",
    })
  }

  const handlePasswordChange = () => {
    const storedPassword = getStoredPassword()

    if (currentPassword !== storedPassword) {
      addToast({
        type: "error",
        title: "パスワード変更失敗",
        description: "現在のパスワードが正しくありません",
      })
      return
    }

    if (newPassword.length < 4) {
      addToast({
        type: "error",
        title: "パスワード変更失敗",
        description: "新しいパスワードは4文字以上で入力してください",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      addToast({
        type: "error",
        title: "パスワード変更失敗",
        description: "新しいパスワードと確認用パスワードが一致しません",
      })
      return
    }

    localStorage.setItem("admin-password", newPassword)
    setIsChangingPassword(false)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")

    addToast({
      type: "success",
      title: "パスワード変更完了",
      description: "管理者パスワードが正常に変更されました",
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (!isAuthenticated) {
        handleLogin()
      } else if (isChangingPassword) {
        handlePasswordChange()
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🔒 管理者認証</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">管理者パスワード</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="パスワードを入力してください"
              className="text-center"
            />
          </div>
          <Button onClick={handleLogin} className="w-full">
            ログイン
          </Button>
          <div className="text-xs text-muted-foreground text-center">
            管理者機能にアクセスするにはパスワードが必要です
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">👤 管理者機能</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                🔑 パスワード変更
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                ログアウト
              </Button>
            </div>
          </div>
        </CardHeader>
        {isChangingPassword && (
          <CardContent className="space-y-4 border-t">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">現在のパスワード</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新しいパスワード</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">新しいパスワード（確認）</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange} size="sm">
                  変更する
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setCurrentPassword("")
                    setNewPassword("")
                    setConfirmPassword("")
                  }}
                >
                  キャンセル
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <AdminSettings onUserNamesUpdate={onUserNamesUpdate} onAppTitleUpdate={onAppTitleUpdate} />
      <FormOptionsManager />
    </div>
  )
}
