/**
 * Cleans and formats an error string from Judge0 execution.
 * The backend now decodes base64 before sending, so this just parses plain text.
 */
export const cleanError = (err: string | null | undefined): string => {
  if (!err) return "";

  const lines = err.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  // C++ — "file.cpp:line:col: error: message"
  const cppError = lines.find((l) => l.includes("error:"));
  if (cppError) {
    const msg = cppError.split("error:")[1]?.trim();
    const lineMatch = cppError.match(/:(\d+):(\d+):/);
    return lineMatch ? `Line ${lineMatch[1]}: ${msg}` : (msg || cppError);
  }

  // Python — last line is usually "SomeError: message"
  const pythonError = [...lines].reverse().find((l) => /^\w+Error:/.test(l));
  if (pythonError) return pythonError;

  // Java — "Main.java:line: error: message"
  const javaError = lines.find((l) => l.includes(".java:") && l.includes("error:"));
  if (javaError) {
    const msg = javaError.split("error:")[1]?.trim();
    const lineMatch = javaError.match(/:(\d+):/);
    return lineMatch ? `Line ${lineMatch[1]}: ${msg}` : (msg || javaError);
  }

  // JavaScript / Node — "TypeError: ...", "ReferenceError: ..." etc.
  const jsError = lines.find((l) => /\w+Error:/.test(l));
  if (jsError) return jsError;

  // Fallback — first meaningful line, truncated
  const first = lines[0];
  return first.length > 120 ? first.slice(0, 120) + "…" : first;
};
