"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DataStorageService, type UserProfile } from "@/services/data-storage-service"

interface SettingsPanelProps {
  selectedUser: string
  onUserChange?: (userId: string) => void
}

export function SettingsPanel({ selectedUser, onUserChange }: SettingsPanelProps) {
  const [settings, setSettings] = useState<any>({})
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([])
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [newProfile, setNewProfile] = useState({
    name: "",
    dateOfBirth: "",
    medicalNumber: "",
    careLevel: "",
    allergies: "",
    medications: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  })

  useEffect(() => {
    loadSettings()
    loadUserProfiles()
  }, [])

  useEffect(() => {
    const profile = userProfiles.find((p) => p.name === selectedUser)
    setCurrentProfile(profile || null)
  }, [selectedUser, userProfiles])

  const loadSettings = () => {
    const appSettings = DataStorageService.getAppSettings()
    setSettings(appSettings)
  }

  const loadUserProfiles = () => {
    const profiles = DataStorageService.getAllUserProfiles()
    setUserProfiles(profiles)
  }

  const handleSettingChange = (key: string, value: any) => {
    const updatedSettings = { ...settings, [key]: value }
    setSettings(updatedSettings)
    try {
      DataStorageService.saveAppSettings(updatedSettings)
      setMessage({ type: "success", text: "設定を保存しました" })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: "設定の保存に失敗しました" })
    }
  }

  const handleProfileSave = () => {
    try {
      const allergiesArray = newProfile.allergies
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      const medicationsArray = newProfile.medications
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)

      const profileData = {
        ...newProfile,
        allergies: allergiesArray,
        medications: medicationsArray,
      }

      DataStorageService.saveUserProfile(profileData)
      loadUserProfiles()
      setIsEditingProfile(false)
      setNewProfile({
        name: "",
        dateOfBirth: "",
        medicalNumber: "",
        careLevel: "",
        allergies: "",
        medications: "",
        emergencyContact: { name: "", phone: "", relationship: "" },
      })
      setMessage({ type: "success", text: "利用者プロフィールを保存しました" })
    } catch (error) {
      setMessage({ type: "error", text: "プロフィールの保存に失敗しました" })
    }
  }

  const handleProfileDelete = (profileId: string) => {
    if (window.confirm("このプロフィールを削除しますか？")) {
      try {
        DataStorageService.deleteUserProfile(profileId)
        loadUserProfiles()
        setMessage({ type: "success", text: "プロフィールを削除しました" })
      } catch (error) {
        setMessage({ type: "error", text: "プロフィールの削除に失敗しました" })
      }
    }
  }

  const storageInfo = DataStorageService.getStorageInfo()

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⚙️ 設定</h2>

      {message && (
        <Alert className={message.type === "error" ? "border-red-500 bg-red-50" : "border-green-500 bg-green-50"}>
          <AlertDescription className={message.type === "error" ? "text-red-700" : "text-green-700"}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>アプリ設定</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoSave">自動保存</Label>
              <Switch
                id="autoSave"
                checked={settings.autoSave || false}
                onCheckedChange={(checked) => handleSettingChange("autoSave", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">通知</Label>
              <Switch
                id="notifications"
                checked={settings.notifications || false}
                onCheckedChange={(checked) => handleSettingChange("notifications", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">言語</Label>
              <select
                id="language"
                value={settings.language || "ja"}
                onChange={(e) => handleSettingChange("language", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">テーマ</Label>
              <select
                id="theme"
                value={settings.theme || "light"}
                onChange={(e) => handleSettingChange("theme", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                <option value="light">ライト</option>
                <option value="dark">ダーク</option>
                <option value="auto">自動</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>利用者プロフィール管理</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {userProfiles.map((profile) => (
                <div key={profile.id} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div>
                    <span className="font-medium">{profile.name}</span>
                    {profile.careLevel && (
                      <span className="text-sm text-muted-foreground ml-2">({profile.careLevel})</span>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleProfileDelete(profile.id)}>
                    削除
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={() => setIsEditingProfile(true)} className="w-full">
              新しいプロフィールを追加
            </Button>

            {isEditingProfile && (
              <div className="space-y-3 p-4 border rounded-lg">
                <div>
                  <Label htmlFor="profileName">利用者名</Label>
                  <Input
                    id="profileName"
                    value={newProfile.name}
                    onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                    placeholder="利用者名を入力"
                  />
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">生年月日</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newProfile.dateOfBirth}
                    onChange={(e) => setNewProfile({ ...newProfile, dateOfBirth: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="medicalNumber">医療番号</Label>
                  <Input
                    id="medicalNumber"
                    value={newProfile.medicalNumber}
                    onChange={(e) => setNewProfile({ ...newProfile, medicalNumber: e.target.value })}
                    placeholder="医療番号"
                  />
                </div>

                <div>
                  <Label htmlFor="careLevel">ケアレベル</Label>
                  <select
                    id="careLevel"
                    value={newProfile.careLevel}
                    onChange={(e) => setNewProfile({ ...newProfile, careLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">選択してください</option>
                    <option value="要支援1">要支援1</option>
                    <option value="要支援2">要支援2</option>
                    <option value="要介護1">要介護1</option>
                    <option value="要介護2">要介護2</option>
                    <option value="要介護3">要介護3</option>
                    <option value="要介護4">要介護4</option>
                    <option value="要介護5">要介護5</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="allergies">アレルギー（カンマ区切り）</Label>
                  <Input
                    id="allergies"
                    value={newProfile.allergies}
                    onChange={(e) => setNewProfile({ ...newProfile, allergies: e.target.value })}
                    placeholder="例: 卵, 牛乳, 小麦"
                  />
                </div>

                <div>
                  <Label htmlFor="medications">服薬情報（カンマ区切り）</Label>
                  <Input
                    id="medications"
                    value={newProfile.medications}
                    onChange={(e) => setNewProfile({ ...newProfile, medications: e.target.value })}
                    placeholder="例: 血圧薬, 抗てんかん薬"
                  />
                </div>

                <div className="space-y-2">
                  <Label>緊急連絡先</Label>
                  <Input
                    placeholder="氏名"
                    value={newProfile.emergencyContact.name}
                    onChange={(e) =>
                      setNewProfile({
                        ...newProfile,
                        emergencyContact: { ...newProfile.emergencyContact, name: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="電話番号"
                    value={newProfile.emergencyContact.phone}
                    onChange={(e) =>
                      setNewProfile({
                        ...newProfile,
                        emergencyContact: { ...newProfile.emergencyContact, phone: e.target.value },
                      })
                    }
                  />
                  <Input
                    placeholder="続柄"
                    value={newProfile.emergencyContact.relationship}
                    onChange={(e) =>
                      setNewProfile({
                        ...newProfile,
                        emergencyContact: { ...newProfile.emergencyContact, relationship: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleProfileSave} className="flex-1">
                    保存
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditingProfile(false)} className="flex-1">
                    キャンセル
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {currentProfile && (
        <Card>
          <CardHeader>
            <CardTitle>現在の利用者情報 - {currentProfile.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">生年月日</Label>
                <p className="text-sm text-muted-foreground">{currentProfile.dateOfBirth || "未設定"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">医療番号</Label>
                <p className="text-sm text-muted-foreground">{currentProfile.medicalNumber || "未設定"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">ケアレベル</Label>
                <p className="text-sm text-muted-foreground">{currentProfile.careLevel || "未設定"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">アレルギー</Label>
                <p className="text-sm text-muted-foreground">
                  {currentProfile.allergies?.length ? currentProfile.allergies.join(", ") : "なし"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">服薬情報</Label>
                <p className="text-sm text-muted-foreground">
                  {currentProfile.medications?.length ? currentProfile.medications.join(", ") : "なし"}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">緊急連絡先</Label>
                <p className="text-sm text-muted-foreground">
                  {currentProfile.emergencyContact?.name
                    ? `${currentProfile.emergencyContact.name} (${currentProfile.emergencyContact.relationship}) - ${currentProfile.emergencyContact.phone}`
                    : "未設定"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>システム情報</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">アプリバージョン</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">データ使用量</span>
              <span className="text-sm text-muted-foreground">{Math.round(storageInfo.used / 1024)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">利用可能容量</span>
              <span className="text-sm text-muted-foreground">{Math.round(storageInfo.available / 1024)} KB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">使用率</span>
              <span className="text-sm text-muted-foreground">{Math.round(storageInfo.percentage)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
