import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Only allow numbers, operators, parens, spaces, and decimal points
const SAFE_EXPRESSION = /^[0-9+\-*/().,\s%^]+$/;

export const calculatorTool = tool(
  async ({ expression }) => {
    try {
      if (!SAFE_EXPRESSION.test(expression)) {
        return `Error: expression contains invalid characters: "${expression}"`;
      }
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict"; return (${expression})`)();
      if (!isFinite(result)) return `Error: result is not a finite number`;
      return String(result);
    } catch (err) {
      return `Error evaluating expression: ${err.message}`;
    }
  },
  {
    name: "calculator",
    description:
      "Evaluates a mathematical expression. Useful for calculating pack weight, calories burned, distances, elevation gain, gear ratios, or any other numeric computation. Input must be a valid math expression like '15 * 24' or '(8.5 + 2.3) * 0.45'.",
    schema: z.object({
      expression: z.string().describe("A mathematical expression to evaluate, e.g. '42 * 7'"),
    }),
  }
);
