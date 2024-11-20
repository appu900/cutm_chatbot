// import express, { Request, Response } from "express";
// import axios from "axios";
// import bodyParser from "body-parser";
//
// const app = express();
// app.use(bodyParser.json());
//
// // Replace with your actual WhatsApp API token and WhatsApp number ID
// const accessToken =
//   "EAAHiMA9Pw4ABO4d3de1oghtJnpcPdkDJZBdtygwZABiSzmjx6ZB1mEF2SWGnUT71WCdA0t3N8gWzzb87tVqyCAatExpe4F2ytxjfQxsJI1qiIU8HpsnpbXYxEhqTNArOe86B8L2Y4KMKuwLNOLB4oZCvdpCCqE7AcJjUb5PN1qfiHLo6Cf9jpUq2SKj1v6B3FQZDZD";
// const whatsappPhoneNumberId = "512579385264516";
//
// // Helper function to send messages
// async function sendMessage(to: string, text: string) {
//   try {
//     await axios.post(
//       `https://graph.facebook.com/v20.0/${whatsappPhoneNumberId}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to,
//         text: { body: text },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//   } catch (error) {
//     console.error("Error sending message:", error);
//   }
// }
//
//
//
// // send UserType selection
//
// async function sendUserTypeSelection(to : string){
//   try {
//     await axios.post(
//         `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`,
//         {
//           messaging_product: "whatsapp",
//           to,
//           type: "interactive",
//           interactive: {
//             type: "button",
//             body: {
//               text: "Please select your role:"
//             },
//             action: {
//               buttons: [
//                 {
//                   type: "reply",
//                   reply: {
//                     id: "PARENT",
//                     title: "Parent"
//                   }
//                 },
//                 {
//                   type: "reply",
//                   reply: {
//                     id: "FACULTY",
//                     title: "Faculty"
//                   }
//                 },
//                 {
//                   type: "reply",
//                   reply: {
//                     id: "ENQUIRY",
//                     title: "General Enquiry"
//                   }
//                 }
//               ]
//             }
//           }
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//             "Content-Type": "application/json",
//           }
//         }
//     );
//   } catch (error) {
//     console.error("Error sending interactive message:", error);
//     throw error;
//   }
// }
//
//
//
//
//
//
//
//
// // ** send template locally test
// async function sendTemplateMessage(to: any) {
//   try {
//     const response = await axios.post(
//       `https://graph.facebook.com/v20.0/${whatsappPhoneNumberId}/messages`,
//       {
//         messaging_product: "whatsapp",
//         to,
//         type: "template",
//         template: {
//           name: "welcome_message_introduction",
//           language: { code: "en_US" },
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response;
//
//   } catch (error: any) {
//     console.error("Error sending message:", error.response?.data || error);
//   }
// }
//
// app.post("/hello-template", async (req: any, res: any) => {
//   try {
//     const response = await sendTemplateMessage(req.body.to);
//     res.status(200).json({ data: response?.data });
//   } catch (error: any) {
//     res.status(400).json({
//       error: error.message,
//     });
//   }
// });
//
// // Webhook to receive messages
// app.post("/webhook", async (req: any, res: any) => {
//   const message = req.body.entry?.[0].changes?.[0].value.messages?.[0];
//   const from = message?.from;
//   const text = message?.text?.body?.toLowerCase();
//
//   console.log(text);
//
//   if (!from || !text) {
//     return res.sendStatus(400); // Missing expected fields
//   }
//
//   // Simple bot flow
//   if (text === "hi" || text === "hello") {
//     await sendMessage(from, "Hello! Please provide your employee ID:");
//   } else if (/^\d{3,}$/.test(text)) {
//     await sendMessage(from, "Got it! Now, please type your OTP (dummy).");
//   } else if (text === "1234") {
//     // Dummy OTP
//     await sendMessage(
//       from,
//       "Welcome to the service! How can we assist you today?"
//     );
//   } else {
//     await sendMessage(
//       from,
//       "I'm sorry, I didn't understand that. Please start with 'Hi' or 'Hello'."
//     );
//   }
//
//   res.sendStatus(200);
// });
//
// // Endpoint for WhatsApp webhook verification
// app.get("/webhook", (req: Request, res: Response) => {
//   const verifyToken = "temptokencenturionuniversity1234";
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];
//
//   if (mode === "subscribe" && token === verifyToken) {
//     console.log("webhook verifyed sucessfully")
//     res.status(200).send(challenge);
//   } else {
//     res.sendStatus(403);
//   }
// });
//
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

