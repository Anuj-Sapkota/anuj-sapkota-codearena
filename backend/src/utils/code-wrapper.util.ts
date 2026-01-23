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
  process.stdout.write(JSON.stringify(result));
} catch (err) {
  process.stderr.write(err.message);
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
        # Check if the user used a class (LeetCode style) or a standalone function
        input_data = ${input}
        if 'Solution' in globals():
            sol = Solution()
            # Handles calls like sol.twoSum(data)
            result = getattr(sol, "${functionName}")(input_data)
        else:
            result = ${functionName}(input_data)
        print(json.dumps(result), end="")
    except Exception as e:
        sys.stderr.write(str(e))
    `;
  }

  // --- JAVA (OpenJDK 17) ---
  if (languageId === 62) {
    return `
import java.util.*;
import java.util.stream.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            // This assumes the input is a simple integer/array literal
            // For complex inputs, you'd need a JSON parser like Jackson/Gson
            var result = sol.${functionName}(${input});
            System.out.print(result);
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