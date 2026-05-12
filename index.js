/* GYANODAY SCHOOL BOT - AI TEACHER VERSION */

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(bodyParser.json());

// --- 1. CONFIGURATION ---
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN; 
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// --- 2. AI TEACHER BRAIN ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: {
    parts: [
      { text: "You are 'Gyanoday AI', a helpful tutor for Gyanoday Sr. Sec. School." },
      { text: "RULES: 1. Keep answers CONCISE (around 70-80 words). 2. Use bullet points. 3. Be polite. 4. Explain simply in Hinglish (Hindi+English)." },
      { text: `YOUR ROLES:
1. **Teacher:** Explain Physics, Chemistry, Math, Bio clearly.
2. **Admin:** Answer general school questions politely.

IMPORTANT:
- If asked for fees/results, say: "I cannot access personal records right now. Please visit the office."` }
    ]
  }
});

// --- 3. SEND MESSAGE FUNCTION ---
async function sendMessage(to, text) {
    try {
        await axios({
            method: "POST",
// --- 4. SERVER ROUTES ---
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else { res.sendStatus(403); }
});

app.post('/webhook', async (req, res) => {
    // 🔥 PERMANENT FIX 1: Meta को तुरंत 200 OK भेजें ताकि वो दोबारा मैसेज (Retry) ना भेजे!
    res.sendStatus(200);

    const body = req.body;
    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
            const message = body.entry[0].changes[0].value.messages[0];
            
            // 🔥 PERMANENT FIX 2: सिर्फ 'Text' मैसेज पर ही रिप्लाई करे (Sticker, Photo, या Status पर क्रैश न हो)
            if (message.type !== 'text') {
                console.log("Ignored non-text message.");
                return; 
            }

            const from = message.from; 
            const msgBody = message.text.body;

            console.log(`Msg from ${from}: ${msgBody}`);

            try {
                // AI को सोचने दें और आराम से रिप्लाई भेजें (Meta अब इंतज़ार नहीं कर रहा)
                const chat = model.startChat();
                const result = await chat.sendMessage(msgBody);
                await sendMessage(from, result.response.text());
            } catch (e) {
                console.error("AI Error:", e);
            }
        }
    }
});

app.listen(PORT, () => console.log(`Gyanoday Bot is Live on Port ${PORT}`));
    const body = req.body;
    if (body.object) {
        if (body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
            const message = body.entry[0].changes[0].value.messages[0];
            const from = message.from; 
            const msgBody = message.text.body;

            console.log(`Msg from ${from}: ${msgBody}`);

            try {
                const chat = model.startChat();
                const result = await chat.sendMessage(msgBody);
                await sendMessage(from, result.response.text());
            } catch (e) {
                console.error("AI Error:", e);
            }
        }
        res.sendStatus(200);
    } else { res.sendStatus(404); }
});

app.listen(PORT, () => console.log(`Gyanoday Bot is Live on Port ${PORT}`));
