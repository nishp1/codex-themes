import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  build: {
    sourcemap: true,
  },
  plugins: [tailwindcss(), react()],
})
