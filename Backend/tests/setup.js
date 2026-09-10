// Spins up an in-memory MongoDB per test process so no test can reach Atlas.
// database.js is never called; we connect mongoose ourselves and every model
// registered by the modules under test binds to this connection.
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

let mongo;

// mail.service.js opens a real SMTP transport on import and verifies it. Mock
// the single transport rather than each caller, so utils/email.js and
// utils/accountEmails.js keep their real logic and this stub can't drift as
// their export lists change.
vi.mock("../src/services/mail.service.js", () => ({
  sendEmail: vi.fn().mockResolvedValue({ messageId: "test" }),
}));

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), { dbName: "aidedesk-test" });
});

afterEach(async () => {
  // Clear rather than drop: dropping loses the indexes the models declared,
  // and several findings under test are index-enforced.
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
});
