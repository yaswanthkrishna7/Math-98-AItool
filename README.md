# Math Solver API

A powerful Node.js/Express REST API that solves complex math problems across Calculus, Algebra, Linear Algebra, and Statistics — with step-by-step solutions and LaTeX output.

---

## 🚀 Quick Start

```bash
npm install
node src/server.js
# Server runs on http://localhost:3000
```

---

## 📡 API Endpoints

### 1. Calculus — `/api/calculus`

#### Differentiation
```bash
curl -X POST http://localhost:3000/api/calculus \
  -H "Content-Type: application/json" \
  -d '{ "type": "differentiate", "expression": "x^3 + 2*x^2 + 5", "variable": "x" }'
```
**Response:**
```json
{
  "type": "differentiation",
  "input": "x^3 + 2*x^2 + 5",
  "variable": "x",
  "answer": "3 * x ^ 2 + 4 * x",
  "latex": {
    "input": "\\frac{d}{dx}\\left(x^{3}+2\\cdot x^{2}+5\\right)",
    "answer": "3\\cdot x^{2}+4\\cdot x"
  },
  "steps": [
    "Differentiate: x^3 + 2*x^2 + 5 with respect to x",
    "Raw derivative: 3 * x ^ 2 + 4 * x",
    "Simplified: 3 * x ^ 2 + 4 * x"
  ]
}
```

#### Definite Integral
```bash
curl -X POST http://localhost:3000/api/calculus \
  -H "Content-Type: application/json" \
  -d '{ "type": "integrate", "expression": "x^2", "variable": "x", "from": 0, "to": 3 }'
```
**Response:**
```json
{
  "type": "definite_integral",
  "answer": 9.0,
  "latex": { "input": "\\int_{0}^{3} x^{2}\\, dx" },
  "steps": [
    "Evaluate definite integral of x^2 from 0 to 3",
    "Using Simpson's rule with n=10000 intervals",
    "Result ≈ 9.00000000"
  ]
}
```

---

### 2. Algebra — `/api/algebra`

```bash
curl -X POST http://localhost:3000/api/algebra \
  -H "Content-Type: application/json" \
  -d '{ "expression": "(x + 2)^2 + 3*x" }'
```
**Response:**
```json
{
  "type": "algebra",
  "simplified": "x ^ 2 + 7 * x + 4",
  "latex": { "simplified": "x^{2}+7\\cdot x+4" },
  "steps": ["Input expression: (x+2)^2 + 3*x", "Simplified form: x^2 + 7*x + 4"]
}
```

---

### 3. Linear Algebra — `/api/linear-algebra`

#### Determinant
```bash
curl -X POST http://localhost:3000/api/linear-algebra \
  -H "Content-Type: application/json" \
  -d '{ "operation": "determinant", "matrix": [[1,2,3],[4,5,6],[7,8,9]] }'
```

#### Matrix Inverse
```bash
curl -X POST http://localhost:3000/api/linear-algebra \
  -H "Content-Type: application/json" \
  -d '{ "operation": "inverse", "matrix": [[1,2],[3,4]] }'
```

#### Eigenvalues
```bash
curl -X POST http://localhost:3000/api/linear-algebra \
  -H "Content-Type: application/json" \
  -d '{ "operation": "eigenvalues", "matrix": [[4,1],[2,3]] }'
```

#### Matrix Multiplication
```bash
curl -X POST http://localhost:3000/api/linear-algebra \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "multiply",
    "matrix": [[1,2],[3,4]],
    "matrixB": [[5,6],[7,8]]
  }'
```

---

### 4. Statistics — `/api/statistics`

#### Descriptive Stats
```bash
curl -X POST http://localhost:3000/api/statistics \
  -H "Content-Type: application/json" \
  -d '{ "operation": "describe", "data": [4, 8, 15, 16, 23, 42] }'
```
**Response includes:** mean, median, std, variance, min, max, range, Q1, Q3, IQR

#### Linear Regression
```bash
curl -X POST http://localhost:3000/api/statistics \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "regression",
    "data": [1, 2, 3, 4, 5],
    "dataY": [2.1, 3.9, 6.2, 7.8, 10.1]
  }'
```
**Response:**
```json
{
  "slope": 2.01,
  "intercept": 0.02,
  "equation": "y = 2.0100x + 0.0200",
  "r_squared": 0.9998
}
```

---

## 🧮 Supported Math Syntax

| Syntax | Example |
|--------|---------|
| Powers | `x^2`, `x^3` |
| Trig | `sin(x)`, `cos(x)`, `tan(x)` |
| Logarithms | `log(x)`, `log(x, 10)` |
| Constants | `pi`, `e` |
| Operations | `+`, `-`, `*`, `/`, `%` |
| Functions | `sqrt(x)`, `abs(x)`, `exp(x)` |

---

## 🏗️ Project Structure

```
math-api/
├── src/
│   └── server.js      # Main API server
├── package.json
└── README.md
```

## 🔧 Dependencies

- **express** — HTTP server framework
- **cors** — Cross-origin resource sharing
- **mathjs** — Symbolic and numeric math engine
