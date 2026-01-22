"use client";
import React, { useState } from "react";
import Editor from "@monaco-editor/react";

export default function WorkspacePage() {
  const [code, setCode] = useState<string>(`// Write your code here\nconsole.log("Hello World");`);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  const handleRunCode = async () => {
    setOutput("Running...");
    try {
      // We will connect this to your Express backend soon!
      console.log("Submitting code:", code);
    } catch (error) {
      setOutput("Error running code");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white">
      {/* Top Navbar */}
      <div className="h-12 border-b border-white/10 flex items-center px-4 justify-between bg-[#252526]">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm">Problem_Solving_</span>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#3c3c3c] text-xs border-none rounded px-2 py-1 outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <button 
          onClick={handleRunCode}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1 rounded text-sm font-bold transition-all"
        >
          Run Code_
        </button>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Description (Static for now) */}
        <div className="w-1/2 border-r border-white/10 p-6 overflow-y-auto bg-[#0f172a]">
          <h1 className="text-2xl font-black mb-4">1. Two Sum_</h1>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            Given an array of integers <code className="bg-slate-800 px-1 rounded">nums</code> and an integer <code className="bg-slate-800 px-1 rounded">target</code>, return indices of the two numbers such that they add up to target.
          </p>
          <div className="bg-slate-900/50 p-4 rounded border border-white/5 font-mono text-xs">
            <p className="text-emerald-400">Input: nums = [2,7,11,15], target = 9</p>
            <p className="text-emerald-400">Output: [0,1]</p>
          </div>
        </div>

        {/* Right: Monaco Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{ fontSize: 14, minimap: { enabled: false } }}
            />
          </div>
          {/* Console / Output Area */}
          <div className="h-40 border-t border-white/10 bg-[#1e1e1e] p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Console_Output</p>
            <pre className="text-xs font-mono text-emerald-400">{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}