export interface CareEvent {
  id: string
  eventType: string
  timestamp: string
  userId: string
  time: string
  notes?: string
  [key: string]: any
}

export interface UserProfile {
  id: string
  name: string
  dateOfBirth?: string
  medicalNumber?: string
  careLevel?: string
  allergies?: string[]
  medications?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  createdAt: string
  updatedAt: string
}

export class DataStorageService {
  private static readonly CARE_EVENTS_KEY = "careEvents"
  private static readonly USER_PROFILES_KEY = "userProfiles"
  private static readonly APP_SETTINGS_KEY = "appSettings"
  private static readonly CUSTOM_USER_NAMES_KEY = "customUserNames"
  private static readonly FORM_OPTIONS_KEY = "form-options"

  // Care Events Management
  static saveCareEvent(event: Omit<CareEvent, "id">): CareEvent {
    try {
      const events = this.getAllCareEvents()
      const newEvent = {
        ...event,
        id: this.generateId(),
      } as CareEvent

      events.push(newEvent)
      localStorage.setItem(this.CARE_EVENTS_KEY, JSON.stringify(events))

      return newEvent
    } catch (error) {
      console.error("Failed to save care event:", error)
      throw new Error("ケア記録の保存に失敗しました")
    }
  }

  static getAllCareEvents(): CareEvent[] {
    try {
      const events = localStorage.getItem(this.CARE_EVENTS_KEY)
      return events ? JSON.parse(events) : []
    } catch (error) {
      console.error("Failed to load care events:", error)
      return []
    }
  }

  static getCareEventsByUser(userId: string): CareEvent[] {
    return this.getAllCareEvents().filter((event) => event.userId === userId)
  }

  static getCareEventsByDate(date: string, userId?: string): CareEvent[] {
    const events = userId ? this.getCareEventsByUser(userId) : this.getAllCareEvents()
    return events.filter((event) => {
      const eventDate = new Date(event.timestamp).toDateString()
      const targetDate = new Date(date).toDateString()
      return eventDate === targetDate
    })
  }

  static deleteCareEvent(eventId: string): boolean {
    try {
      const events = this.getAllCareEvents()
      const filteredEvents = events.filter((event) => event.id !== eventId)

      if (events.length === filteredEvents.length) {
        return false // Event not found
      }

      localStorage.setItem(this.CARE_EVENTS_KEY, JSON.stringify(filteredEvents))
      return true
    } catch (error) {
      console.error("Failed to delete care event:", error)
      throw new Error("ケア記録の削除に失敗しました")
    }
  }

  // User Profile Management
  static saveUserProfile(profile: Omit<UserProfile, "id" | "createdAt" | "updatedAt">): UserProfile {
    try {
      const profiles = this.getAllUserProfiles()
      const existingProfile = profiles.find((p) => p.name === profile.name)

      if (existingProfile) {
        const updatedProfile: UserProfile = {
          ...existingProfile,
          ...profile,
          updatedAt: new Date().toISOString(),
        }

        const updatedProfiles = profiles.map((p) => (p.id === existingProfile.id ? updatedProfile : p))

        localStorage.setItem(this.USER_PROFILES_KEY, JSON.stringify(updatedProfiles))
        return updatedProfile
      } else {
        const newProfile: UserProfile = {
          ...profile,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        profiles.push(newProfile)
        localStorage.setItem(this.USER_PROFILES_KEY, JSON.stringify(profiles))
        return newProfile
      }
    } catch (error) {
      console.error("Failed to save user profile:", error)
      throw new Error("利用者プロフィールの保存に失敗しました")
    }
  }

  static getAllUserProfiles(): UserProfile[] {
    try {
      const profiles = localStorage.getItem(this.USER_PROFILES_KEY)
      return profiles ? JSON.parse(profiles) : []
    } catch (error) {
      console.error("Failed to load user profiles:", error)
      return []
    }
  }

  static getUserProfile(userId: string): UserProfile | null {
    return this.getAllUserProfiles().find((profile) => profile.id === userId) || null
  }

  static deleteUserProfile(userId: string): boolean {
    try {
      const profiles = this.getAllUserProfiles()
      const filteredProfiles = profiles.filter((profile) => profile.id !== userId)

      if (profiles.length === filteredProfiles.length) {
        return false // Profile not found
      }

      localStorage.setItem(this.USER_PROFILES_KEY, JSON.stringify(filteredProfiles))
      return true
    } catch (error) {
      console.error("Failed to delete user profile:", error)
      throw new Error("利用者プロフィールの削除に失敗しました")
    }
  }

  // Custom User Names Management
  static getCustomUserNames(): string[] {
    try {
      const userNames = localStorage.getItem(this.CUSTOM_USER_NAMES_KEY)
      return userNames ? JSON.parse(userNames) : []
    } catch (error) {
      console.error("Failed to load custom user names:", error)
      return []
    }
  }

  static saveCustomUserNames(userNames: string[]): void {
    try {
      localStorage.setItem(this.CUSTOM_USER_NAMES_KEY, JSON.stringify(userNames))
    } catch (error) {
      console.error("Failed to save custom user names:", error)
      throw new Error("利用者名の保存に失敗しました")
    }
  }

  static updateUserNameInEvents(oldName: string, newName: string): void {
    try {
      const events = this.getAllCareEvents()
      const updatedEvents = events.map((event) => (event.userId === oldName ? { ...event, userId: newName } : event))
      localStorage.setItem(this.CARE_EVENTS_KEY, JSON.stringify(updatedEvents))
    } catch (error) {
      console.error("Failed to update user name in events:", error)
      throw new Error("記録データの利用者名更新に失敗しました")
    }
  }

  static updateUserNameInProfiles(oldName: string, newName: string): void {
    try {
      const profiles = this.getAllUserProfiles()
      const updatedProfiles = profiles.map((profile) =>
        profile.name === oldName ? { ...profile, name: newName, updatedAt: new Date().toISOString() } : profile,
      )
      localStorage.setItem(this.USER_PROFILES_KEY, JSON.stringify(updatedProfiles))
    } catch (error) {
      console.error("Failed to update user name in profiles:", error)
      throw new Error("プロフィールデータの利用者名更新に失敗しました")
    }
  }

  // Form Options Management
  static getFormOptions(): any {
    try {
      const options = localStorage.getItem(this.FORM_OPTIONS_KEY)
      return options ? JSON.parse(options) : {}
    } catch (error) {
      console.error("Failed to load form options:", error)
      return {}
    }
  }

  static saveFormOptions(options: any): void {
    try {
      localStorage.setItem(this.FORM_OPTIONS_KEY, JSON.stringify(options))
    } catch (error) {
      console.error("Failed to save form options:", error)
      throw new Error("フォーム選択項目の保存に失敗しました")
    }
  }

  static resetFormOptions(): void {
    try {
      localStorage.removeItem(this.FORM_OPTIONS_KEY)
    } catch (error) {
      console.error("Failed to reset form options:", error)
      throw new Error("フォーム選択項目のリセットに失敗しました")
    }
  }

  // Data Backup and Restore
  static exportAllData(): string {
    try {
      const data = {
        careEvents: this.getAllCareEvents(),
        userProfiles: this.getAllUserProfiles(),
        appSettings: this.getAppSettings(),
        customUserNames: this.getCustomUserNames(),
        formOptions: this.getFormOptions(),
        exportDate: new Date().toISOString(),
        version: "1.1",
      }

      return JSON.stringify(data, null, 2)
    } catch (error) {
      console.error("Failed to export data:", error)
      throw new Error("データのエクスポートに失敗しました")
    }
  }

  static importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData)

