"use client";

import { FaPlus, FaTrash, FaVial, FaEye, FaEyeSlash } from "react-icons/fa";
import { FormLabel } from "@/components/ui/Form";
import { TabProps } from "@/types/problem.types";

export default function TestCasesTab({ formData, setFormData }: TabProps) {


  // SAFETY: Ensure testCases is always an array
  const testCases = formData.testCases || [];

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [
        ...testCases,
        { input: "", expectedOutput: "", isSample: false },
      ],
    });
  };

  const updateTestCase = (index: number, field: string, value: string | boolean) => {
    const next = [...testCases];
    next[index] = { ...next[index], [field]: value };
    setFormData({ ...formData, testCases: next });
  };

  const removeTestCase = (index: number) => {
    setFormData({
      ...formData,
      testCases: testCases.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      <div className="flex justify-between items-end border-b-2 border-slate-100 pb-4">
        <div>
          <FormLabel>Validation Matrix</FormLabel>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            Define I/O parameters for judge execution
          </p>
        </div>
        <button
          type="button"
          onClick={addTestCase}
          className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 flex items-center gap-2 hover:bg-primary-1 transition-all rounded-sm"
        >
          <FaPlus /> Add_New_Instance
        </button>
      </div>

      <div className="space-y-8">
        {testCases.length === 0 && (
          <div className="py-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
            <FaVial size={40} className="mb-4 opacity-20" />
            <p className="text-[11px] font-black uppercase tracking-widest">
              No validation data found
            </p>
          </div>
        )}

        {testCases.map((tc, idx) => (
          <div
            key={idx}
            className="group border border-slate-200 bg-white shadow-sm hover:border-slate-900 transition-all"
          >
            {/* Header */}
            <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center group-hover:bg-slate-900 transition-colors">
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-tighter group-hover:text-white">
                Instance_ID: 0{idx + 1}
              </span>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-3 h-3 accent-primary-1"
                    checked={tc.isSample}
                    onChange={(e) =>
                      updateTestCase(idx, "isSample", e.target.checked)
                    }
                  />
                  <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-slate-300">
                    {tc.isSample ? (
                      <>
                        <FaEye className="inline mr-1" /> Public_Sample
                      </>
                    ) : (
                      <>
                        <FaEyeSlash className="inline mr-1" /> Hidden_Case
                      </>
                    )}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => removeTestCase(idx)}
                  className="text-slate-400 hover:text-red-500 transition-colors group-hover:text-white/50 group-hover:hover:text-red-400"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            </div>

            {/* Input/Output Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-slate-200">
              <div className="p-4">
                <div className="text-[9px] font-black uppercase text-slate-400 mb-2">
                  Std_In
                </div>
                <textarea
                  placeholder="Input variables..."
                  value={tc.input}
                  onChange={(e) => updateTestCase(idx, "input", e.target.value)}
                  className="w-full bg-slate-50 p-3 font-mono text-xs outline-none min-h-[120px] resize-none border border-transparent focus:border-primary-1/30 focus:bg-white transition-all"
                />
              </div>
              <div className="p-4">
                <div className="text-[9px] font-black uppercase text-slate-400 mb-2">
                  Std_Out
                </div>
                <textarea
                  placeholder="Expected result..."
                  value={tc.expectedOutput}
                  onChange={(e) =>
                    updateTestCase(idx, "expectedOutput", e.target.value)
                  }
                  className="w-full bg-slate-50 p-3 font-mono text-xs outline-none min-h-[120px] resize-none border border-transparent focus:border-primary-1/30 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
