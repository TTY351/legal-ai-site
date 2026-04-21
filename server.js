const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const CONFIG = {
    apiKey: "X9FTLbXMEZstZlnrTZkY3OM6FiXs5iJE",
    assistantId: "2046615110539962176",
    apiUrl: "https://yuanqi.tencent.com/openapi/v1/agent/chat/completions"
};

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        // 只发用户消息，腾讯元器智能体自动带角色
        const response = await fetch(CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + CONFIG.apiKey
            },
            body: JSON.stringify({
                assistant_id: CONFIG.assistantId,
                stream: false,
                messages: [
                    {
                        role: "user",
                        content: [{ type: "text", text: message }]
                    }
                ]
            })
        });

        const data = await response.json();
        let reply = "抱歉，这个问题我需要更详细的信息才能为你解答，你可以换个方式提问哦～";

        try {
            const c = data.choices?.[0];
            if (c?.message) {
                if (typeof c.message.content === "string") {
                    reply = c.message.content;
                } else if (Array.isArray(c.message.content)) {
                    reply = c.message.content[0]?.text || reply;
                }
            }
        } catch (_) {}

        res.json({ reply });
    } catch (err) {
        res.json({ reply: "服务异常，请稍后重试" });
    }
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log("✅ 服务已启动：http://localhost:3002");
});