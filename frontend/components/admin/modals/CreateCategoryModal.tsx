"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { AppDispatch, RootState } from "@/lib/store/store";
import { createCategoryThunk, updateCategoryThunk } from "@/lib/store/features/category/category.actions";
import { Category, CreateCategoryDTO } from "@/types/category.types";

import Modal from "@/components/ui/Modal";
import { FormLabel, FormInput, FormTextarea, FormButton } from "@/components/ui/Form"; 

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData?: Category | null;
}

export default function CreateCategoryModal({ isOpen, onClose, editData }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.category);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateCategoryDTO>({
    defaultValues: {
      name: editData?.name || "",
      slug: editData?.slug || "",
      description: editData?.description || "",
    }
  });

  // Auto-slugging logic: Only runs when creating a NEW category
  const categoryName = watch("name");
  useEffect(() => {
    if (!editData && categoryName) {
      const slug = categoryName.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
      setValue("slug", slug);
    }
  }, [categoryName, setValue, editData]);

  const onSubmit = async (data: CreateCategoryDTO) => {
    let result;
    if (editData) {
      result = await dispatch(updateCategoryThunk({ id: editData.categoryId, data }));
    } else {
      result = await dispatch(createCategoryThunk(data));
    }

    if (updateCategoryThunk.fulfilled.match(result) || createCategoryThunk.fulfilled.match(result)) {
      onClose();
      reset();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 space-y-6">
        <div className="border-b-2 border-gray-100 pb-4">
          <h3 className="text-2xl font-black text-darkest uppercase tracking-tight">
            {editData ? "Modify Category" : "New Category"}
            <span className="text-primary-1">.</span>
          </h3>
          <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] mt-1">
            {editData ? "Updating system taxonomy" : "Define a new problem tag"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Display Name */}
          <div className="space-y-1">
            <FormLabel>Display Name</FormLabel>
            <FormInput 
              placeholder="e.g. Dynamic Programming"
              error={errors.name?.message}
              register={register("name", { required: "Name is required" })}
            />
          </div>

          {/* URL Slug - Now Editable */}
          <div className="space-y-1">
            <FormLabel>URL Slug</FormLabel>
            <FormInput 
              placeholder="category-slug"
              error={errors.slug?.message}
              register={register("slug", { 
                required: "Slug is required",
                pattern: {
                    value: /^[a-z0-9-]+$/,
                    message: "Lower case, numbers, and hyphens only"
                }
              })}
            />
            {editData && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded flex items-start gap-2">
                <span className="text-amber-600 text-[10px] font-black uppercase leading-none mt-0.5">Note:</span>
                <p className="text-[10px] text-amber-700 font-medium leading-tight">
                  Changing the slug will break any existing URLs shared externally for this category.
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <FormLabel>Description</FormLabel>
            <FormTextarea 
              placeholder="Explain what problems fall into this category..."
              register={register("description")}
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="text-muted font-black text-xs uppercase tracking-widest hover:text-darkest transition-colors"
            >
              Discard
            </button>
            <FormButton isLoading={isLoading} type="submit">
              {editData ? "Update Record" : "Confirm Entry"}
            </FormButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}