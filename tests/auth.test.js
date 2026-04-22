const request = require("supertest");
const app = require("../src/app");

describe("Authentication endpoints", () => {
    test("POST /api/auth/register creates a user", async () => {
        const response = (await request(app).post("/api/auth/register")).send({
            email: "auth-register@example.com",
            password: "Password123",
        });
        expect(response.status).toBe(201);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.email).toBe("auth-register@example.com");
        expect(response.body.user.id).toEqual(expect.any(Number));
    });
    test("POST /api/auth/login returns JWT token", async () => {
        (
            await request(app).post("/api/auth/register")).send({
                email: "auth-login@example.com",
                password: "Password123",
            });
        const response = await request(app).post("/api/auth/login").send({
            email: "auth-login@example.com",
            password: "Password123",
        });
        expect(response.status).toBe(200);
        expect(response.body.token).toEqual(expect.any(String));
        expect(response.body.user).toEqual(
            expect.objectContaining({
                email: "auth-login@example.com",
            })
        );
    });
});