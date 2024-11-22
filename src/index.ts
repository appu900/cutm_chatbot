import express, { Request, Response, NextFunction } from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

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

// User session interface
interface UserSession {
  stage: "INITIAL" | "USER_TYPE_SELECTION" | "FACULTY_FLOW" | "PARENT_FLOW" | "ENQUIRY_FLOW";
  userType?: "FACULTY" | "PARENT" | "ENQUIRY";
  phoneNumber: string;
  lastInteraction: Date;
}

// Session management
const userSessions = new Map<string, UserSession>();

// Send a template message
async function sendTemplateMessage(to: string, templateName: string): Promise<void> {
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

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Template message "${templateName}" sent to ${to}:`, response.data);
  } catch (error: any) {
    console.error(`Failed to send template "${templateName}" to ${to}:`, error.response?.data);
    throw error;
  }
}

// Send an interactive message
async function sendInteractiveMessage(to: string): Promise<void> {
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
          { type: "reply", reply: { id: "ENQUIRY", title: "Enquiry About University" } },
        ],
      },
    },
  };

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Interactive message sent successfully:", response.data);
  } catch (error: any) {
    console.error("Error sending interactive message:", error.response?.data);
    throw error;
  }
}

// Webhook verification
app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"] as string;
  const token = req.query["hub.verify_token"] as string;
  const challenge = req.query["hub.challenge"] as string;

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook to handle incoming messages
app.post("/webhook", async (req:any, res: any) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

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
        await sendTemplateMessage(from, templates.WELCOME);
        await sendInteractiveMessage(from);
        session.stage = "USER_TYPE_SELECTION";
      } else {
        await sendTemplateMessage(from, "Sorry, I couldn't understand that. Type 'hi' to begin.");
      }
    } else if (messageType === "interactive") {
      const buttonReply = message.interactive?.button_reply;
      if (buttonReply) {
        const selectedOption = buttonReply.id;
        switch (selectedOption) {
          case "PARENT":
            await sendTemplateMessage(from, templates.PARENT);
            session.stage = "PARENT_FLOW";
            break;
          case "FACULTY":
            await sendTemplateMessage(from, templates.FACULTY);
            session.stage = "FACULTY_FLOW";
            break;
          case "ENQUIRY":
            await sendTemplateMessage(from, templates.ENQUIRY);
            session.stage = "ENQUIRY_FLOW";
            break;
          default:
            await sendTemplateMessage(from, "Unknown selection. Please try again.");
        }
      }
    }

    // Update session
    session.lastInteraction = new Date();
    userSessions.set(from, session);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Health check endpoint
app.get("/pingme", (req: Request, res: Response) => {
  res.status(200).send("OK");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`WhatsApp bot running on port ${PORT}`);
});
