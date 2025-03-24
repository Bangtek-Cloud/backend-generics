import { server } from "./server";

async function main() {
    try {
        await server.listen({ port: 3000, host: "0.0.0.0" });
        console.info("🚀 Server running on http://localhost:3000");
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
