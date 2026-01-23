import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FormLabel } from "@/components/ui/Form";
import { FaFileAlt } from "react-icons/fa";
import { TabProps } from "@/types/problem.types";
import remarkMath from "remark-math"; // NEW
import rehypeKatex from "rehype-katex"; // NEW
import "katex/dist/katex.min.css";
export default function DescriptionTab({ formData, setFormData }: TabProps) {
  return (
    <div className="h-[60vh] flex flex-col space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-end">
        <FormLabel>Problem Statement_Markdown</FormLabel>
        <div className="flex gap-3">
          <span className="text-[9px] font-black text-primary-1 uppercase tracking-widest bg-primary-1/10 px-2 py-1 rounded">
            Live Render Active
          </span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        <textarea
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          className="flex-1 w-full border-2 border-gray-500 rounded-md p-6 font-mono text-sm bg-gray-50/30 focus:outline-none focus:border-primary-1 resize-none leading-relaxed custom-scrollbar shadow-inner"
          placeholder="## Description&#10;Enter problem details here..."
        />
        <div className="flex-1 w-full border-2 border-gray-200 rounded-md p-6 bg-white overflow-y-auto custom-scrollbar shadow-sm">
          {formData.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]} // Add remarkMath
              rehypePlugins={[rehypeKatex]} // Add rehypeKatex
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
  );
}
