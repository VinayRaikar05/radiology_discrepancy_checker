import { describe, it, expect, vi, beforeEach } from "vitest"

// Mock the supabase module before importing auth
vi.mock("@/lib/supabase", () => ({
  getSupabaseForServer: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: null,
            error: { message: "User not found" },
          })),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: "test-uuid",
              email: "test@hospital.org",
              full_name: "Dr. Test",
              role: "radiologist",
              department: "Radiology",
            },
            error: null,
          })),
        })),
      })),
    })),
  })),
}))

// Must import after mocking
import { hashPassword } from "@/lib/auth"

describe("Auth Module", () => {
  describe("hashPassword", () => {
    it("should hash a password and return a bcrypt hash", async () => {
      const password = "SecureP@ssw0rd!"
      const hash = await hashPassword(password)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(password)
      expect(hash.startsWith("$2a$12$")).toBe(true) // bcrypt with 12 salt rounds
    })

    it("should produce different hashes for the same password", async () => {
      const password = "TestPassword123"
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)

      expect(hash1).not.toBe(hash2) // Different salts
    })
  })

  describe("Input validation", () => {
    it("should not use a hardcoded fallback secret", async () => {
      const mod = await import("@/lib/auth")

      // Verify authOptions exists and has session strategy
      expect(mod.authOptions).toBeDefined()
      expect(mod.authOptions.session?.strategy).toBe("jwt")

      // Verify session has maxAge (was missing before our fix)
      expect(mod.authOptions.session?.maxAge).toBe(8 * 60 * 60) // 8 hours

      // Verify the secret is NOT the old hardcoded fallback
      const secret = mod.authOptions.secret
      expect(secret).not.toBe("development-secret-key-change-in-production")
    })
  })
})
