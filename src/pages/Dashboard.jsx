import { useState, useEffect } from "react";
import { userService } from "../services/userService";
import toast from "react-hot-toast";
import DashboardHeader from "../components/DashboardHeader";
import DashboardStats from "../components/DashboardStats";
import UserCard from "../components/UserCard";
import UserList from "../components/UserList";
import UserDetailsModal from "../components/UserDetailsModal";
import DeleteModal from "../components/DeleteModal";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = userService.subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (userId) => {
    setDeleteLoading(true);
    try {
      await userService.deleteUser(userId);
      toast.success("User deleted successfully", {
        icon: "🗑️",
        duration: 4000,
      });
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateVerification = async (userId, field, value) => {
    try {
      await userService.updateUser(userId, { [field]: value });
      toast.success("Verification status updated");
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Failed to update verification status");
    }
  };

  const getVerificationProgress = (user) => {
    const verifications = [
      user.isEmailVerified,
      user.isDocumentVerified,
      user.isSelfieVerified,
      user.isLivenessVerified,
    ];
    return (verifications.filter(Boolean).length / verifications.length) * 100;
  };

  const handleViewUser = (user) => {
    console.log("Viewing user:", user); // Debug log
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phoneNumber?.includes(searchTerm)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <DashboardStats
            users={users}
            getVerificationProgress={getVerificationProgress}
          />
        </div>

        {viewMode === "grid" ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
              <UserCard
                key={user.uid}
                user={user}
                getVerificationProgress={getVerificationProgress}
                onView={handleViewUser}
                onDelete={handleDeleteUser}
              />
            ))}
          </div>
        ) : (
          <UserList
            users={filteredUsers}
            getVerificationProgress={getVerificationProgress}
            onView={handleViewUser}
            onDelete={handleDeleteUser}
          />
        )}
      </div>

      {showUserModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseUserModal}
          onUpdateVerification={handleUpdateVerification}
        />
      )}

      {showDeleteModal && selectedUser && (
        <DeleteModal
          onConfirm={() => handleDelete(selectedUser.uid)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          isLoading={deleteLoading}
        />
      )}
    </div>
  );
}
