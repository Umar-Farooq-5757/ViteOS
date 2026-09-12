import React, { useState, useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import { Rnd } from "react-rnd";

interface CompilerProps {
  onClose: () => void;
}

const DEFAULT_CODES: Record<string, string> = {
  python: `# Python WebAssembly Execution
def greet(name):
    return f"Hello, {name} from Pyodide (WASM)!"

print(greet("WebOS User"))
for i in range(1, 4):
    print(f"Counting: {i}")
`,
  javascript: `// JavaScript Browser V8 Execution
const greet = (name) => \`Hello, \${name} from JS Engine!\`;

console.log(greet("WebOS User"));
[1, 2, 3].forEach((i) => console.log(\`Counting: \${i}\`));
`,
};

// Declare Pyodide global window type
declare global {
  interface Window {
    loadPyodide?: any;
    pyodide?: any;
  }
}

const Compiler: React.FC<CompilerProps> = ({ onClose }) => {
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(DEFAULT_CODES.python);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);

  // Sync sample code on language change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    setCode(DEFAULT_CODES[newLang] || "");
    setOutput("");
  };

  // Dynamically Load Pyodide CDN for In-Browser Python WASM execution
  useEffect(() => {
    if (!window.pyodide && !document.getElementById("pyodide-script")) {
      const script = document.createElement("script");
      script.id = "pyodide-script";
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Execution Logic
  const runCode = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      if (language === "python") {
        if (!window.pyodide) {
          setIsPyodideLoading(true);
          if (window.loadPyodide) {
            window.pyodide = await window.loadPyodide();
          } else {
            throw new Error(
              "Pyodide WASM runtime script is still loading. Please try again in a moment.",
            );
          }
          setIsPyodideLoading(false);
        }

        // Redirect Python stdout to output string
        let logs: string[] = [];
        window.pyodide.setStdout({
          batched: (str: string) => logs.push(str),
        });

        await window.pyodide.runPythonAsync(code);
        setOutput(logs.join("\n") || "Code executed successfully (no output).");
      } else if (language === "javascript") {
        let logs: string[] = [];
        const originalConsoleLog = console.log;

        console.log = (...args: any[]) => {
          logs.push(
            args
              .map((arg) =>
                typeof arg === "object"
                  ? JSON.stringify(arg, null, 2)
                  : String(arg),
              )
              .join(" "),
          );
        };

        try {
          const runFn = new Function(code);
          runFn();
          setOutput(
            logs.join("\n") || "Code executed successfully (no output).",
          );
        } finally {
          console.log = originalConsoleLog;
        }
      }
    } catch (err: any) {
      setOutput(`Error: ${err.message || String(err)}`);
    } finally {
      setIsRunning(false);
      setIsPyodideLoading(false);
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
          isMaximized ? "w-full h-full" : "h-[75vh] w-[75vw]"
        } bg-black text-white border border-white/15 rounded-lg shadow-xl overflow-hidden`}>
        {/* Title Bar */}
        <div className="handle cursor-grab flex items-center justify-between px-4 py-2 bg-white/4 shrink-0">
          <div className="flex items-center gap-2">
            <img className="size-5" src="/apps/compiler.png" alt="clock" />
            <span className="text-sm font-medium">Compiler</span>
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
        <div className="bg-white/8 flex-1 flex flex-col py-3 px-3 overflow-hidden min-h-0">
          {/* Language selection and code run button */}
          <div className="flex justify-center gap-3">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              disabled={isRunning}
              className="bg-black/50 hover:bg-white/10 border border-white/16 rounded-md px-3 py-2 text-sm text-slate-100 focus:outline-none cursor-pointer">
              <option value="python" className="bg-black">
                Python (Pyodide WASM)
              </option>
              <option value="javascript" className="bg-black">
                JavaScript
              </option>
            </select>
            <button
              onClick={runCode}
              disabled={isRunning}
              className="bg-black/50 hover:bg-white/10 border border-white/16 flex items-center px-4 rounded-md gap-2 cursor-pointer disabled:opacity-50 transition-colors">
              <span>{isRunning ? "Running..." : "Run"}</span>
              {isRunning ? (
                <CgSpinner className="size-4 animate-spin" />
              ) : (
                <FaPlay className="size-3" />
              )}
            </button>
          </div>

          <div className="flex-1 flex gap-2 min-h-0 mt-3">
            {/* Writing code */}
            <div className="bg-white/5 w-1/2 p-3 overflow-hidden">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-full bg-transparent text-white font-mono text-sm outline-none resize-none whitespace-pre overflow-x-auto"
              />
            </div>

            {/* Code result terminal */}
            <div className="bg-white/5 w-1/2 p-3 font-mono text-xs overflow-y-auto flex flex-col">
              <span className="text-white/40 mb-2">// Execution Output</span>
              {isPyodideLoading ? (
                <div className="flex items-center gap-2 text-yellow-400 my-auto justify-center">
                  <CgSpinner className="animate-spin text-lg" />
                  <span>Loading Pyodide WebAssembly runtime...</span>
                </div>
              ) : isRunning ? (
                <div className="flex items-center gap-2 text-blue-400 my-auto justify-center">
                  <CgSpinner className="animate-spin text-lg" />
                  <span>Executing code...</span>
                </div>
              ) : output ? (
                <pre className="whitespace-pre-wrap text-green-400">
                  {output}
                </pre>
              ) : (
                <span className="text-white/30 italic">
                  Press "Run" to execute your code.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </Rnd>
  );
};

export default Compiler;
