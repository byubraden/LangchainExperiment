# Phase 3 — RAG Knowledge Base
**Status: NOT STARTED**

## Goal
Build a vector-search knowledge base over 6 curated adventure documents. Add it as a third tool to the agent with source attribution on every result.

## Checklist
- [ ] Create `server/knowledge/` directory
- [ ] Write 6 adventure knowledge base documents (see list below)
- [ ] Implement `server/src/tools/knowledgeBase.js`
  - [ ] Load and chunk documents
  - [ ] Generate Voyage AI embeddings
  - [ ] Store in `MemoryVectorStore`
  - [ ] Expose as a LangChain tool with source attribution
- [ ] Add `knowledgeBaseTool` to agent in `agent.js`
- [ ] Initialize vector store at server startup (not per-request)
- [ ] Test knowledge retrieval from terminal

## Knowledge Base Documents
All files go in `server/knowledge/`. Each must have meaningful content (not placeholder).

| Filename | Topics to Cover |
|----------|----------------|
| `hiking-essentials.md` | The 10 essentials, navigation, trail prep, blister care, elevation gain |
| `climbing-safety.md` | Rope systems, belay devices, anchors, fall factors, helmet use, communication signals |
| `survival-basics.md` | Shelter building, fire starting methods, water purification, signaling rescuers, rule of threes |
| `gear-guide.md` | Layering systems (base/mid/shell), pack weight targets, materials (merino, GORE-TEX, Dyneema), boot selection |
| `nutrition-hydration.md` | Calorie needs by activity, electrolytes, water sourcing, treatment methods, high-altitude appetite loss |
| `leave-no-trace.md` | 7 LNT principles, campsite selection, waste disposal, wildlife interactions, campfire ethics |

Each document should be 300–500 words with factual, detailed content.

## Implementation Details

### server/src/tools/knowledgeBase.js

```js
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import fs from "fs";
import path from "path";

// Load docs at module level — called once at startup
let vectorStore = null;

export async function initKnowledgeBase() {
  const knowledgeDir = path.join(process.cwd(), "knowledge");
  const files = fs.readdirSync(knowledgeDir).filter(f => f.endsWith(".md"));

  const docs = files.map(file => ({
    pageContent: fs.readFileSync(path.join(knowledgeDir, file), "utf-8"),
    metadata: { source: file }
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
      .map(r => `[Source: ${r.metadata.source}]\n${r.pageContent}`)
      .join("\n\n---\n\n");
  },
  {
    name: "knowledge_base",
    description: "Search the adventure knowledge base for information about hiking, climbing, survival, gear, and nutrition. Use this before web search for general knowledge questions.",
    schema: z.object({ query: z.string().describe("The topic or question to search for") })
  }
);
```

### agent.js update
```js
import { initKnowledgeBase, knowledgeBaseTool } from "./tools/knowledgeBase.js";

// In server startup:
await initKnowledgeBase();

// In agent tools array:
const tools = [calculatorTool, webSearchTool, knowledgeBaseTool];
```

### Chunking Note
For v1, each document is stored as a single document chunk. If documents grow large (>1000 words), consider splitting with `RecursiveCharacterTextSplitter` from `langchain/text_splitter`.

## Done When
- Server starts and logs "Knowledge base initialized with N documents"
- Asking "what are the 10 essentials for hiking?" returns content from `hiking-essentials.md`
- Every answer includes `[Source: filename.md]` attribution
- `bash scripts/test.sh` includes a knowledge base test and passes
