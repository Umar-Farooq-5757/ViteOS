import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { Rnd } from "react-rnd";
import { ImNpm } from "react-icons/im";
import {
  IoArrowBackSharp,
  IoCheckmark,
  IoClose,
  IoCopyOutline,
} from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";
import { cn } from "../lib/utils";
import { FaRegWindowRestore, FaWindowMinimize } from "react-icons/fa";

interface NpmExplorerProps {
  onClose: () => void;
  style: string;
  onFocus: () => void;
  zIndex: number;
}

const packagesToShow = [
  "nuxt",
  "vue",
  "nitro",
  "react",
  "svelte",
  "vite",
  "vitest",
  "next",
  "astro",
  "typescript",
  "angular",
  "analog",
  "solid",
  "@umarfarooq57/trail",
  "@umarfarooq57/tasky",
];

const NpmExplorer: React.FC<NpmExplorerProps> = ({
  onClose,
  style,
  onFocus,
  zIndex,
}) => {
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageData = async (pkgName: string) => {
    const trimmed = pkgName.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const encodedPkg = trimmed.startsWith("@")
        ? `@${encodeURIComponent(trimmed.slice(1))}`
        : encodeURIComponent(trimmed);

      const res = await fetch(`https://registry.npmjs.org/${encodedPkg}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(`Package "${trimmed}" not found on npm registry.`);
        }
        throw new Error("Failed to fetch package data. Please try again.");
      }

      const response = await res.json();
      setData(response);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching package.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (textToCopy: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Window Resize & Maximize controls
  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 700,
    height: 500,
    x: 150,
    y: 150,
  });
  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 700,
    height: 500,
    x: 150,
    y: 150,
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

  // Extract variables safely
  const latestVersion = data?.["dist-tags"]?.latest;
  const dependencies =
    (latestVersion && data?.versions?.[latestVersion]?.dependencies) || {};
  const maintainers = Array.isArray(data?.maintainers) ? data.maintainers : [];
  const keywords = Array.isArray(data?.keywords) ? data.keywords : [];

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
      dragHandleClassName="handle"
      minWidth={450}
      minHeight={350}>
      <section
        className={cn(
          `flex flex-col ${isMaximized ? "w-full h-full" : "h-[75vh] w-[75vw]"} select-none border border-white/15 shadow-xl overflow-hidden`,
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
                <img
                  className="size-5"
                  src="/apps/npmexplorer.png"
                  alt="clock"
                />
                <span className="text-sm font-medium">Npm Explorer</span>
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
                <img
                  className="size-5"
                  src="/apps/npmexplorer.png"
                  alt="clock"
                />
                <span className="text-sm font-medium text-white">
                  Npm Explorer
                </span>
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

        {/* Content Body */}
        <div
          className={cn(
            "flex-1 flex flex-col py-3 px-3 overflow-hidden min-h-0 node-explorer",
            style === "vite" && "bg-white/8 text-white",
            style === "98" && "bg-[#c0c0c0] text-black pt-2",
          )}>
          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPackageData(inputValue);
            }}
            className={cn(
              "flex justify-between items-center text-xs px-2 py-1 shrink-0 gap-2",
              style === "vite" &&
                "bg-white/15 focus-within:border-white transition-colors rounded-md py-2 px-3 border border-transparent",
              style === "98" &&
                "bg-[#c0c0c0] border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white p-1",
            )}>
            <div
              className={cn(
                "flex-1 flex items-center",
                style === "98" &&
                  "bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white px-2 py-1",
              )}>
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                type="text"
                placeholder={
                  style === "98" ? "Search package..." : "/ search packages..."
                }
                className={cn(
                  "grow outline-none bg-transparent text-xs",
                  style === "98"
                    ? "text-black placeholder:text-gray-500 font-mono"
                    : "text-white",
                )}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className={cn(
                "text-black text-xs flex items-center justify-center gap-1 px-3 py-1 shrink-0 font-medium",
                style === "vite" &&
                  "rounded-md cursor-pointer bg-white hover:opacity-80 disabled:opacity-50 py-1.5 px-4",
                style === "98" &&
                  "bg-[#c0c0c0] text-black border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white disabled:opacity-50 disabled:border-gray-400",
              )}>
              {isLoading ? (
                <CgSpinner className="animate-spin text-xs" />
              ) : (
                <IoIosSearch className="text-sm" />
              )}
              <span>Search</span>
            </button>
          </form>

          {/* Loader */}
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-black">
              <CgSpinner
                className={cn(
                  "animate-spin text-3xl",
                  style === "vite" ? "text-white" : "text-black",
                )}
              />
              <span className="text-xs font-mono">
                Fetching package info...
              </span>
            </div>
          )}

          {/* Error Message */}
          {!isLoading && error && (
            <div className="flex-1 flex items-center justify-center">
              <div
                className={cn(
                  "text-sm px-4 py-3 text-center",
                  style === "vite" &&
                    "text-red-400 bg-red-500/10 border border-red-500/30 rounded-md",
                  style === "98" &&
                    "bg-white text-red-600 border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-mono",
                )}>
                {error}
              </div>
            </div>
          )}

          {/* Packages to show (when data is null) */}
          {!isLoading && !error && !data && (
            <div className="flex items-center justify-center gap-3 flex-wrap mx-auto max-w-lg my-auto p-4">
              {packagesToShow.map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => {
                    setInputValue(pkg);
                    fetchPackageData(pkg);
                  }}
                  className={cn(
                    "flex items-center gap-1 text-xs cursor-pointer",
                    style === "vite" &&
                      "border-b border-white/30 hover:border-green-500 hover:text-green-500 transition-all",
                    style === "98" &&
                      "bg-[#c0c0c0] text-black px-2 py-1 font-mono border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white",
                  )}>
                  {style === "vite" && (
                    <div className="size-1.5 bg-green-500 rounded-full" />
                  )}
                  <span>{pkg}</span>
                </button>
              ))}
            </div>
          )}

          {/* Package Data View */}
          {!isLoading && !error && data && (
            <div className="py-2 px-1 overflow-y-auto flex-1 min-h-0 space-y-3 mt-2">
              {/* Header */}
              <div
                className={cn(
                  "flex items-start justify-between gap-4 p-2",
                  style === "98" &&
                    "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
                )}>
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => {
                      setData(null);
                      setInputValue("");
                    }}
                    className={cn(
                      "p-1 text-sm",
                      style === "vite" &&
                        "rounded-md hover:bg-white/8 text-white",
                      style === "98" &&
                        "bg-[#c0c0c0] border-t border-l border-white border-r-2 border-b-2 border-r-black border-b-black active:border-t-black active:border-l-black",
                    )}>
                    <IoArrowBackSharp />
                  </button>
                  <div>
                    <h1 className="font-bold text-xl flex items-center gap-2 text-black">
                      <span className={cn(style === "vite" && "text-white")}>
                        {data.name}
                      </span>
                      {latestVersion && (
                        <span
                          className={cn(
                            "text-xs font-mono",
                            style === "vite" && "text-white/50",
                            style === "98" && "text-gray-700",
                          )}>
                          v{latestVersion}
                        </span>
                      )}
                    </h1>
                    {data.description && (
                      <p
                        className={cn(
                          "text-xs mt-0.5",
                          style === "vite" && "text-white/80",
                          style === "98" && "text-black",
                        )}>
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>
                {data.name && (
                  <button
                    onClick={() =>
                      window.open(
                        `https://npmjs.com/package/${data.name}`,
                        "_blank",
                      )
                    }
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 text-xs shrink-0 font-medium",
                      style === "vite" &&
                        "border-2 border-white/50 hover:bg-white hover:text-black transition-colors cursor-pointer text-white",
                      style === "98" &&
                        "bg-[#c0c0c0] text-black border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white",
                    )}>
                    <ImNpm className="text-red-600 text-sm" />
                    <span>npm registry</span>
                  </button>
                )}
              </div>

              {/* Get Started & Maintainers Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <p
                    className={cn(
                      "text-xs font-bold mb-1",
                      style === "vite" && "text-white/70",
                    )}>
                    Get started
                  </p>
                  <div
                    className={cn(
                      "py-1.5 px-3 flex items-center justify-between gap-2",
                      style === "vite" && "bg-black rounded-md text-white",
                      style === "98" &&
                        "bg-white border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-black",
                    )}>
                    <div className="flex items-center gap-2 text-xs font-mono truncate">
                      <span className="text-blue-700 font-bold">npm</span>
                      <span>install</span>
                      <span className="font-bold truncate">{data.name}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(`npm install ${data.name}`)}
                      className={cn(
                        "p-1 text-xs shrink-0",
                        style === "vite" &&
                          "hover:bg-white/15 rounded-full text-white",
                        style === "98" &&
                          "bg-[#c0c0c0] text-black border-t border-l border-white border-r border-b border-r-black border-b-black active:border-t-black active:border-l-black",
                      )}
                      title="Copy install command">
                      {copied ? (
                        <IoCheckmark className="text-green-600" />
                      ) : (
                        <IoCopyOutline />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p
                    className={cn(
                      "text-xs font-bold mb-1",
                      style === "vite" && "text-white/70",
                    )}>
                    Maintainers
                  </p>
                  {maintainers.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {maintainers.map((maintainer: any, idx: number) => (
                        <button
                          key={maintainer.name || idx}
                          className={cn(
                            "text-xs font-mono cursor-pointer",
                            style === "vite" &&
                              "hover:text-green-500 hover:underline text-white",
                            style === "98" &&
                              "bg-[#c0c0c0] text-black px-1.5 py-0.5 border-t border-l border-white border-r border-b border-r-black border-b-black active:border-t-black active:border-l-black",
                          )}
                          onClick={() =>
                            window.open(
                              `https://npmjs.com/~${maintainer.name}`,
                              "_blank",
                            )
                          }>
                          @{maintainer.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500">None listed</p>
                  )}
                </div>
              </div>

              {/* Keywords & Dependencies Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keywords.length > 0 && (
                  <div>
                    <p
                      className={cn(
                        "text-xs font-bold mb-1",
                        style === "vite" && "text-white/70",
                      )}>
                      Keywords
                    </p>
                    <div className="flex items-center gap-1 flex-wrap max-h-24 overflow-y-auto">
                      {keywords.map((keyword: string, idx: number) => (
                        <span
                          key={idx}
                          className={cn(
                            "px-1.5 py-0.5 text-xs font-mono",
                            style === "vite" &&
                              "bg-white/10 text-white rounded-sm",
                            style === "98" &&
                              "bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-black",
                          )}>
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p
                    className={cn(
                      "text-xs font-bold mb-1",
                      style === "vite" && "text-white/70",
                    )}>
                    Dependencies ({Object.keys(dependencies).length})
                  </p>
                  {Object.keys(dependencies).length > 0 ? (
                    <div className="flex items-center gap-1 flex-wrap max-h-24 overflow-y-auto">
                      {Object.entries(dependencies).map(
                        ([depName, depVersion]) => (
                          <button
                            key={depName}
                            className={cn(
                              "text-xs font-mono cursor-pointer",
                              style === "vite" &&
                                "hover:text-green-500 hover:underline text-white",
                              style === "98" &&
                                "bg-[#c0c0c0] text-black px-1.5 py-0.5 border-t border-l border-white border-r border-b border-r-black border-b-black active:border-t-black active:border-l-black",
                            )}
                            onClick={() => {
                              setInputValue(depName);
                              fetchPackageData(depName);
                            }}>
                            {depName}{" "}
                            <span className="text-[10px] text-gray-600">
                              ({depVersion as string})
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-xs italic text-gray-500">
                      No dependencies
                    </p>
                  )}
                </div>
              </div>

              {/* Readme */}
              {data.readme ? (
                <div className="mt-2">
                  <p
                    className={cn(
                      "text-xs font-bold mb-1",
                      style === "vite" && "text-white/70",
                    )}>
                    Readme
                  </p>
                  <div
                    className={cn(
                      "prose prose-sm max-w-none p-3 overflow-x-auto text-xs",
                      style === "vite" &&
                        "prose-invert text-white/90 bg-black/40 rounded-lg border border-white/10",
                      style === "98" &&
                        "bg-white text-black border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white font-sans",
                    )}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        code({
                          node,
                          inline,
                          className,
                          children,
                          ...props
                        }: any) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                background:
                                  style === "98"
                                    ? "#f0f0f0"
                                    : "rgba(0, 0, 0, 0.6)",
                                color: style === "98" ? "#000" : "#fff",
                                border:
                                  style === "98"
                                    ? "1px solid #808080"
                                    : "1px solid rgba(255, 255, 255, 0.1)",
                                padding: "0.5rem",
                                margin: "0.5rem 0",
                              }}
                              {...props}>
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className={cn(
                                "px-1 py-0.5 text-xs font-mono",
                                style === "vite" &&
                                  "bg-white/10 text-blue-400 rounded",
                                style === "98" &&
                                  "bg-[#e0e0e0] text-black border border-gray-400",
                              )}
                              {...props}>
                              {children}
                            </code>
                          );
                        },
                        hr: ({ node, ...props }) => (
                          <hr
                            className={cn(
                              "my-3",
                              style === "98"
                                ? "border-t border-gray-400"
                                : "border-t border-white/20",
                            )}
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-inside my-2 space-y-0.5 pl-2"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal list-inside my-2 space-y-0.5 pl-2"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="text-xs leading-relaxed" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-lg font-bold mt-4 mb-2 border-b pb-0.5"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-base font-bold mt-3 mb-1 border-b pb-0.5"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-sm font-semibold mt-2 mb-1"
                            {...props}
                          />
                        ),
                      }}>
                      {data.readme}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <p className="text-xs italic text-gray-500 mt-2">
                  No README provided for this package.
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </Rnd>
  );
};

export default NpmExplorer;
