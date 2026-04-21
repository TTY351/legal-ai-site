const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const fileUpload = document.getElementById("file-upload");
const themeToggle = document.getElementById("theme-toggle");
const clearChat = document.getElementById("clear-chat");
const voiceInput = document.getElementById("voice-input");
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggle-sidebar");

// 🔥 强制清理缓存！解决第二次失败！
localStorage.removeItem("chatHistory");
let chatHistory = [];

let darkMode = localStorage.getItem("darkMode") === "true";

if (darkMode) {
    document.body.classList.add("dark");
    themeToggle.innerText = "☀️ 浅色模式";
} else {
    themeToggle.innerText = "🌙 深色模式";
}

toggleSidebar.addEventListener("click", () => {
    sidebar.classList.toggle("folded");
    toggleSidebar.classList.toggle("hide");
});

function time() {
    const d = new Date();
    return d.getHours().toString().padStart(2, "0") + ":" +
        d.getMinutes().toString().padStart(2, "0");
}

function riskTag(text) {
    if (text.includes("高风险")) return `<span style="color:#e65757;font-weight:bold">🔴 高风险</span> `;
    if (text.includes("中风险")) return `<span style="color:#e6a957;font-weight:bold">🟠 中风险</span> `;
    if (text.includes("低风险")) return `<span style="color:#57b957;font-weight:bold">🟢 低风险</span> `;
    return "";
}

function cleanMarkdown(text) {
    return text
        .replace(/#/g, "")
        .replace(/\*/g, "")
        .replace(/`/g, "")
        .replace(/【[^】]*】/g, "")
        .replace(/《[^》]*》/g, "");
}

function parseLaw(text) { return text; }
function parseFlow(text) { return text; }

function addMessage(text, isUser = false) {
    const div = document.createElement("div");
    div.className = `message ${isUser ? "user" : "ai"}`;

    if (typeof text !== "string") text = "服务异常";

    let cleaned = cleanMarkdown(text);
    let content = riskTag(cleaned) + cleaned;
    content = parseLaw(content);
    content = parseFlow(content);

    div.innerHTML = content;

    const t = document.createElement("div");
    t.className = "time";
    t.innerText = time();
    div.appendChild(t);

    if (!isUser) {
        const copy = document.createElement("button");
        copy.className = "copy-btn";
        copy.innerText = "复制";
        copy.onclick = () => {
            navigator.clipboard.writeText(text.replace(/<[^>]+>/g, ""));
            copy.innerText = "已复制";
            setTimeout(() => copy.innerText = "复制", 1000);
        };
        div.appendChild(copy);

        const rate = document.createElement("div");
        rate.className = "rate-box";
        rate.innerHTML = `
      <button class="rate-btn good">👍 有用</button>
      <button class="rate-btn bad">👎 待优化</button>
    `;
        div.appendChild(rate);
    }

    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

addMessage("你好！我是律知校园智能法律咨询助手，我可以为你解答实习就业、校园纠纷、合同风险等问题。", false);

async function sendMessage(text) {
    if (!text) return;
    addMessage(text, true);
    userInput.value = "";

    const loading = document.createElement("div");
    loading.className = "message ai";
    loading.innerText = "思考中...";
    chatMessages.appendChild(loading);

    try {
        const res = await fetch("https://legal-ai-server-0yg5.onrender.com/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        chatMessages.removeChild(loading);

        let reply = data.reply || "服务异常，请稍后重试";
        addMessage(reply, false);
    } catch (e) {
        chatMessages.removeChild(loading);
        addMessage("⚠️ 服务未启动", false);
    }
}

sendBtn.addEventListener("click", () => sendMessage(userInput.value.trim()));
userInput.addEventListener("keypress", (e) => e.key === "Enter" && sendMessage(userInput.value.trim()));

themeToggle.addEventListener("click", () => {
    darkMode = !darkMode;
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", darkMode);
    themeToggle.innerText = darkMode ? "☀️ 浅色模式" : "🌙 深色模式";
});

document.querySelectorAll(".sidebar-mini-btn").forEach(btn => {
    btn.addEventListener("click", () => sendMessage(btn.innerText));
});

clearChat.addEventListener("click", () => {
    chatMessages.innerHTML = "";
    addMessage("你好！我是律知校园智能法律咨询助手，我可以为你解答实习就业、校园纠纷、合同风险等问题。", false);
});

voiceInput.addEventListener("click", () => {
    if (!window.webkitSpeechRecognition) return alert("不支持语音");
    const rec = new webkitSpeechRecognition();
    rec.lang = "zh-CN";
    rec.start();
    rec.onresult = (e) => userInput.value = e.results[0][0].transcript;
});