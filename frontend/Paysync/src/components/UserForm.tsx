import type React from "react"
import { useState } from "react"
import toast from "react-hot-toast"
import { userApi, UserCreatePayload } from "../services/api"

interface UserFormProps {
  onSuccess?: () => void
}

const UserForm: React.FC<UserFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<UserCreatePayload>({
    name: "",
    email: "",
    phoneno: "",
    initialBalance: 0,
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "initialBalance" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await userApi.createUser(formData)

      if (response.success) {
        toast.success("User created successfully!")
        setFormData({
          name: "",
          email: "",
          phoneno: "",
          initialBalance: 0,
        })
        if (onSuccess) onSuccess()
      } else {
        toast.error(response.message || "Failed to create user")
      }
    } catch (err) {
      toast.error("An unexpected error occurred")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-6">Create New User</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phoneno" className="block text-sm font-medium text-gray-300">
            Phone Number
          </label>
          <input
            id="phoneno"
            name="phoneno"
            value={formData.phoneno}
            onChange={handleChange}
            placeholder="+1234567890"
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-300">
            Initial Balance
          </label>
          <input
            id="initialBalance"
            name="initialBalance"
            type="number"
            step="0.01"
            value={formData.initialBalance}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  )
}

export default UserForm

