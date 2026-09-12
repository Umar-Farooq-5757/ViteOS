import React, { useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { Rnd } from "react-rnd";
import { ImNpm } from "react-icons/im";
import { IoArrowBackSharp, IoCheckmark, IoCopyOutline } from "react-icons/io5";
import { CgSpinner } from "react-icons/cg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeRaw from "rehype-raw";

interface NpmExplorerProps {
  onClose: () => void;
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

const NpmExplorer: React.FC<NpmExplorerProps> = ({ onClose }) => {
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
        className={`flex flex-col ${
          isMaximized ? "w-full h-full" : "h-150 w-200"
        } bg-black text-white select-none border border-white/15 rounded-lg shadow-xl overflow-hidden`}>
        {/* Title Bar */}
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-white/4 shrink-0">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/apps/npmexplorer.png" alt="clock" />
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
        </div>

        <div className="h-0.5 w-full bg-white/15 shrink-0" />

        {/* Content Body */}
        <div className="bg-white/8 flex-1 flex flex-col py-3 px-3 overflow-hidden min-h-0 node-explorer">
          {/* Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPackageData(inputValue);
            }}
            className="bg-white/15 flex justify-between items-center text-xs rounded-md px-3 py-2 border border-transparent focus-within:border-white transition-colors shrink-0">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              type="text"
              placeholder="/ search packages..."
              className="grow outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="text-black text-sm bg-white flex items-center gap-1 rounded-md px-4 py-1.5 hover:opacity-80 disabled:opacity-50 cursor-pointer shrink-0">
              {isLoading ? (
                <CgSpinner className="animate-spin text-sm" />
              ) : (
                <IoIosSearch />
              )}
              <span>search</span>
            </button>
          </form>

          {/* Loader */}
          {isLoading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-white/60">
              <CgSpinner className="animate-spin text-3xl text-white" />
              <span className="text-xs">Fetching package info...</span>
            </div>
          )}

          {/* Error Message */}
          {!isLoading && error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-md text-center">
                {error}
              </div>
            </div>
          )}

          {/* Packages to show (when data is null) */}
          {!isLoading && !error && !data && (
            <div className="flex items-center justify-center gap-6 flex-wrap mx-auto max-w-1/2 h-1/3 my-auto mt-20">
              {packagesToShow.map((pkg) => (
                <div
                  key={pkg}
                  onClick={() => {
                    setInputValue(pkg);
                    fetchPackageData(pkg);
                  }}
                  className="flex items-center gap-1 cursor-pointer">
                  <div className="size-1.5 bg-green-500 rounded-full" />
                  <div className="border-b border-white/30 hover:border-green-500 hover:text-green-500 transition-all text-xs">
                    {pkg}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Package Data View */}
          {!isLoading && !error && data && (
            <div className="py-4 px-1 overflow-y-auto flex-1 min-h-0 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="max-w-3/4 flex items-start gap-3">
                  <button
                    onClick={() => {
                      setData(null);
                      setInputValue("");
                    }}
                    className="p-1 rounded-md hover:bg-white/8">
                    <IoArrowBackSharp />
                  </button>
                  <div>
                    <h1 className="font-bold text-2xl flex items-center gap-2">
                      {data.name}
                      {latestVersion && (
                        <span className="text-xs text-white/50 font-mono">
                          v{latestVersion}
                        </span>
                      )}
                    </h1>
                    {data.description && (
                      <p className="text-sm text-white/80 mt-1">
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
                    className="flex items-center gap-2 border-2 border-white/50 px-3 py-1 cursor-pointer hover:bg-white hover:text-black shrink-0 transition-colors">
                    <ImNpm />
                    <span>View on npm</span>
                  </button>
                )}
              </div>

              <div className="w-full h-0.5 bg-white/15" />

              {/* Get Started & Maintainers Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <p className="text-sm font-semibold text-white/70 mb-2">
                    Get started
                  </p>
                  <div className="bg-black rounded-md py-2 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 opacity-70 text-sm font-mono truncate">
                      <span>npm</span>
                      <span>install</span>
                      <span className="truncate">{data.name}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(`npm install ${data.name}`)}
                      className="hover:bg-white/15 p-2 rounded-full transition-all shrink-0"
                      title="Copy install command">
                      {copied ? <IoCheckmark /> : <IoCopyOutline />}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">
                    Maintainers
                  </p>
                  {maintainers.length > 0 ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {maintainers.map((maintainer: any, idx: number) => (
                        <div
                          key={maintainer.name || idx}
                          className="hover:text-green-500 hover:underline cursor-pointer text-xs"
                          onClick={() =>
                            window.open(
                              `https://npmjs.com/~${maintainer.name}`,
                              "_blank",
                            )
                          }>
                          @{maintainer.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic">None listed</p>
                  )}
                </div>
              </div>

              <div className="w-full h-0.5 bg-white/15" />

              {/* Keywords & Dependencies Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keywords.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-white/70 mb-2">
                      Keywords
                    </p>
                    <div className="flex items-center gap-2 flex-wrap max-h-28 overflow-y-auto">
                      {keywords.map((keyword: string, idx: number) => (
                        <div
                          key={idx}
                          className="bg-white/10 rounded-sm py-0.5 px-2 text-xs">
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-white/70 mb-2">
                    Dependencies ({Object.keys(dependencies).length})
                  </p>
                  {Object.keys(dependencies).length > 0 ? (
                    <div className="flex items-center gap-x-3 gap-y-1 flex-wrap max-h-28 overflow-y-auto">
                      {Object.entries(dependencies).map(
                        ([depName, depVersion]) => (
                          <div
                            key={depName}
                            className="hover:text-green-500 hover:underline cursor-pointer text-xs"
                            onClick={() => {
                              setInputValue(depName);
                              fetchPackageData(depName);
                            }}>
                            {depName}{" "}
                            <span className="text-white/50 text-[10px]">
                              ({depVersion as string})
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic">
                      No dependencies
                    </p>
                  )}
                </div>
              </div>

              <div className="w-full h-0.5 bg-white/15" />

              {/* Readme */}
              {data.readme ? (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-white/70 mb-2">
                    Readme
                  </p>
                  <div className="prose prose-invert prose-sm max-w-none bg-black/40 p-4 rounded-lg border border-white/10 overflow-x-auto text-white/90">
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
                                background: "rgba(0, 0, 0, 0.6)",
                                borderRadius: "0.375rem",
                                padding: "1rem",
                                margin: "0.75rem 0",
                                border: "1px solid rgba(255, 255, 255, 0.1)",
                              }}
                              {...props}>
                              {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                          ) : (
                            <code
                              className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-blue-400 font-mono"
                              {...props}>
                              {children}
                            </code>
                          );
                        },
                        hr: ({ node, ...props }) => (
                          <hr
                            className="my-6 border-t border-white/20"
                            {...props}
                          />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul
                            className="list-disc list-inside my-3 space-y-1 pl-2"
                            {...props}
                          />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol
                            className="list-decimal list-inside my-3 space-y-1 pl-2"
                            {...props}
                          />
                        ),
                        li: ({ node, ...props }) => (
                          <li
                            className="text-sm text-white/90 leading-relaxed"
                            {...props}
                          />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1
                            className="text-2xl font-bold mt-6 mb-3 border-b border-white/10 pb-1"
                            {...props}
                          />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2
                            className="text-xl font-semibold mt-5 mb-2 border-b border-white/10 pb-1"
                            {...props}
                          />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3
                            className="text-lg font-medium mt-4 mb-2"
                            {...props}
                          />
                        ),
                      }}>
                      {data.readme}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/40 italic mt-2">
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
