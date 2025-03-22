import type React from "react"
import { useState } from "react"
import UserList from "../components/UserList"
import {Users } from "lucide-react"

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("list")
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-gray-400 mt-2">View, search, and create users in the system</p>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700"
              }`}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              User List
            </button>
           
          </nav>
        </div>
      </div>
      <UserList refreshTrigger={refreshTrigger} />
    </div>
  )
}

export default UserManagement

