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
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// GET - Fetch users with filtering options
router.get('/bulk', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phoneno } = req.query;
        // Build filter conditions dynamically
        const filter = {};
        if (name) {
            filter.name = {
                contains: String(name),
                mode: 'insensitive' // Case-insensitive search
            };
        }
        if (phoneno) {
            filter.phoneno = {
                contains: String(phoneno),
                mode: 'insensitive'
            };
        }
        const users = yield prisma.user.findMany({
            where: filter,
            select: {
                id: true,
                name: true,
                email: true,
                phoneno: true
            }
        });
        return res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while fetching users',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}));
// POST - Create a new user with an account
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { name, email, phoneno, initialBalance = 0.0 } = req.body;
        // Validate input
        if (!name || !email || !phoneno) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email, and phone number'
            });
        }
        // Check if user with email already exists
        const existingUser = yield prisma.user.findFirst({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
        // Create new user with account in a transaction
        const newUser = yield prisma.$transaction((prismaClient) => __awaiter(void 0, void 0, void 0, function* () {
            // Create user
            const user = yield prismaClient.user.create({
                data: {
                    name,
                    email,
                    phoneno,
                    account: {
                        create: {
                            balance: initialBalance
                        }
                    }
                },
                include: {
                    account: true
                }
            });
            return user;
        }));
        return res.status(201).json({
            success: true,
            message: 'User created successfully with account',
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                phoneno: newUser.phoneno,
                account: {
                    id: (_a = newUser.account) === null || _a === void 0 ? void 0 : _a.id,
                    balance: (_b = newUser.account) === null || _b === void 0 ? void 0 : _b.balance
                }
            }
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while creating user',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
}));
exports.default = router;