      if (!data.careEvents || !Array.isArray(data.careEvents)) {
        throw new Error("Invalid care events data")
      }

      if (!data.userProfiles || !Array.isArray(data.userProfiles)) {
        throw new Error("Invalid user profiles data")
      }

      const backup = this.exportAllData()
      localStorage.setItem("dataBackup", backup)

      localStorage.setItem(this.CARE_EVENTS_KEY, JSON.stringify(data.careEvents))
      localStorage.setItem(this.USER_PROFILES_KEY, JSON.stringify(data.userProfiles))

      if (data.appSettings) {
        localStorage.setItem(this.APP_SETTINGS_KEY, JSON.stringify(data.appSettings))
      }

      if (data.customUserNames && Array.isArray(data.customUserNames)) {
        localStorage.setItem(this.CUSTOM_USER_NAMES_KEY, JSON.stringify(data.customUserNames))
      }

      if (data.formOptions && typeof data.formOptions === "object") {
        localStorage.setItem(this.FORM_OPTIONS_KEY, JSON.stringify(data.formOptions))
      }

      return true
    } catch (error) {
      console.error("Failed to import data:", error)
      throw new Error("データのインポートに失敗しました")
    }
  }

  // App Settings
  static getAppSettings(): any {
    try {
      const settings = localStorage.getItem(this.APP_SETTINGS_KEY)
      return settings
        ? JSON.parse(settings)
        : {
            theme: "light",
            language: "ja",
            autoSave: true,
            notifications: true,
          }
    } catch (error) {
      console.error("Failed to load app settings:", error)
      return {}
    }
  }

  static saveAppSettings(settings: any): void {
    try {
      localStorage.setItem(this.APP_SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save app settings:", error)
      throw new Error("設定の保存に失敗しました")
    }
  }

  // Utility Methods
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(this.CARE_EVENTS_KEY)
      localStorage.removeItem(this.USER_PROFILES_KEY)
      localStorage.removeItem(this.APP_SETTINGS_KEY)
      localStorage.removeItem(this.CUSTOM_USER_NAMES_KEY)
      localStorage.removeItem(this.FORM_OPTIONS_KEY)
    } catch (error) {
      console.error("Failed to clear data:", error)
      throw new Error("データの削除に失敗しました")
    }
  }

  static getStorageInfo(): { used: number; available: number; percentage: number } {
    try {
      let used = 0
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length
        }
      }

      const available = 5 * 1024 * 1024 - used
      const percentage = (used / (5 * 1024 * 1024)) * 100

      return { used, available, percentage }
    } catch (error) {
      console.error("Failed to get storage info:", error)
      return { used: 0, available: 0, percentage: 0 }
    }
  }
}
