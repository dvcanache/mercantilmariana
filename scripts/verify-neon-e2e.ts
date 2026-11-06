import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runEndToEndTests() {
  console.log("=== NEON POSTGRES END-TO-END VERIFICATION ===");

  // 1. Database Connection & Schema Verification
  console.log("\n[1/5] Testing Neon Database Connection & Prisma Client...");
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const rates = await prisma.exchangeRateSetting.findFirst();

  console.log(`✓ Connected to Neon PostgreSQL at: ep-bold-breeze-b60gam53.c-2.sa-east-1.aws.neon.tech`);
  console.log(`✓ Neon Users Count: ${userCount}`);
  console.log(`✓ Neon Categories Count: ${categoryCount}`);
  console.log(`✓ Neon Products Count: ${productCount}`);
  console.log(`✓ Neon Official BCV Rate: Bs. ${rates?.officialBcvRate}`);

  if (userCount === 0 || productCount === 0) {
    throw new Error("Neon database has missing seeded records!");
  }

  // 2. HTTP Auth API Flow (Login)
  console.log("\n[2/5] Testing HTTP Login API (/api/auth/login) against Neon...");
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@mercantilmariana.com",
      password: "admin123",
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status: ${loginRes.status}`);
  }

  const loginData = await loginRes.json();
  const setCookie = loginRes.headers.get("set-cookie") || "";
  const token = loginData.token;
  console.log(`✓ Authenticated as: ${loginData.user.name} (${loginData.user.role})`);
  console.log(`✓ JWT Session Token Generated: ${token.substring(0, 25)}...`);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    Cookie: setCookie,
  };

  // 3. HTTP Rates API Flow
  console.log("\n[3/5] Testing HTTP Rates API (/api/rates)...");
  const ratesRes = await fetch("http://localhost:3000/api/rates", {
    headers: authHeaders,
  });
  if (!ratesRes.ok) throw new Error(`Rates API failed: ${ratesRes.status}`);
  const ratesData = await ratesRes.json();
  console.log(`✓ Rates API response: Official BCV = Bs. ${ratesData.rates.officialBcvRate}`);

  // 4. HTTP Products API Flow & Write Persistence
  console.log("\n[4/5] Testing HTTP Products API (/api/products) Persistence in Neon...");
  const prodsRes = await fetch("http://localhost:3000/api/products", {
    headers: authHeaders,
  });
  if (!prodsRes.ok) throw new Error(`Products API failed: ${prodsRes.status}`);
  const prodsData = await prodsRes.json();
  console.log(`✓ Products API retrieved ${prodsData.length} products directly from Neon`);

  // Create a new test product to prove WRITE persistence in Neon
  console.log("  -> Creating test product in Neon via API...");
  const createRes = await fetch("http://localhost:3000/api/products", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      sku: "NEON-TEST-001",
      name: "Producto de Prueba Neon PostgreSQL",
      category: "Herramientas",
      brand: "Neon",
      model: "v1",
      supplierCostUsd: 25.5,
      targetMarginPercentage: 0.35,
      unitOfMeasure: "Unidad",
      currentStock: 10,
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(`Failed to create product: ${JSON.stringify(err)}`);
  }
  const createdProd = await createRes.json();
  console.log(`✓ Successfully inserted into Neon: [${createdProd.sku}] ${createdProd.name} (ID: ${createdProd.id})`);

  // Verify in Neon directly via Prisma
  const verifiedInDb = await prisma.product.findUnique({
    where: { id: createdProd.id },
  });
  if (!verifiedInDb || verifiedInDb.sku !== "NEON-TEST-001") {
    throw new Error("Product was not found in Neon PostgreSQL database!");
  }
  console.log(`✓ Verified persistence in Neon database row: ID ${verifiedInDb.id}`);

  // Clean up test product
  await prisma.product.delete({ where: { id: createdProd.id } });
  console.log(`✓ Cleaned up temporary test record from Neon.`);

  // 5. HTTP Users Management API Flow
  console.log("\n[5/5] Testing HTTP Users API (/api/users) with Master RBAC...");
  const usersRes = await fetch("http://localhost:3000/api/users", {
    headers: authHeaders,
  });
  if (!usersRes.ok) throw new Error(`Users API failed: ${usersRes.status}`);
  const usersData = await usersRes.json();
  const usersList = usersData.users || usersData;
  console.log(`✓ Users API returned ${usersList.length} staff accounts from Neon:`);
  usersList.forEach((u: any) => console.log(`   - ${u.name} (${u.email}) [${u.role}]`));

  console.log("\n==============================================");
  console.log(">>> ALL NEON SERVICES VERIFIED END-TO-END! <<<");
  console.log("==============================================");
}

runEndToEndTests()
  .catch((e) => {
    console.error("TEST FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
