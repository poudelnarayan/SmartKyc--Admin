import PropTypes from "prop-types";
import { useState, useEffect } from "react";

export default function FileViewer({ url, type, index }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  useEffect(() => {
    if (!url) return;

    if (type === "video") {
      setThumbnailUrl(url);
      return;
    }

    try {
      const compressedUrl = new URL(url);
      compressedUrl.searchParams.set("w", "400");
      compressedUrl.searchParams.set("q", "60");
      setThumbnailUrl(compressedUrl.toString());
    } catch (error) {
      console.error("Error creating thumbnail URL:", error);
      setThumbnailUrl(url);
    }
  }, [url, type]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Don't render anything if URL is not available
  if (!url || !thumbnailUrl) {
    return (
      <div className="relative group bg-gray-100 rounded-lg overflow-hidden">
        <div className="aspect-w-16 aspect-h-9 flex items-center justify-center text-gray-400">
          <svg
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
      </div>
    );
  }

  const renderContent = (isFullscreenView = false) => {
    if (type === "video") {
      return (
        <div className="relative w-full">
          <video
            src={url}
            controls
            className={`w-full rounded-lg ${
              isFullscreenView ? "max-h-[90vh]" : "max-h-[300px]"
            }`}
            onLoadedData={handleLoad}
            poster={thumbnailUrl}
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
          {!isFullscreenView && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      );
    }

    return (
      <div className="relative w-full">
        <img
          src={isFullscreenView ? url : thumbnailUrl}
          alt={`${type} ${index}`}
          className={`w-full rounded-lg ${
            isFullscreenView ? "max-h-[90vh]" : "max-h-[300px]"
          } object-contain bg-gray-50`}
          onLoad={handleLoad}
          loading="lazy"
        />
        {!isFullscreenView && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="relative group bg-gray-100 rounded-lg overflow-hidden">
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* File preview */}
        <div className="aspect-w-16 aspect-h-9">{renderContent(false)}</div>

        {/* File info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between text-white">
            <span className="text-sm font-medium">
              {type.charAt(0).toUpperCase() + type.slice(1)} {index}
            </span>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              title="View fullscreen"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen view */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          <div className="relative w-full max-w-7xl">
            {/* Close button */}
            <button
              onClick={toggleFullscreen}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Fullscreen content */}
            <div className="flex items-center justify-center">
              {renderContent(true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

FileViewer.propTypes = {
  url: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["document", "selfie", "video"]).isRequired,
  index: PropTypes.number.isRequired,
};
