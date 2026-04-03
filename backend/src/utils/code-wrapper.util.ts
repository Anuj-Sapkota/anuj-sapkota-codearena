/**
 * Utility to wrap user code with language-specific boilerplate.
 * Supports different input types to prevent type-mismatch errors.
 */
export const wrapUserCode = (
  userCode: string,
  languageId: number,
  input: string,
  functionName: string,
  inputType: "INT" | "ARRAY" | "STRING" | "BOOLEAN" = "ARRAY",
) => {
  // Helper to convert JSON arrays "[1,2,3]" -> Java/C++ style "{1,2,3}"
  const formatForStaticLanguages = (str: string) =>
    str.replace(/\[/g, "{").replace(/\]/g, "}");

  // --- JAVASCRIPT (Node.js 18+) ---
  if (languageId === 63) {
    const formattedInput = inputType === "STRING" ? `"${input}"` : input;
    return `
${userCode}

(function() {
  try {
    const inputData = ${formattedInput};
    if (typeof ${functionName} !== "function") {
      process.stderr.write("Error: function '${functionName}' is not defined.\\nMake sure your function is named exactly '${functionName}' and has no syntax errors.");
      process.exit(1);
    }
    const result = ${functionName}(inputData);
    if (result === undefined) {
      process.stdout.write("null");
    } else {
      process.stdout.write(JSON.stringify(result));
    }
  } catch (err) {
    if (err instanceof ReferenceError && err.message.includes("${functionName}")) {
      process.stderr.write("Error: function '${functionName}' is not defined.\\nMake sure your function is named exactly '${functionName}' and has no syntax errors.");
    } else {
      process.stderr.write(err.stack || err.message);
    }
    process.exit(1);
  }
})();
    `;
  }

  // --- PYTHON (3.10+) ---
  if (languageId === 71) {
    const formattedInput = inputType === "STRING" ? `"${input}"` : input;
    return `
import json
import sys

${userCode}

if __name__ == "__main__":
    try:
        input_data = ${formattedInput}
        # Handle cases where user defines a class Solution or a standalone function
        if 'Solution' in globals():
            sol = Solution()
            method = getattr(sol, "${functionName}")
            result = method(input_data)
        else:
            result = ${functionName}(input_data)
        
        print(json.dumps(result), end="")
    except Exception as e:
        sys.stderr.write(str(e))
        sys.exit(1)
    `;
  }

  // --- JAVA (OpenJDK 17) ---
  if (languageId === 62) {
    let typeDecl = "int";
    let inputVal = input;

    if (inputType === "ARRAY") {
      typeDecl = "int[]";
      inputVal = `new int[]${formatForStaticLanguages(input)}`;
    } else if (inputType === "STRING") {
      typeDecl = "String";
      inputVal = `"${input}"`;
    }

    return `
import java.util.*;

${userCode.replace(/public class/g, "class")}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            ${typeDecl} inputParam = ${inputVal};
            
            // Invoke the user's method
            Object result = sol.${functionName}(inputParam);
            
            // Format output based on return type
            if (result instanceof int[]) {
                System.out.print(Arrays.toString((int[])result).replace(" ", ""));
            } else {
                System.out.print(result);
            }
        } catch (Exception e) {
            System.err.print(e.getMessage());
            System.exit(1);
        }
    }
}
    `;
  }
  // --- C++ (GCC 13) ---
  if (languageId === 54) {
    let typeDecl = "int";
    let inputVal = input;

    if (inputType === "ARRAY") {
      typeDecl = "vector<int>";
      inputVal = formatForStaticLanguages(input);
    } else if (inputType === "STRING") {
      typeDecl = "string";
      inputVal = `"${input}"`;
    }

    return `
#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <climits>

using namespace std;

${userCode}

// 1. Vector overload
void printResult(const vector<int>& res) {
    cout << "[";
    for (size_t i = 0; i < res.size(); ++i) {
        cout << res[i] << (i == res.size() - 1 ? "" : ",");
    }
    cout << "]";
}

// 2. Specific int overload (Prevents ambiguity)
void printResult(int res) {
    cout << res;
}

// 3. Specific long long overload
void printResult(long long res) {
    cout << res;
}

// 4. Specific string overload
void printResult(const string& res) {
    cout << "\\"" << res << "\\"";
}

// 5. Specific bool overload (using a dummy to prevent int-to-bool ambiguity)
void printResult(bool res) {
    cout << (res ? "true" : "false");
}

int main() {
    try {
        Solution sol;
        ${typeDecl} inputParam = ${inputVal};
        auto result = sol.${functionName}(inputParam);
        printResult(result);
    } catch (const exception& e) {
        cerr << e.what();
        return 1;
    }
    return 0;
}
`;
  }

  return userCode;
};
