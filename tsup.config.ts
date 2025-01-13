import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // Output CommonJS and ESM formats
  dts: true, // Generate .d.ts files
  minify: true, // Minify the output
  sourcemap: false, // Disable source maps
  clean: true // Clean output directory before bundling
});