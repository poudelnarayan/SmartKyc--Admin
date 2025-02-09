import PropTypes from "prop-types";
import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function VerificationToggle({ label, isVerified, onChange }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newStatus, setNewStatus] = useState(false);

  const handleToggleClick = (newValue) => {
    setNewStatus(newValue);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onChange(newStatus);
    setShowConfirmation(false);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
          onClick={() => handleToggleClick(!isVerified)}
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${
              isVerified
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }
          `}
        >
          {isVerified ? (
            <>
              <svg
                className="h-4 w-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Verified
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Pending
            </>
          )}
        </button>
      </div>

      {/* Confirmation Dialog */}
      <Transition appear show={showConfirmation} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setShowConfirmation(false)}
        >
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-lg font-medium text-gray-900">
                    Confirm Verification Change
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to mark {label} as{" "}
                      {newStatus ? "verified" : "pending"}?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowConfirmation(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white 
                        ${
                          newStatus
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }`}
                      onClick={handleConfirm}
                    >
                      Confirm
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

VerificationToggle.propTypes = {
  label: PropTypes.string.isRequired,
  isVerified: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};
