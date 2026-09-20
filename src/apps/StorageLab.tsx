import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Rnd } from "react-rnd";
import { CgSpinner } from "react-icons/cg";
import { IoIosSearch } from "react-icons/io";
import { FaRegWindowRestore, FaWindowMinimize } from "react-icons/fa";
import {
  IoAddOutline,
  IoCheckmark,
  IoClose,
  IoCopyOutline,
  IoCreateOutline,
  IoLockClosedOutline,
  IoRefresh,
  IoTrashOutline,
} from "react-icons/io5";
import { cn } from "../lib/utils";
import {
  STORAGE_TABS,
  clearStorage,
  createEntry,
  deleteEntry,
  formatBytes,
  readStorage,
  safeParse,
  writeEntry,
  type StorageEntry,
  type StorageKind,
} from "../lib/storage";
import type { ExpandSignal } from "../components/JsonTree";
import JsonTree from "../components/JsonTree";

interface StorageLabProps {
  onClose: () => void;
  style: string;
  onFocus: () => void;
  zIndex: number;
}

const CAN_ADD: StorageKind[] = ["local", "session", "cookies"];

const StorageLab: React.FC<StorageLabProps> = ({
  onClose,
  style,
  onFocus,
  zIndex,
}) => {
  const [activeTab, setActiveTab] = useState<StorageKind>("local");
  const [entries, setEntries] = useState<StorageEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"tree" | "raw">("tree");
  const [expandSignal, setExpandSignal] = useState<ExpandSignal>({
    version: 0,
    open: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const [confirming, setConfirming] = useState<"entry" | "all" | null>(null);
  const [copied, setCopied] = useState(false);

  /* ---------------------------------------------------------------- */
  /* data                                                              */
  /* ---------------------------------------------------------------- */

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await readStorage(activeTab);
      setEntries(result);
    } catch (err: any) {
      setEntries([]);
      setError(err?.message || "Couldn't read this storage area.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    refresh();
    setSelectedId(null);
    setIsEditing(false);
    setIsAdding(false);
    setConfirming(null);
    setSearch("");
  }, [refresh]);

  // Keep local storage in sync when another tab writes to it.
  useEffect(() => {
    if (activeTab !== "local") return;
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [activeTab, refresh]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter(
      (entry) =>
        entry.key.toLowerCase().includes(needle) ||
        entry.raw.toLowerCase().includes(needle),
    );
  }, [entries, search]);

  const groups = useMemo(() => {
    const map = new Map<string, StorageEntry[]>();
    filtered.forEach((entry) => {
      const label = entry.group ?? "";
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(entry);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const selected = useMemo(
    () => filtered.find((entry) => entry.id === selectedId) ?? null,
    [filtered, selectedId],
  );

  const parsedValue = useMemo(
    () => (selected ? safeParse(selected.raw) : null),
    [selected],
  );

  const totalSize = useMemo(
    () => entries.reduce((sum, entry) => sum + entry.size, 0),
    [entries],
  );

  /* ---------------------------------------------------------------- */
  /* actions                                                           */
  /* ---------------------------------------------------------------- */

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const startEditing = () => {
    if (!selected) return;
    const { isJson } = safeParse(selected.raw);
    setDraft(
      isJson ? JSON.stringify(JSON.parse(selected.raw), null, 2) : selected.raw,
    );
    setEditError(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selected) return;

    // IndexedDB records must round-trip as JSON; everything else can be plain text.
    const needsJson =
      activeTab === "indexeddb" || safeParse(selected.raw).isJson;
    if (needsJson) {
      try {
        JSON.parse(draft);
      } catch (err: any) {
        setEditError(err?.message || "That isn't valid JSON.");
        return;
      }
    }

    try {
      await writeEntry(activeTab, selected, draft);
      setIsEditing(false);
      setEditError(null);
      await refresh();
    } catch (err: any) {
      setEditError(err?.message || "Couldn't save this value.");
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deleteEntry(activeTab, selected);
      setSelectedId(null);
      setConfirming(null);
      await refresh();
    } catch (err: any) {
      setError(err?.message || "Couldn't delete this entry.");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearStorage(activeTab, entries);
      setSelectedId(null);
      setConfirming(null);
      await refresh();
    } catch (err: any) {
      setError(err?.message || "Couldn't clear this storage area.");
    }
  };

  const handleAdd = async () => {
    if (!newKey.trim()) return;
    try {
      await createEntry(activeTab, newKey.trim(), newValue);
      setNewKey("");
      setNewValue("");
      setIsAdding(false);
      await refresh();
    } catch (err: any) {
      setError(err?.message || "Couldn't add this entry.");
    }
  };

  const toggleExpandAll = () =>
    setExpandSignal((previous) => ({
      version: previous.version + 1,
      open: !previous.open,
    }));

  /* ---------------------------------------------------------------- */
  /* window controls                                                   */
  /* ---------------------------------------------------------------- */

  const [isMaximized, setIsMaximized] = useState(false);
  const [prevSize, setPrevSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 820,
    height: 560,
    x: 120,
    y: 90,
  });
  const [currentSize, setCurrentSize] = useState<{
    width: number | string;
    height: number | string;
    x: number;
    y: number;
  }>({
    width: 820,
    height: 560,
    x: 120,
    y: 90,
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

  /* ---------------------------------------------------------------- */
  /* shared class helpers                                              */
  /* ---------------------------------------------------------------- */

  const sunken =
    "border-2 border-t-[#808080] border-l-[#808080] border-r-white border-b-white";
  const raised =
    "border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-black border-b-black active:border-t-black active:border-l-black active:border-r-white active:border-b-white";

  const toolButton = (extra?: string) =>
    cn(
      "flex items-center gap-1 px-2 py-1 text-xs shrink-0 disabled:opacity-50",
      style === "vite" &&
        "rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors",
      style === "98" && `bg-[#c0c0c0] text-black font-mono ${raised}`,
      extra,
    );

  const panel = cn(
    style === "vite" && "bg-black/30 rounded-md border border-white/10",
    style === "98" && `bg-white ${sunken}`,
  );

  const mutedText = style === "vite" ? "text-white/50" : "text-[#404040]";

  /* ---------------------------------------------------------------- */
  /* render                                                            */
  /* ---------------------------------------------------------------- */

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
      minWidth={560}
      minHeight={380}>
      <section
        className={cn(
          "flex flex-col w-full h-full select-none border border-white/15 shadow-xl overflow-hidden",
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
                  src="/apps/storagelab.png"
                  alt="storage lab"
                />
                <span className="text-sm font-medium">Storage Lab</span>
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
                  src="/apps/storagelab.png"
                  alt="storage lab"
                />
                <span className="text-sm font-medium text-white">
                  Storage Lab
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

        {/* Body */}
        <div
          className={cn(
            "flex-1 flex flex-col min-h-0 overflow-hidden",
            style === "vite" && "bg-white/8 text-white",
            style === "98" && "bg-[#c0c0c0] text-black",
          )}>
          {/* Tab strip */}
          <div
            className={cn(
              "flex items-end gap-0.5 shrink-0 px-2 pt-2",
              style === "vite" && "gap-1 pb-2",
              style === "98" && "border-b-2 border-b-white",
            )}>
            {STORAGE_TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "text-xs shrink-0",
                    style === "vite" &&
                      cn(
                        "rounded-md px-3 py-1.5 font-medium transition-colors",
                        isActive
                          ? "bg-white text-black"
                          : "text-white/70 hover:bg-white/10",
                      ),
                    style === "98" &&
                      cn(
                        "bg-[#c0c0c0] text-black font-mono px-3 border-t-2 border-l-2 border-white border-r-2 border-r-[#808080]",
                        isActive
                          ? "py-1.5 font-bold -mb-0.5 relative z-10"
                          : "py-1 text-[#404040]",
                      ),
                  )}>
                  {tab.short}
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div
            className={cn(
              "flex items-center gap-2 shrink-0 px-3 py-2",
              style === "98" && "border-t-2 border-t-white",
            )}>
            <div
              className={cn(
                "flex-1 flex items-center gap-1.5 min-w-0",
                style === "vite" &&
                  "bg-white/15 focus-within:border-white transition-colors rounded-md py-1.5 px-3 border border-transparent",
                style === "98" && `bg-white px-2 py-1 ${sunken}`,
              )}>
              <IoIosSearch
                className={cn(
                  "text-sm shrink-0",
                  style === "98" && "text-[#404040]",
                )}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder={
                  style === "98"
                    ? "Filter keys and values..."
                    : "/ filter keys and values..."
                }
                className={cn(
                  "grow outline-none bg-transparent text-xs min-w-0",
                  style === "98"
                    ? "text-black placeholder:text-gray-500 font-mono"
                    : "text-white placeholder:text-white/40",
                )}
              />
            </div>

            {CAN_ADD.includes(activeTab) && (
              <button
                onClick={() => setIsAdding((previous) => !previous)}
                className={toolButton()}
                title="Add an entry">
                <IoAddOutline className="text-sm" />
                <span>Add</span>
              </button>
            )}

            <button
              onClick={refresh}
              disabled={isLoading}
              className={toolButton()}
              title="Reload this storage area">
              {isLoading ? (
                <CgSpinner className="animate-spin text-sm" />
              ) : (
                <IoRefresh className="text-sm" />
              )}
              <span>Refresh</span>
            </button>
          </div>

          {/* Add form */}
          {isAdding && CAN_ADD.includes(activeTab) && (
            <div
              className={cn(
                "shrink-0 mx-3 mb-2 p-2 flex items-center gap-2",
                panel,
              )}>
              <input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="key"
                className={cn(
                  "w-1/3 text-xs font-mono outline-none px-2 py-1 min-w-0",
                  style === "vite" &&
                    "bg-white/10 rounded-sm text-white placeholder:text-white/40",
                  style === "98" && `bg-white text-black ${sunken}`,
                )}
              />
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder='value — text or JSON, e.g. {"theme":"98"}'
                className={cn(
                  "flex-1 text-xs font-mono outline-none px-2 py-1 min-w-0",
                  style === "vite" &&
                    "bg-white/10 rounded-sm text-white placeholder:text-white/40",
                  style === "98" && `bg-white text-black ${sunken}`,
                )}
              />
              <button
                onClick={handleAdd}
                disabled={!newKey.trim()}
                className={cn(
                  "text-xs px-3 py-1 shrink-0 font-medium disabled:opacity-50",
                  style === "vite" &&
                    "rounded-md bg-white text-black hover:opacity-80",
                  style === "98" &&
                    `bg-[#c0c0c0] text-black font-mono ${raised}`,
                )}>
                Save
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className={cn(
                "shrink-0 mx-3 mb-2 text-xs px-3 py-2",
                style === "vite" &&
                  "text-red-400 bg-red-500/10 border border-red-500/30 rounded-md",
                style === "98" &&
                  `bg-white text-red-700 font-mono ${sunken} px-2 py-1`,
              )}>
              {error}
            </div>
          )}

          {/* Main split */}
          <div className="flex-1 flex min-h-0 gap-2 px-3 pb-2">
            {/* Key list */}
            <aside
              className={cn(
                "w-[34%] min-w-[140px] max-w-[280px] overflow-y-auto min-h-0",
                panel,
              )}>
              {isLoading && entries.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-2">
                  <CgSpinner
                    className={cn(
                      "animate-spin text-2xl",
                      style === "vite" ? "text-white" : "text-black",
                    )}
                  />
                  <span className={cn("text-[10px] font-mono", mutedText)}>
                    Reading storage...
                  </span>
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className={cn(
                    "h-full flex items-center justify-center text-center text-xs px-4",
                    mutedText,
                  )}>
                  {search
                    ? "Nothing matches that filter."
                    : "This storage area is empty."}
                </div>
              ) : (
                groups.map(([groupLabel, groupEntries]) => (
                  <div key={groupLabel || "ungrouped"}>
                    {groupLabel && (
                      <div
                        className={cn(
                          "px-2 py-1 text-[10px] font-mono sticky top-0 truncate",
                          style === "vite" &&
                            "bg-black/60 text-white/60 backdrop-blur-sm",
                          style === "98" &&
                            "bg-[#c0c0c0] text-black font-bold border-b border-[#808080]",
                        )}
                        title={groupLabel}>
                        {groupLabel}
                      </div>
                    )}
                    {groupEntries.map((entry) => {
                      const isActive = entry.id === selectedId;
                      return (
                        <button
                          key={entry.id}
                          onClick={() => {
                            setSelectedId(entry.id);
                            setIsEditing(false);
                            setConfirming(null);
                          }}
                          className={cn(
                            "w-full text-left px-2 py-1.5 flex items-center justify-between gap-2",
                            style === "vite" &&
                              cn(
                                "text-xs transition-colors",
                                isActive
                                  ? "bg-white/15 text-white"
                                  : "text-white/70 hover:bg-white/8",
                              ),
                            style === "98" &&
                              cn(
                                "text-xs font-mono",
                                isActive
                                  ? "bg-[#000080] text-white"
                                  : "text-black hover:bg-[#000080]/10",
                              ),
                          )}>
                          <span className="truncate" title={entry.key}>
                            {entry.key}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] shrink-0 font-mono",
                              isActive
                                ? "opacity-80"
                                : style === "vite"
                                  ? "text-white/40"
                                  : "text-[#606060]",
                            )}>
                            {formatBytes(entry.size)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </aside>

            {/* Inspector */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 gap-2">
              {!selected ? (
                <div
                  className={cn(
                    "flex-1 flex items-center justify-center text-center text-xs px-6",
                    panel,
                    mutedText,
                  )}>
                  Pick an entry on the left to inspect its value.
                </div>
              ) : (
                <>
                  {/* Inspector header */}
                  <div
                    className={cn(
                      "shrink-0 px-2 py-2 flex items-start justify-between gap-2",
                      style === "vite" &&
                        "bg-black/30 rounded-md border border-white/10",
                      style === "98" &&
                        "bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-[#808080] border-b-[#808080]",
                    )}>
                    <div className="min-w-0">
                      <p
                        className="text-sm font-bold truncate"
                        title={selected.key}>
                        {selected.key}
                      </p>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 flex-wrap mt-1 text-[10px] font-mono",
                          mutedText,
                        )}>
                        <span>{formatBytes(selected.size)}</span>
                        <span>
                          {parsedValue?.isJson ? "JSON" : "plain text"}
                        </span>
                        {selected.meta &&
                          Object.entries(selected.meta).map(
                            ([label, value]) => (
                              <span
                                key={label}
                                className={cn(
                                  "px-1.5 py-0.5",
                                  style === "vite" &&
                                    "bg-white/10 rounded-sm text-white/70",
                                  style === "98" &&
                                    "bg-white border border-t-[#808080] border-l-[#808080] border-r-white border-b-white text-black",
                                )}>
                                {label}: {value}
                              </span>
                            ),
                          )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() =>
                          setView(view === "tree" ? "raw" : "tree")
                        }
                        className={toolButton()}
                        title="Switch between tree and raw text">
                        {view === "tree" ? "Raw" : "Tree"}
                      </button>
                      {view === "tree" && parsedValue?.isJson && (
                        <button
                          onClick={toggleExpandAll}
                          className={toolButton()}
                          title="Expand or collapse every node">
                          {expandSignal.open ? "Collapse" : "Expand"}
                        </button>
                      )}
                      <button
                        onClick={() => handleCopy(selected.raw)}
                        className={toolButton()}
                        title="Copy value">
                        {copied ? (
                          <IoCheckmark className="text-sm text-green-600" />
                        ) : (
                          <IoCopyOutline className="text-sm" />
                        )}
                      </button>
                      {selected.editable ? (
                        <button
                          onClick={startEditing}
                          disabled={isEditing}
                          className={toolButton()}
                          title="Edit value">
                          <IoCreateOutline className="text-sm" />
                        </button>
                      ) : (
                        <span
                          className={cn(
                            "flex items-center px-2 py-1",
                            mutedText,
                          )}
                          title="Cached responses are read-only">
                          <IoLockClosedOutline className="text-sm" />
                        </span>
                      )}
                      {confirming === "entry" ? (
                        <>
                          <button
                            onClick={handleDelete}
                            className={toolButton(
                              style === "vite"
                                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300"
                                : "",
                            )}>
                            Delete
                          </button>
                          <button
                            onClick={() => setConfirming(null)}
                            className={toolButton()}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setConfirming("entry")}
                          className={toolButton()}
                          title="Delete entry">
                          <IoTrashOutline className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Value */}
                  <div
                    className={cn(
                      "flex-1 min-h-0 overflow-auto p-2",
                      style === "vite" &&
                        "bg-black/40 rounded-md border border-white/10",
                      style === "98" && `bg-white ${sunken}`,
                    )}>
                    {isEditing ? (
                      <div className="h-full flex flex-col gap-2">
                        <textarea
                          value={draft}
                          onChange={(e) => {
                            setDraft(e.target.value);
                            setEditError(null);
                          }}
                          spellCheck={false}
                          className={cn(
                            "flex-1 min-h-0 w-full resize-none outline-none text-xs font-mono p-2",
                            style === "vite" &&
                              "bg-black/60 text-white rounded-sm border border-white/15 focus:border-white/40",
                            style === "98" && `bg-white text-black ${sunken}`,
                          )}
                        />
                        {editError && (
                          <p
                            className={cn(
                              "text-[10px] font-mono",
                              style === "vite"
                                ? "text-red-400"
                                : "text-red-700",
                            )}>
                            {editError}
                          </p>
                        )}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleSave}
                            className={cn(
                              "text-xs px-3 py-1 font-medium",
                              style === "vite" &&
                                "rounded-md bg-white text-black hover:opacity-80",
                              style === "98" &&
                                `bg-[#c0c0c0] text-black font-mono ${raised}`,
                            )}>
                            Save changes
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditError(null);
                            }}
                            className={toolButton()}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : view === "tree" ? (
                      <JsonTree
                        data={parsedValue?.parsed}
                        style={style}
                        rootName={selected.key}
                        expandSignal={expandSignal}
                        defaultExpandedDepth={2}
                      />
                    ) : (
                      <pre
                        className={cn(
                          "text-xs font-mono whitespace-pre-wrap break-all",
                          style === "vite" ? "text-white/90" : "text-black",
                        )}>
                        {selected.raw}
                      </pre>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div
            className={cn(
              "shrink-0 flex items-center justify-between gap-2 px-3 py-1.5 text-[10px] font-mono",
              style === "vite" && "border-t border-white/10 text-white/50",
              style === "98" && "border-t-2 border-t-white text-black",
            )}>
            <span>
              {filtered.length} of {entries.length}{" "}
              {entries.length === 1 ? "entry" : "entries"} ·{" "}
              {formatBytes(totalSize)}
            </span>
            {entries.length > 0 &&
              (confirming === "all" ? (
                <span className="flex items-center gap-2">
                  <span>Clear everything in this area?</span>
                  <button
                    onClick={handleClearAll}
                    className={cn(
                      "underline",
                      style === "vite" ? "text-red-400" : "text-red-700",
                    )}>
                    Clear
                  </button>
                  <button
                    onClick={() => setConfirming(null)}
                    className="underline">
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirming("all")}
                  className={cn(
                    "underline",
                    style === "vite"
                      ? "hover:text-white"
                      : "hover:text-[#000080]",
                  )}>
                  Clear this area
                </button>
              ))}
          </div>
        </div>
      </section>
    </Rnd>
  );
};

export default StorageLab;
