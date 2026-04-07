import { useState, useEffect } from "react";
import { useCreateProblem, useUpdateProblem } from "@/hooks/useProblems";
import { CreateProblemDTO, Problem } from "@/types/problem.types";
import { toast } from "sonner";
import { Category } from "@/types/category.types";
import { SUPPORTED_LANGUAGES } from "@/constants/languages";

// Starter code templates keyed by language id — matches SUPPORTED_LANGUAGES
const DEFAULT_TEMPLATES: Record<string, string> = {
  javascript: "/**\n * @param {*} input\n * @return {*}\n */\nfunction solution(input) {\n  // your code here\n}",
  python: "def solution(input):\n    # your code here\n    pass",
  java: "class Solution {\n    public Object solution(Object input) {\n        // your code here\n        return null;\n    }\n}",
  cpp: "class Solution {\npublic:\n    auto solution(auto input) {\n        // your code here\n    }\n};",
};

export const useProblemForm = (
  isOpen: boolean,
  initialData: Problem | null | undefined,
  onClose: () => void,
) => {
  const createProblem = useCreateProblem();
  const updateProblem = useUpdateProblem();
  const isLoading = createProblem.isPending || updateProblem.isPending;

  const [formData, setFormData] = useState<CreateProblemDTO>({
    title: "",
    content: "",
    difficulty: "EASY",
    functionName: "solution",
    timeLimit: 1.0,
    memoryLimit: 128,
    points: 50,
    categoryIds: [],
    testCases: [{ input: "", expectedOutput: "", isSample: true }],
    starterCode: DEFAULT_TEMPLATES,
  });

  useEffect(() => {
    if (isOpen && initialData) {
      // Logic to handle legacy data (if starterCode was stored as a string)
      let mappedStarterCode: Record<string, string>;
      
      if (typeof initialData.starterCode === "string") {
        mappedStarterCode = { ...DEFAULT_TEMPLATES, javascript: initialData.starterCode || DEFAULT_TEMPLATES.javascript };
      } else if (initialData.starterCode && typeof initialData.starterCode === "object") {
        // If it's already an object, use it
        mappedStarterCode = initialData.starterCode as Record<string, string>;
      } else {
        mappedStarterCode = DEFAULT_TEMPLATES;
      }

      setFormData({
        title: initialData.title,
        content: initialData.content,
        difficulty: initialData.difficulty as "EASY" | "MEDIUM" | "HARD",
        functionName: initialData.functionName || "solution",
        starterCode: mappedStarterCode,
        timeLimit: initialData.timeLimit,
        memoryLimit: initialData.memoryLimit,
        points: initialData.points ?? 50,
        categoryIds:
          initialData.categories?.map((c: Category) =>
            Number(c.categoryId || c),
          ) || [],
        testCases: initialData.testCases?.map((tc) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isSample: tc.isSample,
        })) || [{ input: "", expectedOutput: "", isSample: true }],
      });
    } else if (isOpen) {
      // RESET to clean state for New Problem
      setFormData({
        title: "",
        content: "",
        difficulty: "EASY",
        functionName: "solution",
        starterCode: DEFAULT_TEMPLATES,
        timeLimit: 1.0,
        memoryLimit: 128,
        points: 50,
        categoryIds: [],
        testCases: [{ input: "", expectedOutput: "", isSample: true }],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.functionName) {
      return toast.error("TITLE, CONTENT, AND FUNCTION NAME ARE MANDATORY");
    }

    if (initialData) {
      updateProblem.mutate({ id: initialData.problemId, data: formData }, {
        onSuccess: () => { toast.success("CHALLENGE_UPDATED_SUCCESSFULLY"); onClose(); },
        onError: (err: any) => toast.error(err.message || "Update failed"),
      });
    } else {
      createProblem.mutate(formData, {
        onSuccess: () => { toast.success("CHALLENGE_DEPLOYED_SUCCESSFULLY"); onClose(); },
        onError: (err: any) => toast.error(err.message || "Create failed"),
      });
    }
  };

  return { formData, setFormData, handleSubmit, isLoading };
};