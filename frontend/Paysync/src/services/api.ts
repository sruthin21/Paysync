import axios from "axios"

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
})

// Types
export interface User {
  id: string
  name: string
  email: string
  phoneno: string
  account?: {
    id: string
    balance: number
  }
}

export interface UserCreatePayload {
  name: string
  email: string
  phoneno: string
  initialBalance?: number
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  count?: number
  error?: any
}

// API functions
export const userApi = {
  // Fetch users with optional filters
  fetchUsers: async (filters?: { name?: string; phoneno?: string }): Promise<ApiResponse<User[]>> => {
    try {
      const params = new URLSearchParams()
      if (filters?.name) params.append("name", filters.name)
      if (filters?.phoneno) params.append("phoneno", filters.phoneno)

      const response = await api.get(`/user/bulk?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error("Error fetching users:", error)
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to fetch users",
          error: error.response?.data?.error,
        }
      }
      return {
        success: false,
        message: "Failed to fetch users",
        error,
      }
    }
  },

  // Create a new user
  createUser: async (userData: UserCreatePayload): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post("/user", userData)
      return response.data
    } catch (error) {
      console.error("Error creating user:", error)
      if (axios.isAxiosError(error)) {
        return {
          success: false,
          message: error.response?.data?.message || "Failed to create user",
          error: error.response?.data?.error,
        }
      }
      return {
        success: false,
        message: "Failed to create user",
        error,
      }
    }
  },
}

