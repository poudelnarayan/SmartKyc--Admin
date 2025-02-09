import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import FileViewer from "./FileViewer";
import LoadingSpinner from "./LoadingSpinner";

export default function UserSelfies({ userId }) {
  const [selfies, setSelfies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSelfies = async () => {
      try {
        const urls = await userService.getUserFiles(userId, "selfies");
        setSelfies(urls);
      } catch (err) {
        setError("Failed to load selfies");
        console.error("Error loading selfies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSelfies();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;
  if (selfies.length === 0) {
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No selfies</h3>
        <p className="mt-1 text-sm text-gray-500">
          No selfies have been uploaded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {selfies.map((url, index) => (
        <FileViewer key={url} url={url} type="selfie" index={index + 1} />
      ))}
    </div>
  );
}

UserSelfies.propTypes = {
  userId: PropTypes.string.isRequired,
};
