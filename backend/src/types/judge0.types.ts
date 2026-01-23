export interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string;
  memory: number;
  token: string;
  status: {
    id: number;
    description: string; // "Accepted", "Wrong Answer", etc.
  };
}