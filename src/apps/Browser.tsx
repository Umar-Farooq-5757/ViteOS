import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import {
  FaRegWindowRestore,
  FaWindowMinimize,
  FaArrowLeft,
  FaArrowRight,
  FaRedo,
  FaHome,
  FaExternalLinkAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import { IoIosSearch } from "react-icons/io";
import { cn } from "../lib/utils";

interface BrowserProps {
  onClose: () => void;
  style: string;
  onFocus: () => void;
  zIndex: number;
}

const DEFAULT_URL = "https://html5test.co";

const QUICK_BOOKMARKS = [
  { name: "Wikipedia", url: "https://en.m.wikipedia.org" },
  { name: "HTML5 Test", url: "https://html5test.co" },
];

// Domains known to block iframe embedding via X-Frame-Options / CSP
const BLOCKED_DOMAINS = [
  "duckduckgo.com",
  "google.com",
  "github.com",
  "youtube.com",
  "facebook.com",
  "twitter.com",
  "x.com",
];

const Browser: React.FC<BrowserProps> = ({
  onClose,
  style,
  onFocus,
  zIndex,
}) => {
  const [url, setUrl] = useState(DEFAULT_URL);
  const [inputValue, setInputValue] = useState(DEFAULT_URL);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useProxy, setUseProxy] = useState(false);
  const [history, setHistory] = useState<string[]>([DEFAULT_URL]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Window Resize & Maximize controls
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 800,
    height: 550,
    x: 120,
    y: 80,
  });
  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 800,
    height: 550,
    x: 120,
    y: 80,
  });

  const toggleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaximized) {
      setCurrentSize(prevSize);
      setIsMaximized(false);
    } else {
      setPrevSize({
        width: currentSize.width,
        height: currentSize.height,
        x: currentSize.x,
        y: currentSize.y,
      });
      setIsMaximized(true);
    }
  };

  const formatTargetUrl = (targetUrl: string) => {
    let formatted = targetUrl.trim();
    if (!formatted) return "";

    if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
      if (formatted.includes(".") && !formatted.includes(" ")) {
        formatted = `https://${formatted}`;
      } else {
        formatted = `https://www.google.com/search?q=${encodeURIComponent(formatted)}`;
      }
    }
    return formatted;
  };

  const isKnownBlockedDomain = (targetUrl: string) => {
    return BLOCKED_DOMAINS.some((domain) =>
      targetUrl.toLowerCase().includes(domain),
    );
  };

  const navigateTo = (targetUrl: string) => {
    const formattedUrl = formatTargetUrl(targetUrl);
    if (!formattedUrl) return;

    setHasError(isKnownBlockedDomain(formattedUrl));
    setIsLoading(true);
    setUrl(formattedUrl);
    setInputValue(formattedUrl);

    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, formattedUrl]);
    setHistoryIndex(newHistory.length);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setUrl(prevUrl);
      setInputValue(prevUrl);
      setHasError(isKnownBlockedDomain(prevUrl));
      setIsLoading(true);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setUrl(nextUrl);
      setInputValue(nextUrl);
      setHasError(isKnownBlockedDomain(nextUrl));
      setIsLoading(true);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(isKnownBlockedDomain(url));
    if (iframeRef.current) {
      iframeRef.current.src = getIframeSrc(url);
    }
  };

  // Helper to determine whether to load via raw URL or through the AllOrigins proxy
  const getIframeSrc = (targetUrl: string) => {
    if (!useProxy) return targetUrl;
    return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  };

  return (
    <Rnd
      onMouseDown={onFocus}
      style={{ zIndex }}
      size={
        isMaximized
          ? { width: "100%", height: "100%" }
          : { width: currentSize.width, height: currentSize.height }
      }
      position={
        isMaximized ? { x: 0, y: 0 } : { x: currentSize.x, y: currentSize.y }
      }
      onDragStop={(_e, d) => {
        if (!isMaximized) {
          setCurrentSize((prev) => ({ ...prev, x: d.x, y: d.y }));
        }
      }}
      onResizeStop={(_e, _direction, ref, _delta, position) => {
        if (!isMaximized) {
          setCurrentSize({
            width: ref.style.width,
            height: ref.style.height,
            ...position,
          });
        }
      }}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      bounds="parent"
      dragHandleClassName="handle">
      <section
        className={cn(
          `flex flex-col ${isMaximized ? "w-full h-full" : "h-[75vh] w-[75vw]"} border border-white/15 shadow-xl overflow-hidden`,
          style === "vite" && "rounded-lg bg-black",
        )}>
        {/* Title Bar */}
        <div
          className={cn(
            "handle cursor-grab flex items-center justify-between px-4 py-1",
            style === "vite" && "bg-white/4",
            style === "98" && "bg-linear-to-r from-[#020D88] to-[#107FCD]",
          )}>
          {style === "vite" && (
            <>
              <div className="flex items-center gap-2">
                <img className="size-5" src="/apps/browser.png" alt="clock" />
                <span className="text-sm font-medium">Browser</span>
              </div>
              <div className="flex items-center gap-2 cursor-default">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="size-4 bg-yellow-500 rounded-full hover:opacity-80"
                />
                <button
                  onClick={toggleMaximize}
                  className="size-4 bg-green-500 rounded-full hover:opacity-80"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="size-4 bg-red-500 rounded-full hover:opacity-80"
                />
              </div>
            </>
          )}
          {style === "98" && (
            <>
              <div className="flex items-center gap-2">
                <img className="size-5" src="/apps/browser.png" alt="clock" />
                <span className="text-sm font-medium text-white">Browser</span>
              </div>
              <div className="flex items-center gap-2 cursor-default">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <FaWindowMinimize className="text-black size-3" />
                </button>
                <button
                  onClick={toggleMaximize}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <FaRegWindowRestore className="text-black size-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="bg-[#C0C0C0] size-4.5 flex items-center justify-center">
                  <IoClose className="text-black size-3" />
                </button>
              </div>
            </>
          )}
        </div>

        {style === "vite" && <div className="h-0.5 w-full bg-white/15" />}

        {/* Browser Content Area */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden min-h-0",
            style === "vite" && "bg-white/8",
            style === "98" && "bg-[#C0C0C0] text-black pt-1",
          )}>
          {/* Controls Header */}
          <div
            className={cn(
              "flex flex-col gap-1.5 p-2 shrink-0 border-b",
              style === "vite" && "border-white/10 bg-black/20",
              style === "98" && "border-b-[#808080] bg-[#C0C0C0]",
            )}>
            {/* Top Bar: Nav Buttons + Address Bar */}
            <div className="flex items-center gap-1.5">
              {/* Back Button */}
              <button
                type="button"
                onClick={handleBack}
                disabled={historyIndex <= 0}
                title="Back"
                className={cn(
                  "p-1.5 text-xs flex items-center justify-center outline-none shrink-0",
                  style === "vite" &&
                    "rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white",
                  style === "98" &&
                    "bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white disabled:opacity-50 disabled:pointer-events-none text-black",
                )}>
                <FaArrowLeft />
              </button>

              {/* Forward Button */}
              <button
                type="button"
                onClick={handleForward}
                disabled={historyIndex >= history.length - 1}
                title="Forward"
                className={cn(
                  "p-1.5 text-xs flex items-center justify-center outline-none shrink-0",
                  style === "vite" &&
                    "rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white",
                  style === "98" &&
                    "bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white disabled:opacity-50 disabled:pointer-events-none text-black",
                )}>
                <FaArrowRight />
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh"
                className={cn(
                  "p-1.5 text-xs flex items-center justify-center outline-none shrink-0",
                  style === "vite" &&
                    "rounded-md bg-white/10 hover:bg-white/20 text-white",
                  style === "98" &&
                    "bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white text-black",
                )}>
                <FaRedo />
              </button>

              {/* Home Button */}
              <button
                type="button"
                onClick={() => navigateTo(DEFAULT_URL)}
                title="Home"
                className={cn(
                  "p-1.5 text-xs flex items-center justify-center outline-none shrink-0",
                  style === "vite" &&
                    "rounded-md bg-white/10 hover:bg-white/20 text-white",
                  style === "98" &&
                    "bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white text-black",
                )}>
                <FaHome />
              </button>

              {/* Address Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  navigateTo(inputValue);
                }}
                className={cn(
                  "flex flex-1 items-center gap-1.5 text-xs px-2 py-1 border shrink-0 min-w-0",
                  style === "vite" &&
                    "bg-white/15 focus-within:border-white transition-colors rounded-md border-transparent text-white",
                  style === "98" &&
                    "bg-white text-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white",
                )}>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  type="text"
                  placeholder="Enter URL or search..."
                  className="grow outline-none bg-transparent min-w-0"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className={cn(
                    "text-xs flex items-center gap-1 px-3 py-1 shrink-0 font-medium",
                    style === "vite" &&
                      "rounded-md cursor-pointer bg-white text-black hover:opacity-80 disabled:opacity-50",
                    style === "98" &&
                      "bg-[#C0C0C0] text-black border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white disabled:opacity-50",
                  )}>
                  {isLoading ? (
                    <CgSpinner className="animate-spin text-sm" />
                  ) : (
                    <IoIosSearch className="text-sm" />
                  )}
                  <span>Go</span>
                </button>
              </form>

              {/* Open in New Tab Button */}
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                title="Open current page in new tab"
                className={cn(
                  "p-1.5 text-xs flex items-center justify-center outline-none shrink-0",
                  style === "vite" &&
                    "rounded-md bg-white/10 hover:bg-white/20 text-white",
                  style === "98" &&
                    "bg-[#C0C0C0] border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white text-black",
                )}>
                <FaExternalLinkAlt />
              </a>
            </div>

            {/* Bookmarks & Proxy Switch Bar */}
            <div className="flex items-center justify-between text-[11px] pb-0.5">
              <div className="flex items-center gap-1.5 overflow-x-auto min-w-0">
                <span
                  className={cn(
                    "font-semibold shrink-0",
                    style === "vite" && "text-white/50",
                    style === "98" && "text-black/70",
                  )}>
                  Bookmarks:
                </span>
                {QUICK_BOOKMARKS.map((bm) => (
                  <button
                    key={bm.name}
                    onClick={() => navigateTo(bm.url)}
                    className={cn(
                      "px-2 py-0.5 shrink-0 transition-colors",
                      style === "vite" &&
                        "rounded bg-white/10 hover:bg-white/20 text-white/80 hover:text-white",
                      style === "98" &&
                        "bg-[#C0C0C0] border border-t-white border-l-white border-r-black border-b-black text-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white",
                    )}>
                    {bm.name}
                  </button>
                ))}
              </div>

              {/* CORS Proxy Toggle */}
              <label
                className={cn(
                  "flex items-center gap-1 shrink-0 ml-2 cursor-pointer font-medium select-none",
                  style === "vite" && "text-white/70 hover:text-white",
                  style === "98" && "text-black/80",
                )}>
                <input
                  type="checkbox"
                  checked={useProxy}
                  onChange={(e) => {
                    setUseProxy(e.target.checked);
                    setIsLoading(true);
                  }}
                  className="size-3 accent-blue-600"
                />
                <span>CORS Proxy</span>
              </label>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div
            className={cn(
              "relative flex-1 min-h-0 w-full bg-white",
              style === "98" &&
                "border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white m-1",
            )}>
            {isLoading && !hasError && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center gap-2 z-10 text-black">
                <CgSpinner className="animate-spin size-6 text-blue-600" />
                <span className="text-xs font-semibold">
                  Loading Webpage...
                </span>
              </div>
            )}

            {hasError ? (
              <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center p-6 text-center text-black z-20">
                <FaExclamationTriangle className="size-10 text-amber-500 mb-3" />
                <h3 className="font-bold text-base mb-1">
                  Website Refused to Connect
                </h3>
                <p className="text-xs text-gray-600 max-w-md mb-5 leading-relaxed">
                  <span className="font-semibold">{url}</span> imposes iframe
                  security policies (<code>X-Frame-Options</code> or{" "}
                  <code>CSP</code>) that prevent it from being rendered inside
                  an embedded window.
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 text-xs font-semibold transition-all shadow-sm",
                    style === "vite" &&
                      "bg-blue-600 text-white rounded-md hover:bg-blue-700 active:scale-95",
                    style === "98" &&
                      "bg-[#C0C0C0] text-black border-2 border-t-white border-l-white border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white",
                  )}>
                  <span>Open Website in New Tab</span>
                  <FaExternalLinkAlt className="text-[10px]" />
                </a>
              </div>
            ) : (
              <iframe
                ref={iframeRef}
                key={`${url}-${useProxy}`}
                src={getIframeSrc(url)}
                title="Browser Viewport"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setHasError(true);
                }}
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}
          </div>
        </div>
      </section>
    </Rnd>
  );
};

export default Browser;
