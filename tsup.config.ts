import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // Output CommonJS and ESM formats
  dts: {
    resolve: true,
    entry: ["src/index.ts"]
  }, // Generate .d.ts files with JSDoc comments
  minify: true, // Minify the output
  sourcemap: false, // Disable source maps
  clean: true // Clean output directory before bundling
});