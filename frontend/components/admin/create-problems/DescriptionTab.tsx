import { FaFileAlt } from "react-icons/fa";
import { TabProps } from "@/types/problem.types";
import { FormLabel } from "@/components/ui/Form";
import { MarkdownRenderer } from "@/components/problems/MarkdownRenderer";

export default function DescriptionTab({ formData, setFormData }: TabProps) {
  return (
    <div className="h-[60vh] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <FormLabel>Problem Statement_Markdown</FormLabel>
        <div className="flex gap-3">
          <span className="text-[9px] font-black text-primary-1 uppercase tracking-widest bg-primary-1/10 px-2 py-1 rounded">
            Live Render Active
          </span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* LEFT SIDE: THE INPUT (Uses setFormData) */}
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="flex-1 w-full border-2 border-gray-500 rounded-md p-6 font-mono text-sm bg-gray-50/30 focus:outline-none focus:border-primary-1 resize-none leading-relaxed custom-scrollbar shadow-inner text-gray-900"
          placeholder="## Description&#10;Enter problem details here..."
        />

        {/* RIGHT SIDE: THE PREVIEW (Uses your new shared component) */}
        <div className="flex-1 w-full border-2 border-gray-200 rounded-md p-6 bg-white text-gray-900 overflow-y-auto custom-scrollbar shadow-sm">
          {formData.content ? (
            <MarkdownRenderer content={formData.content} />
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
  );
}