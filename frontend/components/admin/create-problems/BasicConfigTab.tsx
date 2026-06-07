import { CreateProblemDTO, TabProps } from "@/types/problem.types";
import { FiCheck } from "react-icons/fi";

const fieldClass = "w-full border-2 border-slate-200 rounded-sm px-4 py-2.5 text-sm font-medium text-slate-900 bg-white outline-none focus:border-slate-900 transition-colors";
const labelClass = "text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1.5";

export default function BasicConfigTab({ formData, setFormData, categories = [] }: TabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Problem Title</label>
          <input
            className={fieldClass}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Two Sum"
          />
        </div>
        <div>
          <label className={labelClass}>Input Data Type</label>
          <select
            className={fieldClass + " cursor-pointer"}
            value={formData.inputType}
            onChange={(e) => setFormData({ ...formData, inputType: e.target.value as any })}
          >
            <option value="ARRAY">Array — [1, 2, 3]</option>
            <option value="INT">Integer — 123</option>
            <option value="STRING">String — "hello"</option>
            <option value="BOOLEAN">Boolean — true</option>
          </select>
          <p className="text-[9px] text-slate-400 mt-1">How test-case data is passed to your function.</p>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Function Name</label>
          <input
            className={fieldClass + " font-mono"}
            value={formData.functionName}
            onChange={(e) => setFormData({ ...formData, functionName: e.target.value })}
            placeholder="solution"
          />
        </div>
        <div>
          <label className={labelClass}>Difficulty</label>
          <select
            className={fieldClass + " cursor-pointer"}
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as CreateProblemDTO["difficulty"] })}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
        <div>
          <label className={labelClass}>Time Limit (s)</label>
          <input
            type="number" step="0.1" min="0.1"
            className={fieldClass}
            value={formData.timeLimit}
            onChange={(e) => setFormData({ ...formData, timeLimit: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelClass}>Memory Limit (MB)</label>
          <input
            type="number" min="16"
            className={fieldClass}
            value={formData.memoryLimit}
            onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className={labelClass}>Points on Solve</label>
          <input
            type="number" min={1} max={1000}
            className={fieldClass}
            value={formData.points ?? 50}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 50 })}
            placeholder="50"
          />
          <p className="text-[9px] text-slate-400 mt-1">Easy: 50 · Medium: 100 · Hard: 200</p>
        </div>
      </div>

      {/* Categories */}
      <div className="pt-4 border-t border-slate-100">
        <label className={labelClass}>Categories</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
          {categories.map((cat) => {
            const catId = Number(cat.categoryId);
            const isSelected = formData.categoryIds.includes(catId);
            return (
              <button
                key={catId}
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  categoryIds: isSelected
                    ? formData.categoryIds.filter((id) => id !== catId)
                    : [...formData.categoryIds, catId],
                })}
                className={`flex items-center justify-between px-3 py-2 rounded-sm border-2 text-[9px] font-black uppercase tracking-wider transition-all ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-900"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                {isSelected && <FiCheck size={10} className="shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
