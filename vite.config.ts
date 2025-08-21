// import { defineConfig } from "vite";
// import { reactRouter } from "@react-router/dev/vite";
// import tailwindcss from "@tailwindcss/vite";
// import tsconfigPaths from "vite-tsconfig-paths";
//
// export default defineConfig({
//   plugins: [
//     tsconfigPaths(),
//     tailwindcss(),
//     reactRouter(), // ✅ no args
//   ],
// });

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  build: {
    cssMinify: true,
    ssr: false,
  },
  ssr: {
    noExternal: ["styled-components"]
  }
});;