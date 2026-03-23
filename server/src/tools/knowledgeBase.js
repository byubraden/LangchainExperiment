import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let vectorStore = null;
let rawDocs = [];

export async function initKnowledgeBase() {
  const knowledgeDir = path.join(__dirname, "../../knowledge");
  const embeddingsFile = path.join(knowledgeDir, "embeddings.json");

  if (fs.existsSync(embeddingsFile)) {
    // Load pre-computed embeddings — no Voyage API call at startup
    const data = JSON.parse(fs.readFileSync(embeddingsFile, "utf-8"));
    rawDocs = data.map((d) => ({ pageContent: d.content, metadata: { source: d.source } }));
    vectorStore = new MemoryVectorStore(new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
      modelName: "voyage-3-lite",
    }));
    vectorStore.memoryVectors = data.map((d, i) => ({
      id: String(i),
      content: d.content,
      embedding: d.embedding,
      metadata: { source: d.source },
    }));
  } else {
    // Fallback: embed at startup (local dev without pre-computed file)
    const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));
    const docs = files.map((file) => ({
      pageContent: fs.readFileSync(path.join(knowledgeDir, file), "utf-8"),
      metadata: { source: file },
    }));
    const embeddings = new VoyageEmbeddings({
      apiKey: process.env.VOYAGE_API_KEY,
      modelName: "voyage-3-lite",
    });
    rawDocs = docs;
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
  }

  return vectorStore;
}

export const knowledgeBaseTool = tool(
  async ({ query }) => {
    if (!vectorStore && rawDocs.length === 0) throw new Error("Knowledge base not initialized");

    let results;
    try {
      results = await vectorStore.similaritySearch(query, 5);
    } catch {
      // Voyage rate-limited — fall back to keyword search
      const terms = query.toLowerCase().split(/\s+/);
      results = rawDocs
        .map((d) => {
          const text = d.pageContent.toLowerCase();
          const score = terms.filter((t) => text.includes(t)).length;
          return { ...d, score };
        })
        .filter((d) => d.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    }

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