import express, { Request, Response } from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const accessToken = "EAAHiMA9Pw4ABO4d3de1oghtJnpcPdkDJZBdtygwZABiSzmjx6ZB1mEF2SWGnUT71WCdA0t3N8gWzzb87tVqyCAatExpe4F2ytxjfQxsJI1qiIU8HpsnpbXYxEhqTNArOe86B8L2Y4KMKuwLNOLB4oZCvdpCCqE7AcJjUb5PN1qfiHLo6Cf9jpUq2SKj1v6B3FQZDZD";
const whatsappPhoneNumberId = "512579385264516";
const verifyToken = "temptokencenturionuniversity1234";

// Templates configuration
const templates = {
  WELCOME: "welcome_message_introduction",
  FACULTY: "faculty",
  PARENT: "parent",
  ENQUIRY: "enquiry_about_university",
  PROGRAM: "programme_structure"
};

interface UserSession {
  stage: 'INITIAL' | 'USER_TYPE_SELECTION' | 'FACULTY_FLOW' | 'PARENT_FLOW' | 'ENQUIRY_FLOW';
  userType?: 'PARENT' | 'FACULTY' | 'ENQUIRY';
  lastTemplate?: string;
}

const userSessions = new Map<string, UserSession>();

// Send template message
async function sendTemplateMessage(to: string, templateName: string) {
  try {
    console.log(`Sending template ${templateName} to ${to}`);
    const response = await axios.post(
        `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en_US" }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }
        }
    );
    console.log('Template sent successfully:', response.data);
    return response;
  } catch (error: any) {
    console.error("Error sending template:", error.response?.data || error);
    throw error;
  }
}

// Send interactive button message
async function sendUserTypeSelection(to: string) {
  try {
    console.log('Sending user type selection buttons to:', to);
    await axios.post(
        `https://graph.facebook.com/v21.0/${whatsappPhoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text: "Please select your role:"
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "PARENT",
                    title: "Parent"
                  }
                },
                {
                  type: "reply",
                  reply: {
                    id: "FACULTY",
                    title: "Faculty"
                  }
                }
              ]
            }
          }
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          }
        }
    );
    console.log('Interactive buttons sent successfully');
  } catch (error) {
    console.error("Error sending interactive message:", error);
    throw error;
  }
}

// Webhook to receive messages
app.post("/webhook", async (req: any, res: any) => {
  try {
    console.log('Received webhook payload:', JSON.stringify(req.body, null, 2));

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      console.log('No message in webhook');
      return res.sendStatus(200);
    }

    const from = message.from;
    const messageType = message.type;
    console.log(`Received message type: ${messageType} from: ${from}`);

    // Get or create user session
    let session = userSessions.get(from) || { stage: 'INITIAL' };
    console.log('Current session:', session);

    if (messageType === 'text') {
      const text = message.text.body.toLowerCase();
      console.log('Received text message:', text);

      if (text === 'hi' || text === 'hello') {
        console.log('Sending welcome flow');
        await sendTemplateMessage(from, templates.WELCOME);
        await sendUserTypeSelection(from);
        session.stage = 'USER_TYPE_SELECTION';
      }
    }
    else if (messageType === 'interactive') {
      const interactiveType = message.interactive?.type;
      const buttonReply = message.interactive?.button_reply;

      console.log('Received interactive message:', {
        type: interactiveType,
        reply: buttonReply
      });

      if (interactiveType === 'button_reply' && buttonReply) {
        const selectedOption = buttonReply.id;
        console.log('Selected option:', selectedOption);

        switch (selectedOption) {
          case 'PARENT':
            console.log('Sending parent template');
            await sendTemplateMessage(from, templates.PARENT);
            session.stage = 'PARENT_FLOW';
            session.userType = 'PARENT';
            break;

          case 'FACULTY':
            console.log('Sending faculty template');
            await sendTemplateMessage(from, templates.FACULTY);
            session.stage = 'FACULTY_FLOW';
            session.userType = 'FACULTY';
            break;
        }
      }
    }

    // Update session
    userSessions.set(from, session);
    console.log('Updated session:', session);

    res.sendStatus(200);
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Webhook verification endpoint
app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});