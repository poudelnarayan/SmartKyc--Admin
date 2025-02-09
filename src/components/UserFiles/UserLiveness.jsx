import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { userService } from "../../services/userService";
import FileViewer from "./FileViewer";
import LoadingSpinner from "./LoadingSpinner";

export default function UserLiveness({ userId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const urls = await userService.getUserFiles(userId, "liveness");
        setVideos(urls);
      } catch (err) {
        setError("Failed to load liveness videos");
        console.error("Error loading liveness videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [userId]);

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="text-red-500 text-center py-4">{error}</div>;
  if (videos.length === 0) {
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No liveness videos
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No liveness check videos have been recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {videos.map((url, index) => (
        <FileViewer key={url} url={url} type="video" index={index + 1} />
      ))}
    </div>
  );
}

UserLiveness.propTypes = {
  userId: PropTypes.string.isRequired,
};
