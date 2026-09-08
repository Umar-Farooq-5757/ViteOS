import type React from "react";
import { useState } from "react";

const UniqueClock: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  return (
    <div className="fixed top-0 bottom-0 right-0 flex flex-col w-[50vw] bg-[#090E1B]">
      {/* Show text ONLY if the iframe has successfully loaded without errors */}
      {isLoaded && !hasError && (
        <div className="flex items-center gap-2 p-3 text-sm">
          <p>Clock created by me in November 2025</p>
          <a
            className="text-blue-400 underline"
            href="https://github.com/Umar-Farooq-5757/Mini-Projects/tree/main/Mechanical%20Clock"
            target="_blank"
            rel="noreferrer">
            GitHub
          </a>
        </div>
      )}
      {/* Iframe */}
      <iframe
        className="grow bg-transparent border-none"
        src="https://clock57.netlify.app"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        title="My Unique Clock"></iframe>
    </div>
  );
};

export default UniqueClock;
