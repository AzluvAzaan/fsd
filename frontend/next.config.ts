import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // FullCalendar 6.x calls ReactDOM.flushSync inside componentDidMount,
  // which React 19 strict mode disallows. Strict mode only affects development.
  reactStrictMode: false,
};

export default nextConfig;
