import { createRequestHandler } from "react-router";
import * as build from "./build/server/index.js";

// Force a non-streaming fallback if the Node renderer is missing
if (typeof globalThis.ReactDOMServer === "undefined") {
  globalThis.ReactDOMServer = {
    renderToPipeableStream: () => {
      throw new Error("Streaming not available on Workers");
    },
  };
}

const handler = createRequestHandler(build, process.env.NODE_ENV);

export default {
  async fetch(request, env, ctx) {
    try {
      return await handler(request);
    } catch (err) {
      console.error("Handler error:", err);
      return new Response(
        `<html><body><h1>App error</h1><pre>${err.message}</pre></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }
  },
};
