require("dotenv").config();
const express = require("express");
const cors = require("cors");
const math = require("mathjs");
const path = require("path");
const https = require("https");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.post("/api/ask", async (req, res) => {
  const { question, systemPrompt } = req.body;
  if (!question) return res.status(400).json({ error: "question is required" });

  const apiKey = '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';
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY not set. Please add it to your .env file." });
  }

  const payload = JSON.stringify({
    model: "llama-3.1-8b-instant",
    max_tokens: 1024,
    temperature: 0.7,
    messages: [
      { role: "system", content: systemPrompt || "You are MathPal, a friendly math tutor for kids." },
      { role: "user", content: question }
    ]
  });

  const options = {
    hostname: "api.groq.com",
    path: "/openai/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "Content-Length": Buffer.byteLength(payload)
    }
  };

  const apiReq = https.request(options, (apiRes) => {
    let data = "";
    apiRes.on("data", chunk => data += chunk);
    apiRes.on("end", () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) {
          return res.status(400).json({ error: parsed.error.message || "Groq API error" });
        }
        const answer = parsed.choices?.[0]?.message?.content || "No response received.";
        res.json({ answer });
      } catch (e) {
        res.status(500).json({ error: "Failed to parse API response: " + e.message });
      }
    });
  });

  apiReq.on("error", (e) => {
    res.status(500).json({ error: "Failed to reach Groq API: " + e.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

// ─── Math API Routes ──────────────────────────────────────────────────────────
function toLatex(expr) {
  try { return math.parse(expr).toTex(); } catch { return expr; }
}

app.post("/api/calculus", (req, res) => {
  try {
    const { type, expression, variable = "x", from, to } = req.body;
    if (!type || !expression) return res.status(400).json({ error: "type and expression required" });
    const parsed = math.parse(expression);
    if (type === "differentiate") {
      const derivative = math.derivative(parsed, variable);
      const simplified = math.simplify(derivative);
      return res.json({
        type: "differentiation", input: expression, variable,
        answer: simplified.toString(),
        latex: { input: `\\frac{d}{d${variable}}\\left(${toLatex(expression)}\\right)`, answer: simplified.toTex() },
        steps: [`Differentiate: ${expression}`, `Derivative: ${derivative.toString()}`, `Simplified: ${simplified.toString()}`]
      });
    }
    if (type === "integrate" && from !== undefined && to !== undefined) {
      const f = (v) => { const s = {}; s[variable] = v; return math.evaluate(expression, s); };
      const n = 10000, h = (to - from) / n;
      let sum = f(from) + f(to);
      for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(from + i * h);
      const result = (h / 3) * sum;
      return res.json({
        type: "definite_integral", input: expression, variable, from, to,
        answer: parseFloat(result.toFixed(8)),
        steps: [`Integrate ${expression} from ${from} to ${to}`, `Result ≈ ${result.toFixed(8)}`]
      });
    }
    res.status(400).json({ error: "type must be integrate or differentiate" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/algebra", (req, res) => {
  try {
    const { expression } = req.body;
    if (!expression) return res.status(400).json({ error: "expression required" });
    const simplified = math.simplify(math.parse(expression));
    let evaluated = null;
    try { evaluated = math.evaluate(expression); } catch {}
    res.json({
      type: "algebra", input: expression,
      simplified: simplified.toString(),
      evaluated: evaluated !== null ? (typeof evaluated === "object" ? evaluated.toString() : evaluated) : null,
      latex: { input: toLatex(expression), simplified: simplified.toTex() },
      steps: [`Input: ${expression}`, `Simplified: ${simplified.toString()}`, evaluated !== null ? `Evaluated: ${evaluated}` : null].filter(Boolean)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/linear-algebra", (req, res) => {
  try {
    const { operation, matrix, matrixB } = req.body;
    if (!operation || !matrix) return res.status(400).json({ error: "operation and matrix required" });
    const A = math.matrix(matrix);
    if (operation === "determinant") return res.json({ type: "determinant", answer: math.det(A) });
    if (operation === "inverse") return res.json({ type: "inverse", answer: math.inv(A).toArray() });
    if (operation === "multiply") {
      if (!matrixB) return res.status(400).json({ error: "matrixB required" });
      return res.json({ type: "matrix_multiply", answer: math.multiply(A, math.matrix(matrixB)).toArray() });
    }
    if (operation === "eigenvalues") return res.json({ type: "eigenvalues", eigenvalues: math.eigs(A).values.toArray() });
    res.status(400).json({ error: "Unknown operation" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/statistics", (req, res) => {
  try {
    const { operation, data, dataY } = req.body;
    if (!operation || !data) return res.status(400).json({ error: "operation and data required" });
    if (operation === "describe") {
      const sorted = [...data].sort((a, b) => a - b), n = data.length;
      const q1 = sorted[Math.floor(n * 0.25)], q3 = sorted[Math.floor(n * 0.75)];
      return res.json({
        type: "descriptive_statistics", n,
        mean: parseFloat(math.mean(data).toFixed(6)),
        median: math.median(data),
        std: parseFloat(math.std(data).toFixed(6)),
        variance: parseFloat(math.variance(data).toFixed(6)),
        min: math.min(data), max: math.max(data),
        range: math.max(data) - math.min(data), q1, q3, iqr: q3 - q1
      });
    }
    if (operation === "regression") {
      if (!dataY) return res.status(400).json({ error: "dataY required" });
      const n = data.length, xm = math.mean(data), ym = math.mean(dataY);
      let num = 0, den = 0;
      for (let i = 0; i < n; i++) { num += (data[i]-xm)*(dataY[i]-ym); den += (data[i]-xm)**2; }
      const slope = num/den, intercept = ym - slope*xm;
      return res.json({ type: "linear_regression", slope: parseFloat(slope.toFixed(6)), intercept: parseFloat(intercept.toFixed(6)), equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}` });
    }
    res.status(400).json({ error: "Unknown operation" });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/health", (_, res) => res.json({ status: "ok", ai: "Groq Llama 3.1 (Free)" }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ MathPal running on http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn("⚠️  GROQ_API_KEY not set!");
    console.warn("   Get FREE key at: console.groq.com");
    console.warn("   Add to .env: GROQ_API_KEY=gsk_your-key-here");
  } else {
    console.log("✅ GROQ_API_KEY found — AI is ready! (100% Free 🎉)");
  }
});
module.exports = app;