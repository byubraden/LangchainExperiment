#!/usr/bin/env node
// Run once locally to pre-compute embeddings:
//   node scripts/generate-embeddings.js

import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../server/.env") });

const knowledgeDir = path.join(__dirname, "../server/knowledge");
const outputFile = path.join(knowledgeDir, "embeddings.json");

const files = fs.readdirSync(knowledgeDir).filter((f) => f.endsWith(".md"));
const docs = files.map((file) => ({
  content: fs.readFileSync(path.join(knowledgeDir, file), "utf-8"),
  source: file,
}));

console.log(`Embedding ${docs.length} documents...`);

const embeddings = new VoyageEmbeddings({
  apiKey: process.env.VOYAGE_API_KEY,
  modelName: "voyage-3-lite",
});

const vectors = await embeddings.embedDocuments(docs.map((d) => d.content));

const output = docs.map((doc, i) => ({
  source: doc.source,
  content: doc.content,
  embedding: vectors[i],
}));

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
console.log(`Saved embeddings to ${outputFile}`);