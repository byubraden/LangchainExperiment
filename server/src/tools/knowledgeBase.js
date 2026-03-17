import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import path from "path";

let vectorStore = null;

export async function initKnowledgeBase() {
  const knowledgeDir = path.join(process.cwd(), "knowledge");
  const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));

  const docs = files.map((file) => ({
    pageContent: fs.readFileSync(path.join(knowledgeDir, file), "utf-8"),
    metadata: { source: file },
  }));

  const embeddings = new VoyageEmbeddings({
    apiKey: process.env.VOYAGE_API_KEY,
    modelName: "voyage-3-lite",
  });

  vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  return vectorStore;
}

export const knowledgeBaseTool = tool(
  async ({ query }) => {
    if (!vectorStore) throw new Error("Knowledge base not initialized");
    const results = await vectorStore.similaritySearch(query, 3);
    return results
      .map((r) => `[Source: ${r.metadata.source}]\n${r.pageContent}`)
      .join("\n\n---\n\n");
  },
  {
    name: "knowledge_base",
    description:
      "Search the adventure knowledge base for information about hiking, climbing, survival, gear, and nutrition specific to Moab and the Colorado Plateau. Use this before web search for general knowledge questions.",
    schema: z.object({
      query: z.string().describe("The topic or question to search for"),
    }),
  }
);
