import { execute } from "../services/dummy-services.js";
import dotenv from "dotenv";
import { addOTP, addReset, addInvite } from "../queues/email.js";
import { emailWorker } from "../workers/email.js";

dotenv.config();

test("execute function testing", () => {
  const result = execute();
  expect(["Learning Js", "Learning ReactJs"]).toContain(result);
});

describe("Email System Tests", () => {
  afterAll(async () => {
    await emailWorker.close();
  });

  test("should send OTP email", async () => {
    const result = await addOTP("test@example.com", "123456", "John");
    expect(result.success).toBe(true);
  });

  test("should prevent duplicate OTP emails", async () => {
    const email = "duplicate@example.com";

    const first = await addOTP(email, "111111", "User");
    expect(first.success).toBe(true);

    const second = await addOTP(email, "222222", "User");
    expect(second.success).toBe(false);
    expect(second.error).toContain("already sent");
  });

  test("should send reset email", async () => {
    const result = await addReset("reset@example.com", "789012", "Jane");
    expect(result.success).toBe(true);
  });

  test("should send invite email", async () => {
    const result = await addInvite(
      "invite@example.com",
      "token123",
      "company456",
      "Bob"
    );
    expect(result.success).toBe(true);
  });
});
