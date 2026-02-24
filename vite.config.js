import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    allowedHosts: ["333e0d3195ad.ngrok-free.app"],
    https: true,
    host: true,
  },
});
