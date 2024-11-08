import express, { Request, Response } from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// Replace with your actual WhatsApp API token and WhatsApp number ID
const accessToken = "EAAHiMA9Pw4ABO80uGfZAcJz6gEAmGKiyVKJz5ZAs5Avoy6hGitM330vuGNZCP5tnBZCRXe7YyCNPXvhyznJOhqx16dgeyYMib19oo0xiZAx2sU1T2xbnCD1R1GkiPeBypCsatYogtZAePM2cEjugFQ7be1cg7oHNkon7fZAGhnQiB9yG56ldN2mlRZCK32YtEZBC68Qo31PakPgAEjpduYZB1mC5dlyhotZACtlm7h1PHZAaIGkZD";
const whatsappPhoneNumberId = "530171019903872";

// Helper function to send messages
async function sendMessage(to: string, text: string) {
  try {
    await axios.post(
      `https://graph.facebook.com/v13.0/${whatsappPhoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

// Webhook to receive messages
app.post("/webhook", async (req:any, res:any) => {
  const message = req.body.entry?.[0].changes?.[0].value.messages?.[0];
  const from = message?.from;
  const text = message?.text?.body?.toLowerCase();

  if (!from || !text) {
    return res.sendStatus(400); // Missing expected fields
  }

  // Simple bot flow
  if (text === "hi" || text === "hello") {
    await sendMessage(from, "Hello! Please provide your employee ID:");
  } else if (/^\d{3,}$/.test(text)) {
    await sendMessage(from, "Got it! Now, please type your OTP (dummy).");
  } else if (text === "1234") { // Dummy OTP
    await sendMessage(from, "Welcome to the service! How can we assist you today?");
  } else {
    await sendMessage(from, "I'm sorry, I didn't understand that. Please start with 'Hi' or 'Hello'.");
  }

  res.sendStatus(200);
});

// Endpoint for WhatsApp webhook verification
app.get("/webhook", (req: Request, res: Response) => {
  const verifyToken = "temptokencenturionuniversity1234"; 
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
