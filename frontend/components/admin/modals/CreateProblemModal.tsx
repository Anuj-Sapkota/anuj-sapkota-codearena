"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaTimes,
  FaPlus,
  FaTrash,
  FaFlask,
  FaFileAlt,
  FaCog,
  FaCheckCircle,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { AppDispatch, RootState } from "@/lib/store/store";
import {
  createProblemThunk,
  updateProblemThunk,
} from "@/lib/store/features/problems/problem.actions";
import { CreateProblemDTO, Problem } from "@/types/problem.types";
import { toast } from "sonner";
import { FormLabel, FormButton } from "@/components/ui/Form";
import { Category } from "@/types/category.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Problem | null;
}

type Tab = "basic" | "description" | "testcases";

export default function CreateProblemModal({
  isOpen,
  onClose,
  initialData,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories } = useSelector(
    (state: RootState) => state.category,
  );
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<CreateProblemDTO>({
    title: "",
    content: "",
    difficulty: "EASY",
    timeLimit: 1.0,
    memoryLimit: 128,
    categoryIds: [],
    testCases: [{ input: "", expectedOutput: "", isSample: true }],
  });

  // PRESERVE: Handle Pre-filling data for Update mode
  useEffect(() => {
    if (isOpen && initialData) {
      // 1. Carefully extract category IDs to ensure they are pure numbers
      const extractedCategoryIds = initialData.categories
        ? initialData.categories
            .map((c: Category) => {
              if (typeof c === "object" && c !== null)
                return Number(c.categoryId);
              return Number(c);
            })
            .filter((id) => !isNaN(id)) // Remove any NaN values
        : [];

      setFormData({
        title: initialData.title,
        content: initialData.content,
        difficulty: initialData.difficulty,
        timeLimit: initialData.timeLimit,
        memoryLimit: initialData.memoryLimit,
        categoryIds: extractedCategoryIds,
        testCases: initialData.testCases || [
          { input: "", expectedOutput: "", isSample: true },
        ],
      });
    } else if (isOpen) {
      setFormData({
        title: "",
        content: "",
        difficulty: "EASY",
        timeLimit: 1.0,
        memoryLimit: 128,
        categoryIds: [],
        testCases: [{ input: "", expectedOutput: "", isSample: true }],
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      return toast.error("TITLE AND CONTENT ARE MANDATORY");
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
    } catch (err) {
      const errorMessage =
        typeof err === "string" ? err : "An unexpected error occurred";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-gray-100">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
              {initialData ? "Registry_Edit" : "Registry_New"}
              <span className="text-primary-1">.</span>
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
              Status: {initialData ? "Update_Active" : "Authoring_Mode"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-all cursor-pointer"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-gray-50/50 border-b overflow-x-auto">
          {[
            { id: "basic", label: "01. Configuration", icon: <FaCog /> },
            {
              id: "description",
              label: "02. Content_Markdown",
              icon: <FaFileAlt />,
            },
            {
              id: "testcases",
              label: "03. Validation_Suite",
              icon: <FaFlask />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white border-b-2 border-primary-1 text-primary-1"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {/* TAB 1: BASIC CONFIG */}
          {activeTab === "basic" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <FormLabel>Problem Title</FormLabel>
                  <input
                    className="w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-1/5 focus:border-primary-1 transition-all"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="E.G. BINARY SEARCH ARCHITECTURE"
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Difficulty_Metric</FormLabel>
                  <select
                    className="w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 font-bold focus:outline-none focus:border-primary-1 cursor-pointer"
                    value={formData.difficulty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        difficulty: e.target
                          .value as CreateProblemDTO["difficulty"],
                      })
                    }
                  >
                    <option value="EASY">LEVEL: EASY</option>
                    <option value="MEDIUM">LEVEL: MEDIUM</option>
                    <option value="HARD">LEVEL: HARD</option>
                  </select>
                </div>
              </div>

              {/* Resource Limits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                <div className="space-y-2">
                  <FormLabel>Execution Time Limit (Seconds)</FormLabel>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 focus:outline-none"
                    value={formData.timeLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        timeLimit: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <FormLabel>Memory Allocation Limit (MB)</FormLabel>
                  <input
                    type="number"
                    className="w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 focus:outline-none"
                    value={formData.memoryLimit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        memoryLimit: parseInt(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <FormLabel>Taxonomy_Selection (Categories)</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {categories.map((cat) => {
                    // 1. Ensure the ID is treated as a number to prevent type mismatches
                    const catId = Number(cat.categoryId);
                    const isSelected = formData.categoryIds.includes(catId);

                    return (
                      <button
                        key={catId}
                        type="button" // Prevents accidental form submission
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            categoryIds: isSelected
                              ? prev.categoryIds.filter((id) => id !== catId)
                              : [...prev.categoryIds, catId],
                          }));
                        }}
                        className={`p-3 rounded-md border-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "border-primary-1 bg-primary-1/5 text-primary-1 shadow-[0_0_10px_rgba(46,200,102,0.1)]"
                            : "border-gray-200 text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        {cat.name}
                        {isSelected && (
                          <FaCheckCircle
                            size={10}
                            className="animate-in zoom-in duration-200"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DESCRIPTION (PRESERVE PREVIEW LOGIC) */}
          {activeTab === "description" && (
            <div className="h-[60vh] flex flex-col space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-end">
                <FormLabel>Problem Statement_Markdown</FormLabel>
                <div className="flex gap-3">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">
                    UTF-8 Standard
                  </span>
                  <span className="text-[9px] font-black text-primary-1 uppercase tracking-widest bg-primary-1/10 px-2 py-1 rounded">
                    Live Render Active
                  </span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                <div className="flex flex-col gap-2">
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    className="flex-1 w-full border-2 border-gray-500 rounded-md p-6 font-mono text-sm bg-gray-50/30 focus:outline-none focus:border-primary-1 resize-none leading-relaxed custom-scrollbar shadow-inner"
                    placeholder="## Description&#10;Enter problem details here..."
                  />
                </div>

                <div className="flex-1 w-full border-2 border-gray-200 rounded-md p-6 bg-white overflow-y-auto custom-scrollbar shadow-sm">
                  {formData.content ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ ...props }) => (
                          <h1
                            className="text-2xl font-black uppercase tracking-tight text-gray-900 border-b-2 border-gray-100 pb-2 mb-4"
                            {...props}
                          />
                        ),
                        h2: ({ ...props }) => (
                          <h2
                            className="text-xl font-bold text-gray-800 mt-6 mb-3 uppercase tracking-tight"
                            {...props}
                          />
                        ),
                        p: ({ ...props }) => (
                          <p
                            className="text-gray-600 leading-relaxed mb-4 text-sm"
                            {...props}
                          />
                        ),
                        ul: ({ ...props }) => (
                          <ul
                            className="list-disc list-outside ml-5 mb-4 space-y-1 text-gray-600 text-sm"
                            {...props}
                          />
                        ),
                        code: ({ ...props }) => (
                          <code
                            className="bg-gray-100 text-primary-1 px-1.5 py-0.5 rounded text-xs font-mono font-bold"
                            {...props}
                          />
                        ),
                      }}
                    >
                      {formData.content}
                    </ReactMarkdown>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                      <FaFileAlt size={24} className="opacity-20" />
                      <p className="italic text-xs font-medium uppercase tracking-widest">
                        Null_Content_Buffer
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TEST CASES (PRESERVE APPEND LOGIC) */}
          {activeTab === "testcases" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center">
                <FormLabel>Validation Matrix (Test Cases)</FormLabel>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      testCases: [
                        ...formData.testCases,
                        { input: "", expectedOutput: "", isSample: false },
                      ],
                    })
                  }
                  className="text-primary-1 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-primary-1/5 p-2 rounded transition-all"
                >
                  <FaPlus /> Append Instance
                </button>
              </div>

              <div className="space-y-6">
                {formData.testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
                  >
                    <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] font-black text-gray-900 uppercase">
                        Case_Instance_0{idx + 1}
                      </span>
                      <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            className="accent-primary-1"
                            checked={tc.isSample}
                            onChange={(e) => {
                              const next = [...formData.testCases];
                              next[idx].isSample = e.target.checked;
                              setFormData({ ...formData, testCases: next });
                            }}
                          />
                          <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-primary-1 transition-colors">
                            Visible_Sample
                          </span>
                        </label>
                        <button
                          onClick={() =>
                            setFormData({
                              ...formData,
                              testCases: formData.testCases.filter(
                                (_, i) => i !== idx,
                              ),
                            })
                          }
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
                      <div className="bg-white p-4">
                        <textarea
                          placeholder="Input..."
                          value={tc.input}
                          onChange={(e) => {
                            const next = [...formData.testCases];
                            next[idx].input = e.target.value;
                            setFormData({ ...formData, testCases: next });
                          }}
                          className="w-full bg-transparent font-mono text-xs outline-none min-h-[100px] resize-none"
                        />
                      </div>
                      <div className="bg-white p-4">
                        <textarea
                          placeholder="Output..."
                          value={tc.expectedOutput}
                          onChange={(e) => {
                            const next = [...formData.testCases];
                            next[idx].expectedOutput = e.target.value;
                            setFormData({ ...formData, testCases: next });
                          }}
                          className="w-full bg-transparent font-mono text-xs outline-none min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 border-t flex justify-end gap-4 bg-gray-50/50">
          <button
            onClick={onClose}
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-all cursor-pointer"
          >
            Abort_Action
          </button>
          <FormButton isLoading={isLoading} onClick={handleSubmit}>
            COMMIT_TO_REGISTRY
          </FormButton>
        </div>
      </div>
    </div>
  );
}
