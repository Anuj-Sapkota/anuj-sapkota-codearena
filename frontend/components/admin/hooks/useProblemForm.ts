import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store/store";
import {
  createProblemThunk,
  updateProblemThunk,
} from "@/lib/store/features/problems/problem.actions";
import { CreateProblemDTO, Problem } from "@/types/problem.types";
import { toast } from "sonner";
import { Category } from "@/types/category.types";

// Define default templates outside the hook to keep them clean
const DEFAULT_TEMPLATES: Record<string, string> = {
  javascript: "function solution() {\n  // your code here\n}",
  python: "def solution():\n    # your code here\n    pass",
  java: "class Solution {\n    public void solution() {\n        \n    }\n}",
  cpp: "class Solution {\npublic:\n    void solution() {\n        \n    }\n};",
};

export const useProblemForm = (
  isOpen: boolean,
  initialData: Problem | null | undefined,
  onClose: () => void,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateProblemDTO>({
    title: "",
    content: "",
    difficulty: "EASY",
    functionName: "solution",
    timeLimit: 1.0,
    memoryLimit: 128,
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
        categoryIds: [],
        testCases: [{ input: "", expectedOutput: "", isSample: true }],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.content || !formData.functionName) {
      return toast.error("TITLE, CONTENT, AND FUNCTION NAME ARE MANDATORY");
    }

    setIsLoading(true);
    try {
      if (initialData) {
        await dispatch(
          updateProblemThunk({ id: initialData.problemId, data: formData }),
        ).unwrap();
        toast.success("CHALLENGE_UPDATED_SUCCESSFULLY");
      } else {
        await dispatch(createProblemThunk(formData)).unwrap();
        toast.success("CHALLENGE_DEPLOYED_SUCCESSFULLY");
      }
      onClose();
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : "An unexpected error occurred";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return { formData, setFormData, handleSubmit, isLoading };
};