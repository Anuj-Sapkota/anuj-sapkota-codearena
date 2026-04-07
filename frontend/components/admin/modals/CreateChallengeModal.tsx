"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FiX, FiSearch, FiCheck, FiSave, FiZap } from "react-icons/fi";
import { LuSwords } from "react-icons/lu";
import { toast } from "sonner";
import { Challenge, CreateChallengeDTO } from "@/types/challenge.types";
import { useCreateChallenge, useUpdateChallenge } from "@/hooks/useChallenges";
import { useProblems } from "@/hooks/useProblems";

function toLocalDatetimeInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const fieldClass = "w-full border-2 border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium text-slate-900 bg-white outline-none focus:border-slate-900 transition-colors";
const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5";

const DIFF_COLORS: Record<string, string> = {
  EASY:   "text-emerald-600 bg-emerald-50 border-emerald-100",
  MEDIUM: "text-amber-600   bg-amber-50   border-amber-100",
  HARD:   "text-rose-600    bg-rose-50    border-rose-100",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData?: Challenge | null;
}

export default function CreateChallengeModal({ isOpen, onClose, editData }: Props) {
  const createChallenge = useCreateChallenge();
  const updateChallenge = useUpdateChallenge();
  const isLoading = createChallenge.isPending || updateChallenge.isPending;

  const { data: problemsData } = useProblems({ page: 1, limit: 100 });
  const allProblems = problemsData?.data ?? [];
  const [problemSearch, setProblemSearch] = useState("");

  const { register, handleSubmit, setValue, control, reset, formState: { errors } } =
    useForm<CreateChallengeDTO>({
      defaultValues: {
        title: "", slug: "", description: "",
        isPublic: false, difficulty: "MEDIUM", points: 100,
        startTime: "", endTime: "", problemIds: [],
      },
    });

  const selectedIds = useWatch({ control, name: "problemIds" }) || [];
  const titleWatch = useWatch({ control, name: "title" });

  useEffect(() => {
    if (!isOpen) return;
    if (editData) {
      const linkedIds = editData.problems?.map((p: any) => Number(p.problemId)) || [];
      reset({
        title: editData.title,
        slug: editData.slug,
        description: editData.description || "",
        isPublic: editData.isPublic,
        difficulty: editData.difficulty || "MEDIUM",
        points: editData.points || 100,
        startTime: editData.startTime ? toLocalDatetimeInput(editData.startTime) : "",
        endTime: editData.endTime ? toLocalDatetimeInput(editData.endTime) : "",
        problemIds: linkedIds,
      });
    } else {
      reset({ title: "", slug: "", description: "", isPublic: false, difficulty: "MEDIUM", points: 100, startTime: "", endTime: "", problemIds: [] });
    }
  }, [editData, reset, isOpen]);

  useEffect(() => {
    if (!editData && titleWatch) {
      setValue("slug", titleWatch.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""));
    }
  }, [titleWatch, setValue, editData]);

  const toggleProblem = (id: number) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x: number) => x !== id)
      : [...selectedIds, id];
    setValue("problemIds", next, { shouldDirty: true });
  };

  const onSubmit = (data: CreateChallengeDTO) => {
    const payload = {
      ...data,
      points: Number(data.points),
      isPublic: String(data.isPublic) === "true",
      startTime: data.startTime || undefined,
      endTime: data.endTime || undefined,
    };
    if (editData) {
      updateChallenge.mutate({ id: Number(editData.challengeId), data: payload }, {
        onSuccess: () => { toast.success("Challenge updated"); onClose(); },
      });
    } else {
      createChallenge.mutate(payload as any, {
        onSuccess: () => { toast.success("Challenge created"); onClose(); },
      });
    }
  };

  if (!isOpen) return null;

  const filtered = allProblems.filter((p) =>
    p.title.toLowerCase().includes(problemSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl h-[88vh] rounded-sm shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {editData ? "Edit Challenge" : "New Challenge"}
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {editData ? `Editing: ${editData.title}` : "Create a new contest"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <form id="challenge-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Title + Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Title</label>
                <input {...register("title", { required: "Required" })} className={fieldClass} placeholder="e.g. Weekly Duel #4" />
                {errors.title && <p className="text-[9px] text-rose-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className={labelClass}>URL Slug</label>
                <input {...register("slug", { required: "Required" })} className={fieldClass + " font-mono"} placeholder="weekly-duel-4" />
                {errors.slug && <p className="text-[9px] text-rose-500 mt-1">{errors.slug.message}</p>}
              </div>
            </div>

            {/* Difficulty + Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50 border-2 border-slate-100 rounded-sm">
              <div>
                <label className={labelClass}>Difficulty</label>
                <select {...register("difficulty")} className={fieldClass + " cursor-pointer"}>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Completion Bonus (XP)</label>
                <input type="number" min={0} {...register("points")} className={fieldClass} placeholder="100" />
                <p className="text-[9px] text-slate-400 mt-1">Bonus XP when all problems are solved.</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>Description</label>
              <textarea {...register("description")} rows={3} className={fieldClass + " resize-none"} placeholder="Contest rules and info..." />
            </div>

            {/* Schedule + Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-slate-50 border-2 border-slate-100 rounded-sm">
              <div>
                <label className={labelClass}>Start Time</label>
                <input type="datetime-local" {...register("startTime")} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>End Time</label>
                <input type="datetime-local" {...register("endTime")} className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>Visibility</label>
                <select {...register("isPublic")} className={fieldClass + " cursor-pointer"}>
                  <option value="false">Draft</option>
                  <option value="true">Public</option>
                </select>
              </div>
            </div>

            {/* Problem selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={labelClass}>
                  Problems — {selectedIds.length} selected
                </label>
                <div className="relative w-56">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={problemSearch}
                    onChange={(e) => setProblemSearch(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-sm py-1.5 pl-8 pr-3 text-xs font-medium outline-none focus:border-slate-900 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {filtered.map((p) => {
                  const selected = selectedIds.includes(p.problemId);
                  return (
                    <button
                      key={p.problemId}
                      type="button"
                      onClick={() => toggleProblem(p.problemId)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-sm border-2 text-left transition-all ${
                        selected
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 hover:border-slate-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 transition-all ${
                          selected ? "border-white bg-white" : "border-slate-300"
                        }`}>
                          {selected && <FiCheck size={9} className="text-slate-900" />}
                        </div>
                        <span className={`text-[11px] font-bold uppercase tracking-tight truncate ${selected ? "text-white" : "text-slate-700"}`}>
                          {p.title}
                        </span>
                      </div>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-sm border shrink-0 ml-2 ${
                        selected ? "bg-white/20 text-white border-white/20" : DIFF_COLORS[p.difficulty] ?? ""
                      }`}>
                        {p.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40 active:scale-95"
          >
            <FiSave size={12} />
            {isLoading ? "Saving..." : editData ? "Save Changes" : "Create Challenge"}
          </button>
        </div>
      </div>
    </div>
  );
}
