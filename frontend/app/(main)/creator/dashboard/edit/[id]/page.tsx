"use client";

import { useParams } from "next/navigation";
import { useResourceById } from "@/hooks/useResource";
import ResourceForm from "@/components/resources/ResourceForm";
import { FiLoader, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function EditResourcePage() {
  const { id } = useParams();
  const { data: existingData, isLoading } = useResourceById(id as string);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <Link href="/creator/dashboard" className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 mb-8 transition-all">
        <FiArrowLeft /> Back to Studio
      </Link>

      <div className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">
          Edit <span className="text-primary-1">Series</span>
        </h1>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center"><FiLoader className="animate-spin" size={40} /></div>
      ) : existingData ? (
        <ResourceForm initialData={existingData} resourceId={id as string} key={existingData.id} />
      ) : (
        <div>Not found.</div>
      )}
    </div>
  );
}