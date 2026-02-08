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
    model: "gemini-1.5-flash",
    systemInstruction: `
    You are 'Gyanoday AI', the official AI Tutor for Gyanoday Sr. Sec. School, Amet.

    CRITICAL INSTRUCTION - LANGUAGE DETECTION:
    1. If user types in **English**, reply in **Standard English**.
    2. If user types in **Hindi/Hinglish** (e.g. "Kab aana hai?"), reply in **Hindi/Hinglish**.

    YOUR ROLES:
    1. **Teacher:** Explain Physics, Chemistry, Math, Bio clearly.
    2. **Admin:** Answer general school questions politely.

    IMPORTANT:
    - If asked for fees/results, say: "I cannot access personal records right now. Please visit the office."
    `
});

// --- 3. SEND MESSAGE FUNCTION ---
async function sendMessage(to, text) {
    try {
        await axios({
            method: "POST",
            url: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
            headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
            data: { messaging_product: "whatsapp", to: to, text: { body: text } }
        });
    } catch (error) {
        console.error("WhatsApp Error:", error.response ? error.response.data : error.message);
    }
}

// --- 4. SERVER ROUTES ---
app.get('/webhook', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else { res.sendStatus(403); }
});

app.post('/webhook', async (req, res) => {
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