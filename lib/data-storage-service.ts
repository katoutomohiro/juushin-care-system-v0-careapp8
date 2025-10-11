import { DataStorageService } from "@/services/data-storage-service"

export async function initializeSampleData() {
  try {
    const existingUsers = DataStorageService.getAllUserProfiles()
    if (existingUsers.length > 0) {
      return
    }
  } catch (error) {
    console.error("Error initializing sample data:", error)
  }
}
