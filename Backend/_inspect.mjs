import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
await mongoose.connect((process.env.MONGO_URI || "").trim());
const db = mongoose.connection.db;

const companyId = new mongoose.Types.ObjectId("69fe3fa7245051f0a46777fd");
const workspaceId = new mongoose.Types.ObjectId("69fe40fb245051f0a46777fe");

const run = async (label, filter) => {
  const customers = await db
    .collection("users")
    .find(filter)
    .project({ name: 1 })
    .toArray();
  console.log(label, "->", customers.length, customers.map((c) => c.name).join(", "));
};

await run("current (accountStatus === active)", {
  companyId,
  workspaceId,
  accountStatus: "active",
});
await run("proposed ($nin deleted/suspended)", {
  companyId,
  workspaceId,
  accountStatus: { $nin: ["deleted", "suspended"] },
});

// how many docs are missing the field entirely
const missing = await db
  .collection("users")
  .countDocuments({ accountStatus: { $exists: false } });
console.log("users missing accountStatus field:", missing);

await mongoose.disconnect();
