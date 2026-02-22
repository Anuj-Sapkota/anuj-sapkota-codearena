export const cleanError = (err: string | null | undefined): string => {
  if (!err) return "";

  let decoded = "";
  try {
    // Robust UTF-8 Base64 decoding
    const binary = atob(err.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    decoded = new TextDecoder("utf-8").decode(bytes);
    console.log(decoded)
  } catch (e) {
    decoded = err; // Fallback to raw string
  }

  // 1. Sanitize weird encoding artifacts
  decoded = decoded
    .replace(/â€˜|‘/g, "'")
    .replace(/â€™|’/g, "'")
    .replace(/â€œ|“/g, '"')
    .replace(/â€|”/g, '"');

  const lines = decoded.split("\n").map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return "Unknown execution error";

  // 2. Language-Specific Parsing Logic
  
  // --- C++ Patterns ---
  const cppError = lines.find(l => l.includes("error:"));
  if (cppError) {
    const msg = cppError.split("error:")[1]?.trim();
    const lineMatch = cppError.match(/:(\d+):(\d+):/); // Matches :line:col:
    return lineMatch ? `Line ${lineMatch[1]}: ${msg}` : msg;
  }

  // --- Python Patterns ---
  // Python errors usually end with the actual Exception (e.g., ValueError: ...)
  const pythonError = [...lines].reverse().find(l => /^\w+Error:/.test(l));
  if (pythonError) return pythonError;

  // --- Java Patterns ---
  // Look for the "Main.java:line: error: message" format
  const javaError = lines.find(l => l.includes(".java:") && l.includes("error:"));
  if (javaError) {
    const parts = javaError.split("error:");
    const msg = parts[1]?.trim();
    const lineMatch = javaError.match(/:(\d+):/);
    return lineMatch ? `Line ${lineMatch[1]}: ${msg}` : msg;
  }

  // --- JavaScript Patterns ---
  // Usually "ReferenceError: x is not defined" or similar
  const jsError = lines.find(l => l.includes("Error:") || l.includes("TypeError:") || l.includes("ReferenceError:"));
  if (jsError) return jsError;

  // 3. Fallback Logic
  // If no specific pattern is found, return the most relevant line.
  // Often the last line contains the summary, or the first line contains the start of the trace.
  return lines[0].length > 100 ? lines[0].substring(0, 100) + "..." : lines[0];
};