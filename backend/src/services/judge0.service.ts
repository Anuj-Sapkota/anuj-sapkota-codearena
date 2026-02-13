import axios from "axios";

const JUDGE0_URL = process.env.JUDGE0_URL || "http://localhost:2358";

export const submitCode = async (
  sourceCode: string,
  languageId: number,
  stdin: string = "",
  timeLimit: number = 2.0,
  memoryLimit: number = 128.0,
) => {
  try {
    const response = await axios.post(
      // 1. MUST HAVE base64_encoded=true
      `${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`,
      {
        // 2. MUST BE ENCODED with Buffer (Node.js)
        source_code: Buffer.from(sourceCode).toString("base64"),
        language_id: languageId,
        stdin: Buffer.from(stdin).toString("base64"),
        cpu_time_limit: timeLimit,
        memory_limit: memoryLimit * 1024,
      },
    );  
    // This data comes back as Base64
    return response.data;
  } catch (error) {
    throw new Error("Execution engine failed.");
  }
};
