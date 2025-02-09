import { Dialog } from "@headlessui/react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import PropTypes from 'prop-types';
import toast from "react-hot-toast";


UserVerificationModal.propTypes = {
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      isEmailVerified: PropTypes.bool,
      isDocumentVerified: PropTypes.bool,
      isSelfieVerified: PropTypes.bool,
      isLivenessVerified: PropTypes.bool,
    }).isRequired,
    onClose: PropTypes.func.isRequired,
};
VerificationItem.propTypes = {
    label: PropTypes.string.isRequired,
    isVerified: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

export default function UserVerificationModal({ user, onClose }) {
  if (!user) return null; // Prevents crashes if user is undefined

  const updateVerification = async (field, value) => {
    try {
      await updateDoc(doc(db, "users", user.id), {
        [field]: value,
      });
      toast.success("Verification status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update verification status");
    }
  };

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-30" />

      <Dialog.Panel className="relative bg-white rounded-lg max-w-lg w-full mx-4 shadow-lg">
        <div className="p-6">
          <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
            Verify User: {user.firstName} {user.lastName}
          </Dialog.Title>

          <div className="space-y-4">
            <VerificationItem
              label="Email Verification"
              isVerified={user.isEmailVerified}
              onChange={(value) => updateVerification("isEmailVerified", value)}
            />
            <VerificationItem
              label="Document Verification"
              isVerified={user.isDocumentVerified}
              onChange={(value) => updateVerification("isDocumentVerified", value)}
            />
            <VerificationItem
              label="Selfie Verification"
              isVerified={user.isSelfieVerified}
              onChange={(value) => updateVerification("isSelfieVerified", value)}
            />
            <VerificationItem
              label="Liveness Verification"
              isVerified={user.isLivenessVerified}
              onChange={(value) => updateVerification("isLivenessVerified", value)}
            />
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

function VerificationItem({ label, isVerified, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <button
        onClick={() => onChange(!isVerified)}
        className={`px-3 py-1 text-sm font-medium rounded-full ${
          isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {isVerified ? "Verified" : "Pending"}
      </button>
    </div>
  );
}
