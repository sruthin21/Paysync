"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRouter_1 = __importDefault(require("./userRouter"));
const accountRouter_1 = __importDefault(require("./accountRouter"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1/user', userRouter_1.default);
app.use('/api/v1/account', accountRouter_1.default);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
