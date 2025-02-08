interface EnvConfig {
  apiUrl: string;
  apiKey: string;
}

export const env: EnvConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  apiKey: import.meta.env.VITE_API_KEY,
};