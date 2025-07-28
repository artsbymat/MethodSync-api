import { VM } from "vm2";

export const runTestCase = (userCode, testCases, functionName) => {
  const results = [];

  if (!userCode || !testCases || !functionName) {
    return {
      passed: false,
      results: [
        {
          input: null,
          expectedOutput: null,
          actualOutput: null,
          result: "Error: Missing userCode, testCases, or functionName",
        },
      ],
    };
  }

  try {
    const wrappedCode = `
      (function() {
        ${userCode}
        return typeof ${functionName} === 'function' ? ${functionName} : null;
      })()
    `;

    const vm = new VM({
      timeout: 1000,
      sandbox: {},
    });

    const userFunc = vm.run(wrappedCode);

    if (typeof userFunc !== "function") {
      return {
        passed: false,
        results: [
          {
            input: null,
            expectedOutput: null,
            actualOutput: null,
            result: `Error: ${functionName} is not a function`,
          },
        ],
      };
    }

    let allPassed = true;

    for (const { input, expectedOutput } of testCases) {
      try {
        const actualOutput = userFunc(input);
        const passed =
          JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);

        if (!passed) allPassed = false;

        results.push({
          input,
          expectedOutput,
          actualOutput,
          result: passed ? "Passed" : "Failed",
        });
      } catch (err) {
        allPassed = false;
        results.push({
          input,
          expectedOutput,
          actualOutput: null,
          result: `Error: ${err.message}`,
        });
      }
    }

    return {
      passed: allPassed,
      results,
    };
  } catch (err) {
    return {
      passed: false,
      results: [
        {
          input: null,
          expectedOutput: null,
          actualOutput: null,
          result: `Global Error: ${err.message}`,
        },
      ],
    };
  }
};

export function extractFunctionNames(code) {
  const functionNames = [];

  // Match function declarations: function namaFunction(...) { ... }
  const functionDeclRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
  let match;
  while ((match = functionDeclRegex.exec(code)) !== null) {
    functionNames.push(match[1]);
  }

  // Match arrow functions and function expressions: const namaFunction = (...) => {...}
  const arrowFunctionRegex =
    /const\s+([a-zA-Z0-9_]+)\s*=\s*(?:\([^\)]*\)|[a-zA-Z0-9_]+)\s*=>/g;
  while ((match = arrowFunctionRegex.exec(code)) !== null) {
    functionNames.push(match[1]);
  }

  // Match function expressions: const namaFunction = function(...) { ... }
  const functionExprRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*function\s*\(/g;
  while ((match = functionExprRegex.exec(code)) !== null) {
    functionNames.push(match[1]);
  }

  return functionNames;
}
