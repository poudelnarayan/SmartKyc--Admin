import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import FileViewer from "./FileViewer";
import LoadingSpinner from "./LoadingSpinner";

export default function UserDocuments({ userId }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const urls = await userService.getUserFiles(userId, "documents");
        setDocuments(urls);
      } catch (err) {
        setError("Failed to load documents");
        console.error("Error loading documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
        <p className="mt-1 text-sm text-gray-500">
          No documents have been uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((url, index) => (
        <FileViewer key={url} url={url} type="document" index={index + 1} />
      ))}
    </div>
  );
}

UserDocuments.propTypes = {
  userId: PropTypes.string.isRequired,
};
