import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import PropTypes from "prop-types";
import { userService } from "../services/userService";
import toast from "react-hot-toast";
import VerificationToggle from "./VerificationToggle";
import UserFilesTab from "./UserFiles/UserFilesTab";
import { format } from "date-fns";

function EditableField({
  label,
  value,
  onChange,
  editMode,
  type = "text",
  isReadOnly = false,
}) {
  if (editMode) {
    if (isReadOnly) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            <span className="ml-1 text-xs text-gray-500">(Read-only)</span>
          </label>
          <div className="relative">
            <input
              type={type}
              value={value || ""}
              disabled
              className="block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            This field cannot be modified for security reasons
          </p>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {isReadOnly && (
          <span className="ml-1 text-xs text-gray-500">(Read-only)</span>
        )}
      </label>
      <p className="text-lg text-gray-900">{value || "N/A"}</p>
    </div>
  );
}

function InfoSection({ title, children }) {
  return (
    <div className="pt-6 border-t border-gray-200 first:pt-0 first:border-t-0">
      <h4 className="text-lg font-medium text-gray-900 mb-4">{title}</h4>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">{children}</div>
    </div>
  );
}

EditableField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  editMode: PropTypes.bool.isRequired,
  type: PropTypes.string,
  isReadOnly: PropTypes.bool,
};

InfoSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function UserDetailsModal({
  user,
  onClose,
  onUpdateVerification,
}) {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const [activeMainTab, setActiveMainTab] = useState("details");
  const [activeDetailsTab, setActiveDetailsTab] = useState("personal");
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await userService.updateUser(user.uid, editedUser);
      toast.success("User details updated successfully");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user details");
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      // Handle Firebase timestamp
      if (timestamp.seconds) {
        return format(new Date(timestamp.seconds * 1000), "PPpp");
      }
      // Handle ISO string or other date formats
      return format(new Date(timestamp), "PPpp");
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return "Invalid date";
    }
  };

  const detailsTabs = [
    {
      id: "personal",
      label: "Personal",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      id: "contact",
      label: "Contact",
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    },
    {
      id: "identification",
      label: "ID Details",
      icon: "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2",
    },
    {
      id: "account",
      label: "Account",
      icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    },
    {
      id: "verification",
      label: "Verification",
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    },
  ];

  const renderTabContent = () => {
    if (activeMainTab === "files") {
      return <UserFilesTab userId={user.uid} />;
    }

    switch (activeDetailsTab) {
      case "personal":
        return (
          <InfoSection title="Personal Information">
            <EditableField
              label="First Name"
              value={editedUser.firstName}
              onChange={(value) => handleFieldChange("firstName", value)}
              editMode={editMode}
            />
            <EditableField
              label="Last Name"
              value={editedUser.lastName}
              onChange={(value) => handleFieldChange("lastName", value)}
              editMode={editMode}
            />
            <EditableField
              label="Father's Name"
              value={editedUser.fatherName}
              onChange={(value) => handleFieldChange("fatherName", value)}
              editMode={editMode}
            />
            <EditableField
              label="Gender"
              value={editedUser.gender}
              onChange={(value) => handleFieldChange("gender", value)}
              editMode={editMode}
            />
            <EditableField
              label="Date of Birth"
              value={editedUser.dob}
              onChange={(value) => handleFieldChange("dob", value)}
              editMode={editMode}
              type="date"
            />
            <EditableField
              label="Address"
              value={editedUser.address}
              onChange={(value) => handleFieldChange("address", value)}
              editMode={editMode}
            />
          </InfoSection>
        );

      case "contact":
        return (
          <InfoSection title="Contact Information">
            <EditableField
              label="Email"
              value={editedUser.email}
              onChange={(value) => handleFieldChange("email", value)}
              editMode={editMode}
              type="email"
              isReadOnly={true}
            />
            <EditableField
              label="Phone Number"
              value={editedUser.phoneNumber}
              onChange={(value) => handleFieldChange("phoneNumber", value)}
              editMode={editMode}
              type="tel"
              isReadOnly={true}
            />
          </InfoSection>
        );

      case "identification":
        return (
          <InfoSection title="Identification Details">
            <EditableField
              label="Citizenship Number"
              value={editedUser.citizenshipNumber}
              onChange={(value) =>
                handleFieldChange("citizenshipNumber", value)
              }
              editMode={editMode}
            />
            <EditableField
              label="License Number"
              value={editedUser.licenseNumber}
              onChange={(value) => handleFieldChange("licenseNumber", value)}
              editMode={editMode}
            />
          </InfoSection>
        );

      case "account":
        return (
          <InfoSection title="Account Information">
            <div className="col-span-2">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Created At
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatTimestamp(editedUser.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Updated
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatTimestamp(editedUser.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </InfoSection>
        );

      case "verification":
        return (
          <InfoSection title="Verification Status">
            <div className="col-span-2 space-y-4">
              <VerificationToggle
                label="Email Verification"
                isVerified={editedUser.isEmailVerified}
                onChange={(value) => {
                  handleFieldChange("isEmailVerified", value);
                  onUpdateVerification(
                    editedUser.uid,
                    "isEmailVerified",
                    value
                  );
                }}
              />
              <VerificationToggle
                label="Document Verification"
                isVerified={editedUser.isDocumentVerified}
                onChange={(value) => {
                  handleFieldChange("isDocumentVerified", value);
                  onUpdateVerification(
                    editedUser.uid,
                    "isDocumentVerified",
                    value
                  );
                }}
              />
              <VerificationToggle
                label="Selfie Verification"
                isVerified={editedUser.isSelfieVerified}
                onChange={(value) => {
                  handleFieldChange("isSelfieVerified", value);
                  onUpdateVerification(
                    editedUser.uid,
                    "isSelfieVerified",
                    value
                  );
                }}
              />
              <VerificationToggle
                label="Liveness Verification"
                isVerified={editedUser.isLivenessVerified}
                onChange={(value) => {
                  handleFieldChange("isLivenessVerified", value);
                  onUpdateVerification(
                    editedUser.uid,
                    "isLivenessVerified",
                    value
                  );
                }}
              />
            </div>
          </InfoSection>
        );

      default:
        return null;
    }
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="bg-indigo-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white">
                      User Profile
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-white hover:text-indigo-100 transition-colors"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4">
                  {/* Main Tabs */}
                  <div className="flex space-x-4 border-b border-gray-200">
                    <button
                      onClick={() => setActiveMainTab("details")}
                      className={`pb-4 text-sm font-medium ${
                        activeMainTab === "details"
                          ? "border-b-2 border-indigo-500 text-indigo-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setActiveMainTab("files")}
                      className={`pb-4 text-sm font-medium ${
                        activeMainTab === "files"
                          ? "border-b-2 border-indigo-500 text-indigo-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Files
                    </button>
                  </div>

                  {/* Details Sub-tabs */}
                  {activeMainTab === "details" && (
                    <div className="mt-4 flex space-x-4 border-b border-gray-200">
                      {detailsTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveDetailsTab(tab.id)}
                          className={`pb-4 text-sm font-medium inline-flex items-center space-x-2 ${
                            activeDetailsTab === tab.id
                              ? "border-b-2 border-indigo-500 text-indigo-600"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d={tab.icon}
                            />
                          </svg>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-6">
                    {renderTabContent()}

                    {activeMainTab === "details" && (
                      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                        {editMode ? (
                          <>
                            <button
                              onClick={() => {
                                setEditedUser(user);
                                setEditMode(false);
                              }}
                              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveChanges}
                              disabled={isSaving}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                              {isSaving ? (
                                <>
                                  <svg
                                    className="w-4 h-4 mr-2 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  Saving...
                                </>
                              ) : (
                                "Save Changes"
                              )}
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditMode(true)}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                          >
                            Edit Details
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

UserDetailsModal.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateVerification: PropTypes.func.isRequired,
};
