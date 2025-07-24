import { VM } from "vm2";

export const runTestCase = (userCode, testCases) => {
  const results = [];

  for (const testCase of testCases) {
    const { input, expectedOutput } = testCase;
    const vm = new VM({
      timeout: 1000,
      sandbox: {},
    });

    try {
      const codeToRun = `
        const input = ${JSON.stringify(input)};
        ${userCode}
      `;
      const result = vm.run(codeToRun);
      results.push({
        input,
        expected: expectedOutput,
        actual: result,
        passed: JSON.stringify(result) === JSON.stringify(expectedOutput),
      });
    } catch (error) {
      results.push({
        input,
        expected: expectedOutput,
        actual: null,
        passed: false,
        error: error.message,
      });
    }
  }

  return results;
};
