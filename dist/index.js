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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
// Configuration
const config = {
    accessToken: "EAAHiMA9Pw4ABO4d3de1oghtJnpcPdkDJZBdtygwZABiSzmjx6ZB1mEF2SWGnUT71WCdA0t3N8gWzzb87tVqyCAatExpe4F2ytxjfQxsJI1qiIU8HpsnpbXYxEhqTNArOe86B8L2Y4KMKuwLNOLB4oZCvdpCCqE7AcJjUb5PN1qfiHLo6Cf9jpUq2SKj1v6B3FQZDZD", // Replace with your actual token
    whatsappPhoneNumberId: "512579385264516", // Replace with your phone number ID
    apiVersion: "v21.0",
    verifyToken: "temptokencenturionuniversity1234", // Replace with your verify token
};
// Templates
const templates = {
    WELCOME: "welcome_message_introduction",
    FACULTY: "faculty",
    PARENT: "parent",
    ENQUIRY: "enquiry_about_university",
    PROGRAMS: "programme_structure",
};
// Session management
const userSessions = new Map();
// Send a template message
function sendTemplateMessage(to, templateName) {
    return __awaiter(this, void 0, void 0, function* () {
        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: "en_US",
                },
            },
        };
    });
}
function sendTemplateMessageInner(to, templateName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
                name: templateName,
                language: {
                    code: "en",
                },
            },
        };
        try {
            const response = yield axios_1.default.post(`https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`, payload, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            console.log(`Template message "${templateName}" sent to ${to}:`, response.data);
        }
        catch (error) {
            console.error(`Failed to send template "${templateName}" to ${to}:`, (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            throw error;
        }
    });
}
// Send an interactive message
function sendInteractiveMessage(to) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const payload = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: {
                    text: "Please select your role:",
                },
                action: {
                    buttons: [
                        { type: "reply", reply: { id: "PARENT", title: "Parent" } },
                        { type: "reply", reply: { id: "FACULTY", title: "Faculty" } },
                        {
                            type: "reply",
                            reply: { id: "ENQUIRY", title: "Enquiry About University" },
                        },
                    ],
                },
            },
        };
        try {
            const response = yield axios_1.default.post(`https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`, payload, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Interactive message sent successfully:", response.data);
        }
        catch (error) {
            console.error("Error sending interactive message:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.data);
            throw error;
        }
    });
}
// Webhook verification
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === config.verifyToken) {
        console.log("Webhook verified successfully");
        res.status(200).send(challenge);
    }
    else {
        res.sendStatus(403);
    }
});
// Webhook to handle incoming messages
app.post("/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const entry = (_a = req.body.entry) === null || _a === void 0 ? void 0 : _a[0];
        const changes = (_b = entry === null || entry === void 0 ? void 0 : entry.changes) === null || _b === void 0 ? void 0 : _b[0];
        const value = changes === null || changes === void 0 ? void 0 : changes.value;
        const message = (_c = value === null || value === void 0 ? void 0 : value.messages) === null || _c === void 0 ? void 0 : _c[0];
        if (!message) {
            console.log("No message in webhook payload");
            return res.sendStatus(200);
        }
        const from = message.from; // User's phone number
        const messageType = message.type;
        // Fetch or initialize user session
        let session = userSessions.get(from) || {
            stage: "INITIAL",
            phoneNumber: from,
            lastInteraction: new Date(),
        };
        if (messageType === "text") {
            const text = message.text.body.toLowerCase();
            if (text === "hi" || text === "hello") {
                yield sendTemplateMessage(from, templates.WELCOME);
                yield sendInteractiveMessage(from);
                session.stage = "USER_TYPE_SELECTION";
            }
            else {
                yield sendTemplateMessage(from, "Sorry, I couldn't understand that. Type 'hi' to begin.");
            }
        }
        else if (messageType === "interactive") {
            const buttonReply = (_d = message.interactive) === null || _d === void 0 ? void 0 : _d.button_reply;
            if (buttonReply) {
                const selectedOption = buttonReply.id;
                switch (selectedOption) {
                    case "PARENT":
                        yield sendTemplateMessageInner(from, templates.PARENT);
                        session.stage = "PARENT_FLOW";
                        break;
                    case "FACULTY":
                        yield sendTemplateMessageInner(from, templates.FACULTY);
                        session.stage = "FACULTY_FLOW";
                        break;
                    case "ENQUIRY":
                        yield sendTemplateMessage(from, templates.ENQUIRY);
                        session.stage = "ENQUIRY_FLOW";
                        break;
                    default:
                        yield sendTemplateMessage(from, "Unknown selection. Please try again.");
                }
            }
        }
        // Update session
        session.lastInteraction = new Date();
        userSessions.set(from, session);
        res.sendStatus(200);
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);
    }
}));
// Health check endpoint
app.get("/pingme", (req, res) => {
    res.status(200).send("OK");
});
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`WhatsApp bot running on port ${PORT}`);
});
