const { sequelize, User, Transaction, initModels } = require("../src/models");

beforeAll(async () => {
    await sequelize.authenticate();
    await initModels();
});

beforeEach(async () => {
    await Transaction.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
});

afterAll(async () => {
    await sequelize.close();
});

