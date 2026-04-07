import { FiFileText } from "react-icons/fi";
import { TabProps } from "@/types/problem.types";
import { MarkdownRenderer } from "@/components/problems/MarkdownRenderer";

export default function DescriptionTab({ formData, setFormData }: TabProps) {
  return (
    <div className="h-[58vh] flex flex-col gap-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Problem Statement — Markdown
        </p>
        <span className="text-[9px] font-black text-primary-1 uppercase tracking-widest bg-primary-1/10 px-2 py-1 rounded-sm">
          Live Preview
        </span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
        {/* Editor */}
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full h-full border-2 border-slate-200 rounded-sm p-4 font-mono text-sm bg-slate-50 focus:outline-none focus:border-slate-900 resize-none leading-relaxed text-slate-900 transition-colors"
          placeholder={"## Description\nDescribe the problem here...\n\n## Examples\n```\nInput: ...\nOutput: ...\n```"}
        />

        {/* Preview */}
        <div className="h-full border-2 border-slate-100 rounded-sm p-4 bg-white overflow-y-auto">
          {formData.content ? (
            <MarkdownRenderer content={formData.content} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
              <FiFileText size={28} />
              <p className="text-[10px] font-black uppercase tracking-widest">Preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
