export const cleanError = (err: string | null | undefined) => {
  if (!err) return "";

  let decoded = "";
  try {
    // FIX: This is the robust way to decode UTF-8 Base64 in the browser
    const binary = atob(err.trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    decoded = new TextDecoder("utf-8").decode(bytes);
  } catch (e) {
    decoded = err; // Fallback to raw string
  }

  if (decoded.includes("> Execution finished") || !decoded.trim()) return "";

  // Standardize the weird quotes even after decoding just in case
  decoded = decoded.replace(/â€˜|‘/g, "'").replace(/â€™|’/g, "'");

  const lines = decoded.split("\n").map(l => l.trim()).filter(Boolean);

  // C++ Pattern
  const cppError = lines.find(l => l.includes("error:"));
  if (cppError) {
    const msg = cppError.split("error:")[1]?.trim();
    const lineMatch = cppError.match(/:(\d+):/);
    return lineMatch ? `Line ${lineMatch[1]}: ${msg}` : msg;
  }

  // JS/Python/Default Pattern
  return lines[0].split("at")[0].trim();
};