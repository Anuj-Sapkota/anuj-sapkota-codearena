import { FaPlus, FaTrash } from "react-icons/fa";
import { FormLabel } from "@/components/ui/Form";
import { TabProps } from "@/types/problem.types";

export default function TestCasesTab({ formData, setFormData }: TabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <FormLabel>Validation Matrix (Test Cases)</FormLabel>
        <button
          onClick={() => setFormData({ ...formData, testCases: [...formData.testCases, { input: "", expectedOutput: "", isSample: false }] })}
          className="text-primary-1 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-primary-1/5 p-2 rounded transition-all"
        >
          <FaPlus /> Append Instance
        </button>
      </div>

      <div className="space-y-6">
        {formData.testCases.map((tc, idx) => (
          <div key={idx} className="border-2 border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-900 uppercase">Case_Instance_0{idx + 1}</span>
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
                  <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-primary-1">Visible_Sample</span>
                </label>
                <button
                  onClick={() => setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== idx) })}
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
  );
}