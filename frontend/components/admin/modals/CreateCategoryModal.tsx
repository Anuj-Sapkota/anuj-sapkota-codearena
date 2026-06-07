"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FiX, FiSave } from "react-icons/fi";
import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories";
import { Category, CreateCategoryDTO } from "@/types/category.types";

const fieldClass = "w-full border-2 border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium text-slate-900 bg-white outline-none focus:border-slate-900 transition-colors";
const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData?: Category | null;
}

export default function CreateCategoryModal({ isOpen, onClose, editData }: Props) {
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const isLoading = createCategory.isPending || updateCategory.isPending;

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<CreateCategoryDTO>({
      defaultValues: { name: "", slug: "", description: "" },
    });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editData?.name || "",
        slug: editData?.slug || "",
        description: editData?.description || "",
      });
    }
  }, [isOpen, editData, reset]);

  const nameWatch = watch("name");
  useEffect(() => {
    if (!editData && nameWatch) {
      setValue("slug", nameWatch.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, ""));
    }
  }, [nameWatch, setValue, editData]);

  const onSubmit = (data: CreateCategoryDTO) => {
    if (editData) {
      updateCategory.mutate({ id: editData.categoryId, data }, { onSuccess: () => { onClose(); reset(); } });
    } else {
      createCategory.mutate(data, { onSuccess: () => { onClose(); reset(); } });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="bg-white w-full max-w-md rounded-sm shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              {editData ? "Edit Category" : "New Category"}
            </h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {editData ? "Update taxonomy entry" : "Define a new problem tag"}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all">
            <FiX size={14} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Display Name</label>
            <input {...register("name", { required: "Name is required" })} className={fieldClass} placeholder="e.g. Dynamic Programming" />
            {errors.name && <p className="text-[9px] text-rose-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>URL Slug</label>
            <input
              {...register("slug", {
                required: "Slug is required",
                pattern: { value: /^[a-z0-9-]+$/, message: "Lowercase, numbers and hyphens only" },
              })}
              className={fieldClass + " font-mono"}
              placeholder="dynamic-programming"
            />
            {errors.slug && <p className="text-[9px] text-rose-500 mt-1">{errors.slug.message}</p>}
            {editData && (
              <p className="text-[9px] text-amber-600 mt-1">Changing the slug may break existing shared URLs.</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register("description")}
              rows={3}
              className={fieldClass + " resize-none"}
              placeholder="What problems fall into this category?"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-sm text-[10px] font-black uppercase tracking-widest hover:bg-primary-1 transition-all disabled:opacity-40 active:scale-95"
            >
              <FiSave size={12} />
              {isLoading ? "Saving..." : editData ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
