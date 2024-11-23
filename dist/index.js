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
    accessToken: "EAAHiMA9Pw4ABO4d3de1oghtJnpcPdkDJZBdtygwZABiSzmjx6ZB1mEF2SWGnUT71WCdA0t3N8gWzzb87tVqyCAatExpe4F2ytxjfQxsJI1qiIU8HpsnpbXYxEhqTNArOe86B8L2Y4KMKuwLNOLB4oZCvdpCCqE7AcJjUb5PN1qfiHLo6Cf9jpUq2SKj1v6B3FQZDZD",
    whatsappPhoneNumberId: "512579385264516",
    verifyToken: "temptokencenturionuniversity1234", // Used for webhook verification
    apiVersion: "v21.0",
};
// Templates configuration
const templates = {
    WELCOME: "welcome_message_introduction",
    FACULTY: "faculty",
    PARENT: "parent",
    ENQUIRY: "general_enquiry",
    PROGRAMS: "programs_info",
};
// Session management
const userSessions = new Map();
// Logging middleware
app.use((req, _, next) => {
    console.log("\n=== Incoming Request ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Method:", req.method);
    console.log("Path:", req.path);
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    next();
});
// Helper function to send template messages
function sendTemplateMessage(to, templateName) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            console.log(`Sending template "${templateName}" to ${to}`);
            const payload = {
                messaging_product: "whatsapp",
                to: to,
                type: "template",
                template: {
                    name: templateName,
                    language: {
                        code: "en_US",
                    },
                },
            };
            const response = yield axios_1.default.post(`https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`, payload, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Template message sent successfully:", response.data);
            return response.data;
        }
        catch (error) {
            console.error("Error sending template message:");
            console.error("Status:", (_a = error.response) === null || _a === void 0 ? void 0 : _a.status);
            console.error("Response:", (_b = error.response) === null || _b === void 0 ? void 0 : _b.data);
            throw error;
        }
    });
}
// Helper function to send interactive buttons
function sendUserTypeSelection(to) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: to,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: {
                        text: "Please select your role:",
                    },
                    action: {
                        buttons: [
                            {
                                type: "reply",
                                reply: {
                                    id: "PARENT",
                                    title: "Parent",
                                },
                            },
                            {
                                type: "reply",
                                reply: {
                                    id: "FACULTY",
                                    title: "Faculty",
                                },
                            },
                            {
                                type: "reply",
                                reply: {
                                    id: "ENQUIRY",
                                    title: "General Enquiry",
                                },
                            },
                        ],
                    },
                },
            };
            const response = yield axios_1.default.post(`https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`, payload, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Interactive message sent successfully:", response.data);
            return response.data;
        }
        catch (error) {
            console.error("Error sending interactive message:", error);
            throw error;
        }
    });
}
// Helper function to send text messages
function sendTextMessage(to, text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(`https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`, {
                messaging_product: "whatsapp",
                to: to,
                text: { body: text },
            }, {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json",
                },
            });
            console.log("Text message sent successfully:", response.data);
            return response.data;
        }
        catch (error) {
            console.error("Error sending text message:", error);
            throw error;
        }
    });
}
// Webhook verification endpoint
app.get("/webhook", (req, res) => {
    console.log("Received webhook verification request");
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    console.log("Verification params:", { mode, token, challenge });
    if (mode === "subscribe" && token === config.verifyToken) {
        console.log("Webhook verified successfully");
        res.status(200).send(challenge);
    }
    else {
        console.error("Webhook verification failed");
        res.sendStatus(403);
    }
});
// Main webhook endpoint for receiving messages
app.post("/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        console.log("\n=== Processing Webhook POST ===");
        // Extract the message data
        const entry = (_a = req.body.entry) === null || _a === void 0 ? void 0 : _a[0];
        const change = (_b = entry === null || entry === void 0 ? void 0 : entry.changes) === null || _b === void 0 ? void 0 : _b[0];
        const value = change === null || change === void 0 ? void 0 : change.value;
        const message = (_c = value === null || value === void 0 ? void 0 : value.messages) === null || _c === void 0 ? void 0 : _c[0];
        if (!message) {
            console.log("No message in webhook payload");
            return res.sendStatus(200);
        }
        console.log("Received message:", message);
        const from = message.from; // User's phone number
        const messageType = message.type;
        console.log("Processing message:", {
            from,
            type: messageType,
            timestamp: new Date().toISOString(),
        });
        // Get or create user session
        let session = userSessions.get(from) || {
            stage: "INITIAL",
            phoneNumber: from,
            lastInteraction: new Date(),
        };
        // Process different message types
        if (messageType === "text") {
            const text = message.text.body.toLowerCase();
            console.log("Received text:", text);
            if (text === "hi" || text === "hello") {
                yield sendTemplateMessage(from, templates.WELCOME);
                yield sendUserTypeSelection(from);
                session.stage = "USER_TYPE_SELECTION";
            }
            else {
                yield sendTextMessage(from, "I'm sorry, I don't understand that message. Please say 'hi' or 'hello' to start.");
            }
        }
        else if (messageType === "interactive") {
            const buttonReply = (_d = message.interactive) === null || _d === void 0 ? void 0 : _d.button_reply;
            if (buttonReply) {
                const selectedOption = buttonReply.id;
                console.log("Button selected:", selectedOption);
                switch (selectedOption) {
                    case "PARENT":
                        yield sendTemplateMessage(from, templates.PARENT);
                        session.stage = "PARENT_FLOW";
                        if ("userType" in session) {
                            session.userType = "PARENT";
                        }
                        break;
                    case "FACULTY":
                        yield sendTemplateMessage(from, templates.FACULTY);
                        session.stage = "FACULTY_FLOW";
                        if ("userType" in session) {
                            session.userType = "FACULTY";
                        }
                        break;
                    case "ENQUIRY":
                        yield sendTemplateMessage(from, templates.ENQUIRY);
                        session.stage = "ENQUIRY_FLOW";
                        if ("userType" in session) {
                            session.userType = "ENQUIRY";
                        }
                        break;
                }
            }
        }
        // Update session
        session.lastInteraction = new Date();
        userSessions.set(from, session);
        console.log("Updated session:", session);
        res.sendStatus(200);
    }
    catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);
    }
}));
// Session cleanup (run every hour)
setInterval(() => {
    const hour = 60 * 60 * 1000;
    const now = new Date();
    for (const [phoneNumber, session] of userSessions.entries()) {
        if (now.getTime() - session.lastInteraction.getTime() > hour) {
            userSessions.delete(phoneNumber);
            console.log(`Cleaned up inactive session for ${phoneNumber}`);
        }
    }
}, 60 * 60 * 1000);
// testing endpoint
app.get("/pingme", (req, res) => {
    return res.status(200).send("OK");
});
// Error handling middleware
// @ts-ignore
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n=== WhatsApp Chatbot Server ===`);
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook URL should be: https://your-domain.com/webhook`);
    // Configuration validation
    if (!config.accessToken || config.accessToken === "YOUR_ACCESS_TOKEN") {
        console.error("WARNING: Access token not configured!");
    }
    if (!config.whatsappPhoneNumberId ||
        config.whatsappPhoneNumberId === "YOUR_PHONE_NUMBER_ID") {
        console.error("WARNING: WhatsApp Phone Number ID not configured!");
    }
    if (!config.verifyToken || config.verifyToken === "YOUR_VERIFY_TOKEN") {
        console.error("WARNING: Verify token not configured!");
    }
});
