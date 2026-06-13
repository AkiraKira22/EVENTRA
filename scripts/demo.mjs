// Full local demo WITHOUT MongoDB Atlas.
// Starts an in-memory MongoDB, seeds sample data, then runs `next dev`.
// Run: npm run demo  →  open http://localhost:3000
//
// The mongod binary is downloaded once and cached for subsequent runs.
import { MongoMemoryServer } from "mongodb-memory-server";
import { spawn } from "node:child_process";

const PORT = 27018;
const URI = `mongodb://127.0.0.1:${PORT}/eventra`;

console.log("⏳ Starting in-memory MongoDB (downloads once on first run)…");
const mongo = await MongoMemoryServer.create({
  instance: { port: PORT, ip: "127.0.0.1", dbName: "eventra" },
});
console.log("✓ In-memory MongoDB ready:", URI);

const env = {
  ...process.env,
  MONGODB_URI: URI,
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET:
    process.env.NEXTAUTH_SECRET || "demo-only-secret-change-in-production-000000",
};

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit", env, shell: true });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited with code ${code}`))
    );
  });
}

try {
  console.log("🌱 Seeding sample data…");
  await run("npx", ["tsx", "scripts/seed.ts"]);

  console.log("🚀 Starting dev server at http://localhost:3000 …");
  console.log("   Login: admin@eventra.dev / password123  (Ctrl+C to stop)\n");
  await run("npx", ["next", "dev", "-p", "3000"]);
} finally {
  await mongo.stop();
}
