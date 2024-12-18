import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Allows access from the local network
    port: 8000,      // You can specify a custom port (default is 5173)
    open: true       // Optional: Automatically open the app in your default browser
  }
});