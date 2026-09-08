import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone package inside a repo that also has yarn.lock / other lockfiles.
  // Without this, Next infers a parent directory as the tracing root.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
