"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Starting to seed database...');
        // Clean up existing data (optional - remove in production)
        console.log('Cleaning up existing data...');
        yield prisma.account.deleteMany({});
        yield prisma.user.deleteMany({});
        // Create users with accounts
        const users = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                phoneno: '1234567890',
                initialBalance: 1000.00
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                phoneno: '2345678901',
                initialBalance: 1500.00
            },
            {
                name: 'Robert Johnson',
                email: 'robert@example.com',
                phoneno: '3456789012',
                initialBalance: 750.50
            },
            {
                name: 'Sarah Williams',
                email: 'sarah@example.com',
                phoneno: '4567890123',
                initialBalance: 2500.75
            },
            {
                name: 'Michael Brown',
                email: 'michael@example.com',
                phoneno: '5678901234',
                initialBalance: 500.25
            }
        ];
        console.log('Creating users with accounts...');
        for (const userData of users) {
            const { name, email, phoneno, initialBalance } = userData;
            yield prisma.user.create({
                data: {
                    name,
                    email,
                    phoneno,
                    account: {
                        create: {
                            balance: initialBalance
                        }
                    }
                }
            });
        }
        // Simulate some transfers between users
        console.log('Simulating transactions...');
        // Get the created users
        const john = yield prisma.user.findUnique({
            where: { email: 'john@example.com' },
            include: { account: true }
        });
        const jane = yield prisma.user.findUnique({
            where: { email: 'jane@example.com' },
            include: { account: true }
        });
        const robert = yield prisma.user.findUnique({
            where: { email: 'robert@example.com' },
            include: { account: true }
        });
        // John sends $100 to Jane
        if (john && jane && john.account && jane.account) {
            yield prisma.$transaction([
                prisma.account.update({
                    where: { id: john.account.id },
                    data: { balance: { decrement: 100 } }
                }),
                prisma.account.update({
                    where: { id: jane.account.id },
                    data: { balance: { increment: 100 } }
                })
            ]);
            console.log(`Transferred $100 from ${john.name} to ${jane.name}`);
        }
        // Jane sends $50 to Robert
        if (jane && robert && jane.account && robert.account) {
            yield prisma.$transaction([
                prisma.account.update({
                    where: { id: jane.account.id },
                    data: { balance: { decrement: 50 } }
                }),
                prisma.account.update({
                    where: { id: robert.account.id },
                    data: { balance: { increment: 50 } }
                })
            ]);
            console.log(`Transferred $50 from ${jane.name} to ${robert.name}`);
        }
        // Print final state
        const allUsers = yield prisma.user.findMany({
            include: { account: true }
        });
        console.log('\nDatabase seeded successfully!');
        console.log('\nFinal user and account states:');
        allUsers.forEach(user => {
            var _a;
            console.log(`${user.name} (${user.email}) - Balance: $${(_a = user.account) === null || _a === void 0 ? void 0 : _a.balance}`);
        });
    });
}
main()
    .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    // Close Prisma connection
    yield prisma.$disconnect();
}));
