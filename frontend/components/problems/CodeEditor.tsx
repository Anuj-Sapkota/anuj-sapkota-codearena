import Editor from "@monaco-editor/react";

export const CodeEditor = ({ code, setCode, language }: any) => (
  <div className="h-full w-full bg-[#1e1e1e] flex flex-col">
    <Editor
      height="100%"
      theme="vs-dark"
      language={language}
      value={code}
      onChange={(v) => setCode(v || "")}
      options={{ 
        automaticLayout: true,
        fontSize: 14,
        minimap: { enabled: false },
        padding: { top: 20 },
        scrollBeyondLastLine: false
      }}
    />
  </div>
);