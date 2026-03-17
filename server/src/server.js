import { app, initApp } from "./app.js";

const PORT = process.env.PORT || 3001;

await initApp();

app.listen(PORT, () => {
  console.log(`{"level":30,"message":"Adventure Agent server running on port ${PORT}"}`);
});