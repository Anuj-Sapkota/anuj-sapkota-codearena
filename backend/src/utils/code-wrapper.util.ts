export const wrapUserCode = (
  userCode: string,
  languageId: number,
  input: string,
  functionName: string,
) => {
  // --- JAVASCRIPT (Node.js 18+) ---
  if (languageId === 63) {
    return `
${userCode}

try {
  const inputData = ${input}; 
  const result = ${functionName}(inputData);
  
  // FIX: JSON.stringify(undefined) is undefined. 
  // We use "null" or an empty string as a fallback to prevent ERR_INVALID_ARG_TYPE.
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
${userCode}

import json
import sys

if __name__ == "__main__":
    try:
        input_data = ${input}
        if 'Solution' in globals():
            sol = Solution()
            method = getattr(sol, "${functionName}")
            result = method(input_data)
        else:
            result = ${functionName}(input_data)
        
        # Python's json.dumps handles None/undefined safely as "null"
        print(json.dumps(result), end="")
    except Exception as e:
        sys.stderr.write(str(e))
    `;
  }

  // --- JAVA (OpenJDK 17) ---
  if (languageId === 62) {
    // Note: Java result might need String.valueOf to avoid issues with null objects
    return `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            var result = sol.${functionName}(${input});
            System.out.print(String.valueOf(result));
        } catch (Exception e) {
            System.err.print(e.getMessage());
        }
    }
}
    `;
  }

  // --- C++ (GCC 13) ---
  if (languageId === 54) {
    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

${userCode}

int main() {
    Solution sol;
    try {
        // C++ is strictly typed, so result will rarely be "undefined" 
        // but we wrap for consistency
        auto result = sol.${functionName}(${input});
        cout << result;
    } catch (const exception& e) {
        cerr << e.what();
    }
    return 0;
}
    `;
  }

  return userCode;
};
