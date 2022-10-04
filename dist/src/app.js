"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = __importDefault(require("./utils/errorHandler"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
app.use((0, cors_1.default)());
app.use((0, express_session_1.default)({
    secret: 'ajksbdjasbj',
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
//set up routes
app.use('/api', routes_1.default);
app.use(errorHandler_1.default);
app.listen(process.env.PORT, () => console.log('http://localhost:' + process.env.PORT));
