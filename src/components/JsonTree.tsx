import React, { useEffect, useState } from "react";
import { IoChevronDown, IoChevronForward } from "react-icons/io5";
import { cn } from "../lib/utils";

export interface ExpandSignal {
  /** Bumped every time the user hits expand/collapse all. */
  version: number;
  open: boolean;
}

interface JsonTreeProps {
  data: unknown;
  style: string;
  rootName?: string;
  expandSignal?: ExpandSignal;
  /** Nodes shallower than this start open. */
  defaultExpandedDepth?: number;
}

interface TreeNodeProps extends JsonTreeProps {
  nodeKey: string;
  depth: number;
  isLast: boolean;
}

const CHUNK = 100;

type ValueKind =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined"
  | "array"
  | "object";

const kindOf = (value: unknown): ValueKind => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return "array";
  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") return type;
  return "object";
};

const isBranch = (value: unknown) =>
  kindOf(value) === "object" || kindOf(value) === "array";

const valueClass = (kind: ValueKind, style: string) => {
  if (style === "98") {
    switch (kind) {
      case "string":
        return "text-[#008000]";
      case "number":
        return "text-[#800000]";
      case "boolean":
        return "text-[#800080]";
      case "null":
      case "undefined":
        return "text-[#808080]";
      default:
        return "text-black";
    }
  }
  switch (kind) {
    case "string":
      return "text-emerald-400";
    case "number":
      return "text-amber-400";
    case "boolean":
      return "text-purple-400";
    case "null":
    case "undefined":
      return "text-white/40";
    default:
      return "text-white";
  }
};

const printPrimitive = (value: unknown): string => {
  const kind = kindOf(value);
  if (kind === "string") return `"${value as string}"`;
  if (kind === "null") return "null";
  if (kind === "undefined") return "undefined";
  return String(value);
};

const summarise = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.length === 1 ? "1 item" : `${value.length} items`;
  }
  const count = Object.keys(value as object).length;
  return count === 1 ? "1 key" : `${count} keys`;
};

const TreeNode: React.FC<TreeNodeProps> = ({
  data,
  style,
  nodeKey,
  depth,
  isLast,
  expandSignal,
  defaultExpandedDepth = 1,
}) => {
  const branch = isBranch(data);
  const [isOpen, setIsOpen] = useState(branch && depth < defaultExpandedDepth);
  const [visibleCount, setVisibleCount] = useState(CHUNK);

  // Respond to the toolbar's expand-all / collapse-all button.
  useEffect(() => {
    if (!expandSignal || expandSignal.version === 0) return;
    if (branch) setIsOpen(expandSignal.open);
  }, [expandSignal?.version, expandSignal?.open, branch]);

  const kind = kindOf(data);

  const keyClass = style === "98" ? "text-[#000080] font-bold" : "text-sky-300";

  const punctuationClass = style === "98" ? "text-[#404040]" : "text-white/35";

  const rowClass = cn(
    "group flex items-start gap-1 text-xs font-mono leading-5 px-1 -mx-1",
    style === "vite" && "hover:bg-white/8 rounded-sm",
    style === "98" && "hover:bg-[#000080] hover:text-white",
  );

  if (!branch) {
    return (
      <div className={rowClass}>
        <span className="w-3.5 shrink-0" />
        <span className={cn("shrink-0", keyClass)}>{nodeKey}</span>
        <span className={punctuationClass}>:</span>
        <span className={cn("break-all", valueClass(kind, style))}>
          {printPrimitive(data)}
        </span>
        {!isLast && <span className={punctuationClass}>,</span>}
      </div>
    );
  }

  const childEntries: [string, unknown][] = Array.isArray(data)
    ? data.map((item, index) => [String(index), item])
    : Object.entries(data as Record<string, unknown>);

  const open = Array.isArray(data) ? "[" : "{";
  const close = Array.isArray(data) ? "]" : "}";
  const shown = childEntries.slice(0, visibleCount);
  const remaining = childEntries.length - shown.length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((previous) => !previous)}
        className={cn(rowClass, "w-full text-left cursor-pointer")}>
        <span className="w-3.5 shrink-0 flex items-center justify-center pt-0.5">
          {isOpen ? (
            <IoChevronDown className="text-[10px]" />
          ) : (
            <IoChevronForward className="text-[10px]" />
          )}
        </span>
        <span className={cn("shrink-0", keyClass)}>{nodeKey}</span>
        <span className={punctuationClass}>:</span>
        <span className={punctuationClass}>{open}</span>
        {!isOpen && (
          <>
            <span
              className={cn(
                "px-1 text-[10px]",
                style === "vite" && "text-white/45",
                style === "98" && "text-[#606060] group-hover:text-white",
              )}>
              {summarise(data)}
            </span>
            <span className={punctuationClass}>{close}</span>
            {!isLast && <span className={punctuationClass}>,</span>}
          </>
        )}
      </button>

      {isOpen && (
        <div
          className={cn(
            "ml-2 pl-2 border-l",
            style === "vite" && "border-white/15",
            style === "98" && "border-[#808080] border-dotted",
          )}>
          {shown.map(([childKey, childValue], index) => (
            <TreeNode
              key={childKey}
              nodeKey={childKey}
              data={childValue}
              style={style}
              depth={depth + 1}
              isLast={index === childEntries.length - 1}
              expandSignal={expandSignal}
              defaultExpandedDepth={defaultExpandedDepth}
            />
          ))}

          {remaining > 0 && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + CHUNK)}
              className={cn(
                "text-[10px] font-mono mt-0.5 ml-4 px-1.5 py-0.5 cursor-pointer",
                style === "vite" &&
                  "text-white/60 hover:text-white bg-white/8 rounded-sm",
                style === "98" &&
                  "bg-[#c0c0c0] text-black border-t border-l border-white border-r border-b border-r-black border-b-black active:border-t-black active:border-l-black",
              )}>
              Show {Math.min(remaining, CHUNK)} more
            </button>
          )}
        </div>
      )}

      {isOpen && (
        <div className={cn("flex text-xs font-mono", punctuationClass)}>
          <span className="w-3.5 shrink-0" />
          <span>
            {close}
            {!isLast && ","}
          </span>
        </div>
      )}
    </div>
  );
};

const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  style,
  rootName = "root",
  expandSignal,
  defaultExpandedDepth = 1,
}) => {
  // A bare string (a value that wasn't JSON) reads better without tree chrome.
  if (typeof data === "string") {
    return (
      <pre
        className={cn(
          "text-xs font-mono whitespace-pre-wrap break-all p-2",
          style === "vite" && "text-emerald-400",
          style === "98" && "text-[#008000]",
        )}>
        {data}
      </pre>
    );
  }

  return (
    <div className="py-1">
      <TreeNode
        nodeKey={rootName}
        data={data}
        style={style}
        depth={0}
        isLast
        expandSignal={expandSignal}
        defaultExpandedDepth={defaultExpandedDepth}
      />
    </div>
  );
};

export default JsonTree;
