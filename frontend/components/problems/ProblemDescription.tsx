import { FormLabel } from "@/components/ui/Form";

export const ProblemDescription = () => (
  <div className="h-full w-full p-8 overflow-y-auto bg-white text-gray-900 border-r-2 border-gray-600">
    <FormLabel>Problem_Description</FormLabel>
    <h1 className="text-3xl font-black uppercase tracking-tighter mt-2 mb-6">1. Two Sum</h1>
    <p className="text-gray-600 font-medium leading-relaxed mb-6 text-sm">
      Given an array of integers <code className="bg-gray-100 px-1 font-mono text-emerald-600">nums</code>, return indices of the two numbers such that they add up to a specific target.
    </p>
    <div className="space-y-4">
      <FormLabel>Constraints</FormLabel>
      <div className="bg-gray-50 border-2 border-gray-500 p-4 rounded font-mono text-[10px] uppercase text-gray-500">
         Memory: 256MB <br/> Time: 2000ms
      </div>
    </div>
  </div>
);