const request = require("supertest");
const app = require("../src/app");

async function createAuthToken() {
    const email = `transactions-${Date.now()}@example.com`;
    const password = "Password123";

    await request(app).post("/api/auth/register").send({ email, password });

    const loginResponse = await request(app).post("/api/auth/login").send({ email, password });
    return loginResponse.body.token;
}

describe("Transaction endpoints", () => {
    test("POST /api/transactions creates a transaction", async () => {
        const token = await createAuthToken();

        const response = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 120.5,
                type: "expense",
                category: "Food",
                description: "Lunch",
                date: "2026-04-21",
            });

        expect(response.status).toBe(201);
        expect(response.body.transaction).toEqual(
            expect.objectContaining({
                type: "expense",
                category: "Food",
            })
        );
        expect(response.body.transaction.id).toEqual(expect.any(Number));
    });

    test("GET /api/transactions returns transactions for authenticated user", async () => {
        const token = await createAuthToken();

        await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 500,
                type: "income",
                category: "Salary",
                description: "Monthly salary",
                date: "2026-04-01",
            });

        const response = await request(app)
            .get("/api/transactions")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.transactions)).toBe(true);
        expect(response.body.transactions).toHaveLength(1);
        expect(response.body.transactions[0]).toEqual(
            expect.objectContaining({
                type: "income",
                category: "Salary",
            })
        );
    });

    test("PUT /api/transactions/:id updates a transaction", async () => {
        const token = await createAuthToken();

        const createResponse = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 50,
                type: "expense",
                category: "Transport",
                description: "Taxi",
                date: "2026-04-11",
            });

        const transactionId = createResponse.body.transaction.id;

        const updateResponse = await request(app)
            .put(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 65,
                category: "Travel",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.transaction).toEqual(
            expect.objectContaining({
                id: transactionId,
                amount: 65,
                category: "Travel",
            })
        );
    });

    test("DELETE /api/transactions/:id deletes a transaction", async () => {
        const token = await createAuthToken();

        const createResponse = await request(app)
            .post("/api/transactions")
            .set("Authorization", `Bearer ${token}`)
            .send({
                amount: 20,
                type: "expense",
                category: "Snacks",
                description: "Coffee",
                date: "2026-04-19",
            });

        const transactionId = createResponse.body.transaction.id;

        const deleteResponse = await request(app)
            .delete(`/api/transactions/${transactionId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(deleteResponse.status).toBe(200);
        expect(deleteResponse.body).toEqual({
            deleted: true,
            id: transactionId,
        });
    });
});