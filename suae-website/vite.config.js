import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/php-api": {
        target:
          "https://suae-php.questdigiflex.com",
        changeOrigin: true,
        secure: true,

        rewrite: (path) =>
          path.replace(/^\/php-api/, ""),

        configure: (proxy) => {
          proxy.on(
            "proxyReq",
            (proxyRequest) => {
              proxyRequest.setHeader(
                "Accept",
                "application/json"
              );
            }
          );

          proxy.on(
            "proxyRes",
            (proxyResponse, request) => {
              console.log(
                `[PHP API] ${request.method} ${request.url} -> ${proxyResponse.statusCode}`
              );
            }
          );

          proxy.on(
            "error",
            (error, request) => {
              console.error(
                `[PHP API ERROR] ${request.method} ${request.url}`,
                error.message
              );
            }
          );
        }
      }
    }
  }
});