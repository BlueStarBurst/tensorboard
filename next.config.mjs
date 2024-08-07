/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/tensorboard",
    output: "export",  // <=== enables static exports
    reactStrictMode: true,
};

export default nextConfig;
