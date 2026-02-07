export const wrapUserCode = (
  userCode: string,
  languageId: number,
  input: string,
  functionName: string,
) => {
  // Helper to convert "[1,2,3]" -> "{1,2,3}" for C++/Java array initialization
  const formatInput = (str: string) =>
    str.replace(/\[/g, "{").replace(/\]/g, "}");

  // --- JAVASCRIPT (Node.js 18+) ---
  if (languageId === 63) {
    return `
${userCode}

try {
  const inputData = ${input}; 
  const result = ${functionName}(inputData);
  const output = JSON.stringify(result);
  process.stdout.write(typeof output === 'undefined' ? "null" : output);
} catch (err) {
  process.stderr.write(err.stack || err.message);
}
    `;
  }

  // --- PYTHON (3.10+) ---
  if (languageId === 71) {
    return `
import json
import sys

${userCode}

if __name__ == "__main__":
    try:
        input_data = ${input}
        if 'Solution' in globals():
            sol = Solution()
            method = getattr(sol, "${functionName}")
            result = method(input_data)
        else:
            result = ${functionName}(input_data)
        print(json.dumps(result), end="")
    except Exception as e:
        sys.stderr.write(str(e))
    `;
  }

  // --- JAVA (OpenJDK 17) ---
  if (languageId === 62) {
    const javaInput = formatInput(input);
    return `
import java.util.*;

// User code (class Solution) must be outside the public Main class
${userCode.replace(/public class/g, "class")}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            // Specifically handling the move-zeroes int array type
            int[] nums = new int[]${javaInput};
            int[] result = sol.${functionName}(nums);
            // Print result as [1,3,12,0,0] without spaces for backend comparison
            System.out.print(Arrays.toString(result).replace(" ", ""));
        } catch (Exception e) {
            System.err.print(e.getMessage());
        }
    }
}
    `;
  }

  // --- C++ (GCC 13) ---
  if (languageId === 54) {
    const cppInput = formatInput(input);
    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

// User code (class Solution) provided here
${userCode}

int main() {
    try {
        Solution sol;
        vector<int> nums = ${cppInput};
        vector<int> result = sol.${functionName}(nums);
        
        cout << "[";
        for (size_t i = 0; i < result.size(); ++i) {
            cout << result[i] << (i == result.size() - 1 ? "" : ",");
        }
        cout << "]";
    } catch (const exception& e) {
        cerr << e.what();
    }
    return 0;
}
    `;
  }

  return userCode;
};
