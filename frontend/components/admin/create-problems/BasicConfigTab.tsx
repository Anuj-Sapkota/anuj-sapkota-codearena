import { FormLabel } from "@/components/ui/Form";
import { CreateProblemDTO, TabProps } from "@/types/problem.types";
import { FaCheckCircle } from "react-icons/fa";

export default function BasicConfigTab({ formData, setFormData, categories = []}: TabProps) {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <FormLabel>Problem Title</FormLabel>
          <input
            className="w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 focus:outline-none focus:ring-4 focus:ring-primary-1/5 focus:border-primary-1 transition-all"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="E.G. BINARY SEARCH ARCHITECTURE"
          />
        </div>
        <div className="space-y-2">
          <FormLabel>Function Name</FormLabel>
          <input
            className="w-full border-2 border-gray-500 rounded-md p-4 bg-white text-gray-900 focus:outline-none font-mono"
            value={formData.functionName}
            onChange={(e) => setFormData({ ...formData, functionName: e.target.value })}
            placeholder="solution"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-gray-100">
        <div className="space-y-2">
          <FormLabel>Difficulty</FormLabel>
          <select
            className="w-full border-2 border-gray-500 rounded-md p-4 bg-white font-bold cursor-pointer"
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as CreateProblemDTO["difficulty"] })}
          >
            <option value="EASY">LEVEL: EASY</option>
            <option value="MEDIUM">LEVEL: MEDIUM</option>
            <option value="HARD">LEVEL: HARD</option>
          </select>
        </div>
        <div className="space-y-2">
          <FormLabel>Time Limit (s)</FormLabel>
          <input type="number" step="0.1" className="w-full border-2 border-gray-500 rounded-md p-4" value={formData.timeLimit} onChange={(e) => setFormData({ ...formData, timeLimit: parseFloat(e.target.value) })} />
        </div>
        <div className="space-y-2">
          <FormLabel>Memory Limit (MB)</FormLabel>
          <input type="number" className="w-full border-2 border-gray-500 rounded-md p-4" value={formData.memoryLimit} onChange={(e) => setFormData({ ...formData, memoryLimit: parseInt(e.target.value) })} />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-gray-100">
        <FormLabel>Taxonomy_Selection (Categories)</FormLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => {
            const catId = Number(cat.categoryId);
            const isSelected = formData.categoryIds.includes(catId);
            return (
              <button
                key={catId}
                type="button"
                onClick={() => setFormData({ ...formData, categoryIds: isSelected ? formData.categoryIds.filter(id => id !== catId) : [...formData.categoryIds, catId] })}
                className={`p-3 rounded-md border-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between cursor-pointer ${isSelected ? "border-primary-1 bg-primary-1/5 text-primary-1" : "border-gray-200 text-gray-400"}`}
              >
                {cat.name}
                {isSelected && <FaCheckCircle size={10} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}