const request = require("supertest");
const app = require("../src/app");

async function createAuthToken() {
    const email = `analytics-${Date.now()}@example.com`;
    const password = "Password123";

    await request(app).post("/api/auth/register").send({ email, password });
    const loginResponse = await request(app).post("/api/auth/login").send({ email, password });
    return loginResponse.body.token;
}

describe("Analytics endpoints", () => {
    test("GET /api/analytics/insights returns top category, prediction, and anomalies", async () => {
        const token = await createAuthToken();
        const payloads = [
            { amount: 50, type: "expense", category: "Food", date: "2026-01-05", description: "Lunch" },
            { amount: 60, type: "expense", category: "Food", date: "2026-02-10", description: "Dinner" },
            { amount: 80, type: "expense", category: "Transport", date: "2026-03-15", description: "Fuel" },
            { amount: 200, type: "expense", category: "Food", date: "2026-04-10", description: "Bulk groceries" },
            { amount: 1200, type: "expense", category: "Travel", date: "2026-04-22", description: "Flight" },
        ];

        for (const tx of payloads) {
            await request(app).post("/api/transactions").set("Authorization", `Bearer ${token}`).send(tx);
        }

        const response = await request(app).get("/api/analytics/insights").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.insights).toEqual(
            expect.objectContaining({
                topSpendingCategory: expect.objectContaining({
                    category: expect.any(String),
                    total: expect.any(Number),
                }),
                averageSpendingPerCategory: expect.any(Array),
                monthlyTrend: expect.any(Array),
                predictedNextMonthSpending: expect.any(Number),
                unusualTransactions: expect.any(Array),
            })
        );
        expect(response.body.insights.topSpendingCategory.category).toBe("Travel");
    });
});
