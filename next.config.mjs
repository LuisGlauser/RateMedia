/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // Os capítulos da documentação são lidos do disco em tempo de execução (/docs/md/*).
  outputFileTracingIncludes: {
    "/docs/**": ["./public/docs/md/**"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.myanimelist.net" },
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
