import express, { Request, Response } from "express";
import axios from "axios";
import bodyParser from "body-parser";




const app = express();
app.use(bodyParser.json());

// Configuration
const config = {
  accessToken:
    "EAAHiMA9Pw4ABO4d3de1oghtJnpcPdkDJZBdtygwZABiSzmjx6ZB1mEF2SWGnUT71WCdA0t3N8gWzzb87tVqyCAatExpe4F2ytxjfQxsJI1qiIU8HpsnpbXYxEhqTNArOe86B8L2Y4KMKuwLNOLB4oZCvdpCCqE7AcJjUb5PN1qfiHLo6Cf9jpUq2SKj1v6B3FQZDZD",
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

// Interface definitions
interface UserSession {
  stage:
    | "INITIAL"
    | "USER_TYPE_SELECTION"
    | "FACULTY_FLOW"
    | "PARENT_FLOW"
    | "ENQUIRY_FLOW";
  userType?: "PARENT" | "FACULTY" | "ENQUIRY";
  phoneNumber: string;
  lastInteraction: Date;
}

// Session management
const userSessions = new Map<string, UserSession>();

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
async function sendTemplateMessage(to: string, templateName: string) {
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

    console.log("Template message sent successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error sending template message:");
    console.error("Status:", error.response?.status);
    console.error("Response:", error.response?.data);
    throw error;
  }
}

// Helper function to send interactive buttons
async function sendUserTypeSelection(to: string) {
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
    return response.data;
  } catch (error: any) {
    console.error("Error sending interactive message:", error);
    throw error;
  }
}

// Helper function to send text messages
async function sendTextMessage(to: string, text: string) {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/${config.apiVersion}/${config.whatsappPhoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${config.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Text message sent successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("Error sending text message:", error);
    throw error;
  }
}

// Webhook verification endpoint
app.get("/webhook", (req: Request, res: Response) => {
  console.log("Received webhook verification request");

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  console.log("Verification params:", { mode, token, challenge });

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("Webhook verified successfully");
    res.status(200).send(challenge);
  } else {
    console.error("Webhook verification failed");
    res.sendStatus(403);
  }
});

// Main webhook endpoint for receiving messages
app.post("/webhook", async (req: any, res: any) => {
  try {
    console.log("\n=== Processing Webhook POST ===");

    // Extract the message data
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      console.log("No message in webhook payload");
      return res.sendStatus(200);
    }

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
        await sendTemplateMessage(from, templates.WELCOME);
        await sendUserTypeSelection(from);
        session.stage = "USER_TYPE_SELECTION";
      } else {
        await sendTextMessage(
          from,
          "I'm sorry, I don't understand that message. Please say 'hi' or 'hello' to start."
        );
      }
    } else if (messageType === "interactive") {
      const buttonReply = message.interactive?.button_reply;

      if (buttonReply) {
        const selectedOption = buttonReply.id;
        console.log("Button selected:", selectedOption);

        switch (selectedOption) {
          case "PARENT":
            await sendTemplateMessage(from, templates.PARENT);
            session.stage = "PARENT_FLOW";
            if ("userType" in session) {
              session.userType = "PARENT";
            }
            break;

          case "FACULTY":
            await sendTemplateMessage(from, templates.FACULTY);
            session.stage = "FACULTY_FLOW";
            if ("userType" in session) {
              session.userType = "FACULTY";
            }
            break;

          case "ENQUIRY":
            await sendTemplateMessage(from, templates.ENQUIRY);
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
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

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

app.get("/pingme", (req: any, res: any) => {
  return res.status(200).send("OK");
});

// Error handling middleware
// @ts-ignore
app.use((err: Error, req: Request, res: Response, next: any) => {
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
  if (
    !config.whatsappPhoneNumberId ||
    config.whatsappPhoneNumberId === "YOUR_PHONE_NUMBER_ID"
  ) {
    console.error("WARNING: WhatsApp Phone Number ID not configured!");
  }
  if (!config.verifyToken || config.verifyToken === "YOUR_VERIFY_TOKEN") {
    console.error("WARNING: Verify token not configured!");
  }
});



  