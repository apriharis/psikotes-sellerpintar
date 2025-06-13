const { execSync } = require("child_process")

console.log("Setting up the project...")

try {
  // Install dependencies
  console.log("Installing dependencies...")
  execSync("npm install", { stdio: "inherit" })

  // Generate Prisma client
  console.log("Generating Prisma client...")
  execSync("npx prisma generate", { stdio: "inherit" })

  // Push database schema
  console.log("Setting up database...")
  execSync("npx prisma db push", { stdio: "inherit" })

  console.log("✅ Setup complete!")
  console.log("")
  console.log("Next steps:")
  console.log("1. Copy .env.example to .env and update the values")
  console.log("2. Run: npm run dev")
  console.log("3. Visit: http://localhost:3000")
} catch (error) {
  console.error("❌ Setup failed:", error.message)
  process.exit(1)
}
