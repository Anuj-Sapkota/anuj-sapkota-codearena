"use client";

import Editor, { loader } from "@monaco-editor/react";

// Point to CDN to avoid hosting workers locally
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs',
  },
});

export const CodeEditor = ({ code, setCode, language }: any) => {
  // Monaco uses 'cpp' for C++ syntax highlighting
  const monacoLang = language === "cpp" ? "cpp" : language;

  return (
    <div className="h-full w-full bg-[#1e1e1e]">
      <Editor
        height="100%"
        theme="vs-dark"
        language={monacoLang}
        value={code} // This is now a string from the parent state
        onChange={(v) => setCode(v || "")}
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily: "Fira Code, monospace",
          minimap: { enabled: false },
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
};