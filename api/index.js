import { app, initApp } from "../server/src/app.js";

// Initialize KB once per cold start
let ready = false;
if (!ready) {
  await initApp();
  ready = true;
}

export default app;