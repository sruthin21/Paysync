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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const accountrouter = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET - Get user balance
accountrouter.get('/balance', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.query.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        const account = yield prisma.account.findFirst({
            where: {
                userId: Number(userId)
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found for this user'
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                accountId: account.id,
                balance: account.balance,
                user: account.user
            }
        });
    }
    catch (error) {
        console.error('Error fetching balance:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching balance',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}));
// POST - Deposit money to account
accountrouter.post('/deposit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, amount } = req.body;
        // Input validation
        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'User ID and amount are required'
            });
        }
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Deposit amount must be positive'
            });
        }
        // Perform atomic transaction
        const updatedAccount = yield prisma.$transaction((prismaClient) => __awaiter(void 0, void 0, void 0, function* () {
            // Get account with a lock for update
            const account = yield prismaClient.account.findFirst({
                where: { userId: Number(userId) }
            });
            if (!account) {
                throw new Error('Account not found');
            }
            // Update balance
            return prismaClient.account.update({
                where: { id: account.id },
                data: {
                    balance: { increment: amount }
                },
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });
        }));
        return res.status(200).json({
            success: true,
            message: `Successfully deposited ${amount} to account`,
            data: {
                accountId: updatedAccount.id,
                newBalance: updatedAccount.balance,
                userName: updatedAccount.user.name
            }
        });
    }
    catch (error) {
        console.error('Error depositing to account:', error);
        if (error.message === 'Account not found') {
            return res.status(404).json({
                success: false,
                message: 'Account not found for this user'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'An error occurred while depositing to account',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}));
// POST - Withdraw money from account
accountrouter.post('/withdraw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, amount } = req.body;
        // Input validation
        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'User ID and amount are required'
            });
        }
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Withdrawal amount must be positive'
            });
        }
        // Perform atomic transaction
        const updatedAccount = yield prisma.$transaction((prismaClient) => __awaiter(void 0, void 0, void 0, function* () {
            // Get account with a lock for update
            const account = yield prismaClient.account.findFirst({
                where: { userId: Number(userId) }
            });
            if (!account) {
                throw new Error('Account not found');
            }
            // Check sufficient balance
            if (account.balance < amount) {
                throw new Error('Insufficient balance');
            }
            // Update balance
            return prismaClient.account.update({
                where: { id: account.id },
                data: {
                    balance: { decrement: amount }
                },
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });
        }));
        return res.status(200).json({
            success: true,
            message: `Successfully withdrew ${amount} from account`,
            data: {
                accountId: updatedAccount.id,
                newBalance: updatedAccount.balance,
                userName: updatedAccount.user.name
            }
        });
    }
    catch (error) {
        console.error('Error withdrawing from account:', error);
        if (error.message === 'Account not found') {
            return res.status(404).json({
                success: false,
                message: 'Account not found for this user'
            });
        }
        else if (error.message === 'Insufficient balance') {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance for withdrawal'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'An error occurred while withdrawing from account',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}));
// POST - Transfer money between accounts
accountrouter.post('/transfer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fromUserId, toUserId, amount } = req.body;
        // Input validation
        if (!fromUserId || !toUserId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Source user ID, destination user ID, and amount are required'
            });
        }
        if (fromUserId === toUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot transfer to the same account'
            });
        }
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Transfer amount must be positive'
            });
        }
        // Perform atomic transaction
        const result = yield prisma.$transaction((prismaClient) => __awaiter(void 0, void 0, void 0, function* () {
            // Get source account with a lock for update
            const sourceAccount = yield prismaClient.account.findFirst({
                where: { userId: Number(fromUserId) },
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            if (!sourceAccount) {
                throw new Error('Source account not found');
            }
            // Check sufficient balance
            if (sourceAccount.balance < amount) {
                throw new Error('Insufficient balance');
            }
            // Get destination account with a lock for update
            const destAccount = yield prismaClient.account.findFirst({
                where: { userId: Number(toUserId) },
                include: {
                    user: {
                        select: {
                            name: true
                        }
                    }
                }
            });
            if (!destAccount) {
                throw new Error('Destination account not found');
            }
            // Deduct from source account
            const updatedSourceAccount = yield prismaClient.account.update({
                where: { id: sourceAccount.id },
                data: {
                    balance: { decrement: amount }
                }
            });
            // Add to destination account
            const updatedDestAccount = yield prismaClient.account.update({
                where: { id: destAccount.id },
                data: {
                    balance: { increment: amount }
                }
            });
            return {
                source: Object.assign(Object.assign({}, updatedSourceAccount), { userName: sourceAccount.user.name }),
                destination: Object.assign(Object.assign({}, updatedDestAccount), { userName: destAccount.user.name })
            };
        }));
        return res.status(200).json({
            success: true,
            message: `Successfully transferred ${amount} from ${result.source.userName} to ${result.destination.userName}`,
            data: {
                source: {
                    userId: Number(fromUserId),
                    accountId: result.source.id,
                    newBalance: result.source.balance,
                    userName: result.source.userName
                },
                destination: {
                    userId: Number(toUserId),
                    accountId: result.destination.id,
                    newBalance: result.destination.balance,
                    userName: result.destination.userName
                }
            }
        });
    }
    catch (error) {
        console.error('Error transferring between accounts:', error);
        if (error.message === 'Source account not found') {
            return res.status(404).json({
                success: false,
                message: 'Source account not found'
            });
        }
        else if (error.message === 'Destination account not found') {
            return res.status(404).json({
                success: false,
                message: 'Destination account not found'
            });
        }
        else if (error.message === 'Insufficient balance') {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance for transfer'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'An error occurred while transferring between accounts',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}));
exports.default = accountrouter;
