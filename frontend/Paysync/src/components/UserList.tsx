import type React from "react"
import { useState, useEffect } from "react"
import { Search, RefreshCw } from "lucide-react"
import toast from "react-hot-toast"
import { User, userApi } from "../services/api"
import { useNavigate } from "react-router-dom"

interface UserListProps {
  refreshTrigger?: number
}

const UserList: React.FC<UserListProps> = ({ refreshTrigger = 0 }) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [count, setCount] = useState(0)
  const navigate = useNavigate();
  const loadUsers = async (filters?: { name?: string; phoneno?: string }) => {
    setLoading(true)
    try {
      const response = await userApi.fetchUsers(filters)
      if (response.success && response.data) {
        setUsers(response.data)
        setCount(response.count || 0)
      } else {
        toast.error(response.message || "Failed to load users")
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [refreshTrigger])

  const handleSearch = () => {
    const filters: { name?: string; phoneno?: string } = {}
    if (nameFilter) filters.name = nameFilter
    if (phoneFilter) filters.phoneno = phoneFilter
    loadUsers(filters)
  }

  const handleClearFilters = () => {
    setNameFilter("")
    setPhoneFilter("")
    loadUsers()
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">User List</h2>
        <button
          onClick={() => loadUsers()}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Refresh users"
        >
          <RefreshCw className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter by name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Filter by phone number"
            value={phoneFilter}
            onChange={(e) => setPhoneFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-medium flex items-center transition-colors"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 bg-transparent border border-gray-600 hover:bg-gray-700 rounded-md text-gray-200 font-medium transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-400 mb-2">
            {count} user{count !== 1 ? "s" : ""} found
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-300 font-semibold">Name</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">Email</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">Phone</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">Send Money</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{user.name}</td>
                      <td className="px-4 py-3 text-gray-300">{user.email}</td>
                      <td className="px-4 py-3 text-gray-300">{user.phoneno}</td>
                      <button 
                       onClick={()=>{
                           navigate("/sendmoney");
                       }}
                       className="px-4 py-3  text-black bg-white mt-2 mb-2 rounded-2xl "> Pay Now </button>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default UserList

