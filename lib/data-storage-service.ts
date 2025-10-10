import { getAllUsers } from "./user-utils" // Assuming user-utils is the file where getAllUsers is declared

export async function initializeSampleData() {
  try {
    const existingUsers = await getAllUsers()
    if (existingUsers.length > 0) {
      return
    }
  } catch (error) {
    console.error("Error initializing sample data:", error)
  }
}
