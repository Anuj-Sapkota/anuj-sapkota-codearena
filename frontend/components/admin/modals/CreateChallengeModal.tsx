"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm, useWatch } from "react-hook-form";
import { AppDispatch, RootState } from "@/lib/store/store";
import {
  createChallengeThunk,
  updateChallengeThunk,
} from "@/lib/store/features/challenge/challenge.actions";
import { Challenge, CreateChallengeDTO } from "@/types/challenge.types";
import { Problem } from "@/types/problem.types";
import {
  FaSearch,
  FaTimes,
  FaGlobe,
  FaCheck,
  FaSpinner,
  FaTrophy,
  FaChartBar,
} from "react-icons/fa";
import {
  FormLabel,
  FormInput,
  FormTextarea,
  FormButton,
} from "@/components/ui/Form";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData?: Challenge | null;
}

export default function CreateChallengeModal({
  isOpen,
  onClose,
  editData,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.challenge);
  const { problems: allProblems, isLoading: isLoadingProblems } = useSelector(
    (state: RootState) => state.problem,
  );

  const [problemSearch, setProblemSearch] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateChallengeDTO>({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      isPublic: false,
      difficulty: "MEDIUM", // New Default
      points: 100, // New Default
      startTime: "",
      endTime: "",
      problemIds: [],
    },
  });

  const selectedProblemIds = useWatch({ control, name: "problemIds" }) || [];

  // SYNC FORM WITH EDIT DATA
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        const linkedIds =
          editData.problems?.map((p: any) => Number(p.problemId)) || [];

        reset({
          title: editData.title,
          slug: editData.slug,
          description: editData.description || "",
          isPublic: editData.isPublic,
          difficulty: editData.difficulty || "MEDIUM", // Sync Difficulty
          points: editData.points || 100, // Sync Points
          startTime: editData.startTime
            ? new Date(editData.startTime).toISOString().slice(0, 16)
            : "",
          endTime: editData.endTime
            ? new Date(editData.endTime).toISOString().slice(0, 16)
            : "",
          problemIds: linkedIds,
        });
      } else {
        reset({
          title: "",
          slug: "",
          description: "",
          isPublic: false,
          difficulty: "MEDIUM",
          points: 100,
          startTime: "",
          endTime: "",
          problemIds: [],
        });
      }
    }
  }, [editData, reset, isOpen]);

  const challengeTitle = useWatch({ control, name: "title" });

  useEffect(() => {
    if (!editData && challengeTitle) {
      const slug = challengeTitle
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");
      setValue("slug", slug, { shouldValidate: true });
    }
  }, [challengeTitle, setValue, editData]);

  if (!isOpen) return null;

  const toggleProblem = (id: number): void => {
    const current = [...selectedProblemIds];
    const idx = current.indexOf(id);
    if (idx > -1) {
      current.splice(idx, 1);
    } else {
      current.push(id);
    }
    setValue("problemIds", current, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = async (data: CreateChallengeDTO) => {
    try {
      const payload = {
        ...data,
        points: Number(data.points), // Ensure numeric
        isPublic: String(data.isPublic) === "true",
        startTime: data.startTime
          ? new Date(data.startTime).toISOString()
          : undefined,
        endTime: data.endTime
          ? new Date(data.endTime).toISOString()
          : undefined,
      };

      let result;
      if (editData) {
        result = await dispatch(
          updateChallengeThunk({
            id: Number(editData.challengeId),
            data: payload,
          }),
        );
      } else {
        result = await dispatch(createChallengeThunk(payload));
      }

      if (
        updateChallengeThunk.fulfilled.match(result) ||
        createChallengeThunk.fulfilled.match(result)
      ) {
        toast.success(editData ? "CHALLENGE_UPDATED" : "CHALLENGE_CREATED");
        onClose();
      }
    } catch (error) {
      toast.error("CRITICAL_SYSTEM_ERROR");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-gray-100">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
            {editData ? "Challenge_Edit" : "Challenge_New"}
            <span className="text-primary-1">.</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 transition-all"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          <form
            id="challenge-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-10"
          >
            {/* Title and Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <FormLabel>Contest Title</FormLabel>
                <FormInput
                  placeholder="e.g. Weekly Duel #4"
                  register={register("title", { required: "Title required" })}
                  error={errors.title?.message}
                />
              </div>
              <div className="space-y-1">
                <FormLabel>URL Slug</FormLabel>
                <FormInput
                  placeholder="weekly-duel-4"
                  register={register("slug", { required: "Slug required" })}
                  error={errors.slug?.message}
                />
              </div>
            </div>

            {/* Difficulty and Points - NEW SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-primary-1/5 border-2 border-primary-1/10 rounded-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-1 mb-1">
                  <FaChartBar size={12} />
                  <FormLabel>Difficulty_Level</FormLabel>
                </div>
                <select
                  {...register("difficulty", { required: true })}
                  className="w-full h-[45px] bg-white border-2 border-gray-200 rounded-lg px-3 text-[10px] font-black uppercase outline-none focus:border-primary-1"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary-1 mb-1">
                  <FaTrophy size={12} />
                  <FormLabel>Total_Points</FormLabel>
                </div>
                <FormInput
                  type="number"
                  placeholder="e.g. 500"
                  register={register("points", {
                    required: "Points required",
                    min: 0,
                  })}
                  error={errors.points?.message}
                />
              </div>
            </div>

            <div className="space-y-1">
              <FormLabel>Description</FormLabel>
              <FormTextarea
                placeholder="Contest rules and info..."
                register={register("description")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 border-2 border-gray-100 rounded-xl">
              <div className="space-y-1">
                <FormLabel>Start_Time</FormLabel>
                <input
                  type="datetime-local"
                  {...register("startTime")}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg py-2.5 px-3 text-xs font-bold outline-none focus:border-primary-1"
                />
              </div>
              <div className="space-y-1">
                <FormLabel>End_Time</FormLabel>
                <input
                  type="datetime-local"
                  {...register("endTime")}
                  className="w-full bg-white border-2 border-gray-200 rounded-lg py-2.5 px-3 text-xs font-bold outline-none focus:border-primary-1"
                />
              </div>
              <div className="space-y-1">
                <FormLabel>Visibility</FormLabel>
                <select
                  {...register("isPublic")}
                  className="w-full h-[45px] bg-white border-2 border-gray-200 rounded-lg px-3 text-[10px] font-black uppercase outline-none focus:border-primary-1"
                >
                  <option value="false">Status: Draft</option>
                  <option value="true">Status: Public</option>
                </select>
              </div>
            </div>

            {/* Problem Selection */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2 text-primary-1">
                  <FaGlobe size={14} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                    03. Problem_Selection ({selectedProblemIds.length})
                  </span>
                </div>
                <div className="relative w-64">
                  <FaSearch
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    size={12}
                  />
                  <input
                    type="text"
                    placeholder="SEARCH_REPOSITORY..."
                    className="w-full border-b-2 border-gray-200 py-1 pl-10 text-[10px] font-black uppercase outline-none focus:border-primary-1 transition-all"
                    value={problemSearch}
                    onChange={(e) => setProblemSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto custom-scrollbar p-1">
                {isLoadingProblems ? (
                  <div className="col-span-2 py-12 flex flex-col items-center justify-center opacity-60">
                    <FaSpinner
                      className="animate-spin text-primary-1 mb-2"
                      size={24}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Syncing_Global_Registry...
                    </span>
                  </div>
                ) : (
                  allProblems
                    ?.filter((p) =>
                      p.title
                        .toLowerCase()
                        .includes(problemSearch.toLowerCase()),
                    )
                    .map((problem) => {
                      const isSelected = selectedProblemIds.includes(
                        problem.problemId,
                      );
                      return (
                        <div
                          key={problem.problemId}
                          onClick={() => toggleProblem(problem.problemId)}
                          className={`group relative flex items-center justify-between p-4 h-16 rounded-xl border-2 cursor-pointer transition-all duration-200 ${isSelected ? "border-primary-1 bg-primary-1/5 shadow-sm" : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-md"}`}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div
                              className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? "bg-primary-1 border-primary-1 text-white" : "bg-white border-gray-200 group-hover:border-gray-400"}`}
                            >
                              {isSelected && <FaCheck size={8} />}
                            </div>
                            <span
                              className={`text-[11px] font-bold uppercase tracking-tight truncate ${isSelected ? "text-primary-1" : "text-gray-700"}`}
                            >
                              {problem.title}
                            </span>
                          </div>
                          <span
                            className={`flex-shrink-0 ml-2 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${problem.difficulty === "HARD" ? "bg-red-50 text-red-600" : problem.difficulty === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t flex justify-end gap-4 bg-gray-50/50">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900"
          >
            Abort_Action
          </button>
          <div className="w-56">
            <FormButton isLoading={isLoading} onClick={handleSubmit(onSubmit)}>
              COMMIT_TO_REGISTRY
            </FormButton>
          </div>
        </div>
      </div>
    </div>
  );
}
