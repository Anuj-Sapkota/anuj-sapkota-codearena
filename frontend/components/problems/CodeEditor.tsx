import Editor, { loader } from "@monaco-editor/react";
import { useEffect } from "react";

export const CodeEditor = ({ code, setCode, language }: any) => {


// ... inside your component
useEffect(() => {
  // This configuration tells Monaco to use a CDN to load the worker scripts
  // so you don't have to manually host them in your /public folder.
  loader.config({
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs',
    },
  });

  // This is the critical fix for the Web Worker error
  window.MonacoEnvironment = {
    getWorkerUrl: function (_workerId, label) {
      if (label === 'json') {
        return './json.worker.bundle.js';
      }
      if (label === 'css' || label === 'scss' || label === 'less') {
        return './css.worker.bundle.js';
      }
      if (label === 'html' || label === 'handlebars' || label === 'razor') {
        return './html.worker.bundle.js';
      }
      if (label === 'typescript' || label === 'javascript') {
        return './ts.worker.bundle.js';
      }
      return './editor.worker.bundle.js';
    },
  };
}, []);

  return (
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
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};
