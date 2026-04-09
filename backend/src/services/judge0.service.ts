import axios from "axios";
import config from "../configs/config.js";

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
      `${config.judge0Url}/submissions?base64_encoded=true&wait=true`,
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
    console.log(error)
    throw new Error("Execution engine failed.");
  }
};
