# 🩺 CarePlus Predict

Sistema inteligente de monitoramento de saúde com IA preditiva baseado em dados fisiológicos (PPG).

---

## 🚀 Arquitetura

```
careplus-predict/
├── api/    → Backend (Node.js + Fastify)
├── expo/   → App mobile (React Native + Expo)
├── ml/     → IA (Python + FastAPI + PyTorch)
```

---

## 📦 Tecnologias

- **Frontend:** React Native (Expo)
- **Backend:** Node.js (Fastify)
- **IA:** Python (FastAPI + PyTorch)
- **Banco:** SQLite
- **Dataset:** PPG-DaLiA

---

## ⚙️ Pré-requisitos

### 🔹 Comum (todos os sistemas)
- Node.js ≥ 18
- Python ≥ 3.10
- Git

### 🔹 Opcional
- Expo Go (celular)
- VS Code

---

## 🛠️ Instalação

### 1. Clonar repositório

```bash
git clone https://github.com/lincoln743/careplus-predict.git
cd careplus-predict
```

---

## 🔧 BACKEND (API)

```bash
cd api
npm install
node server.js
```

Servidor rodando em:

```
http://localhost:3333
```

Teste:

```bash
curl http://localhost:3333/ping
```

---

## 🤖 IA (Machine Learning)

```bash
cd ml

python3 -m venv venv

# Linux / Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### Rodar API de inferência

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Teste:

```bash
curl http://127.0.0.1:8000/health
```

---

## 📱 FRONTEND (Expo)

```bash
cd expo
npm install
npx expo start
```

### Para rodar no celular

1. Instale **Expo Go**
2. Conecte na mesma rede Wi-Fi
3. Escaneie o QR code

---

## 🌐 Configuração de IP

No arquivo:

```
expo/src/services/api.js
```

Defina seu IP local:

```js
export const API_BASE_URL = "http://SEU_IP_LOCAL:3333";
```

Exemplo:

```js
export const API_BASE_URL = "http://192.168.0.200:3333";
```

---

## 🔐 Login padrão

### Paciente
```
email: paciente@careplus.com
senha: 123456
```

### Médico
```
email: medico@careplus.com
senha: 123456
```

---

## 🔄 Fluxo do Sistema

```
App (Expo)
   ↓
Node API (Fastify)
   ↓
Python AI (FastAPI)
   ↓
Modelo PyTorch
```

---

## 📊 Funcionalidades

- ✅ Login com autenticação
- ✅ Dashboard médico e paciente
- ✅ Coleta de dados de saúde
- ✅ Integração com IA preditiva
- ✅ Predição de frequência cardíaca
- 🔜 Score de risco em tempo real

---

## ⚠️ Observações

- Dataset PPG-DaLiA não está incluído (muito grande)
- Arquivos `.npy` e dados brutos são ignorados no Git
- Certifique-se de que backend e IA estejam rodando antes do app

---

## 🧪 Testes rápidos

### API Node

```bash
curl http://localhost:3333/ping
```

### IA

```bash
curl http://127.0.0.1:8000/health
```

---

## 📌 Versão atual

```
v1.0 — Login + Navegação + IA integrada
```

---

## 👨‍💻 Autor

Next Gen
Projeto acadêmico + aplicação real de IA em saúde

---

## 📄 Licença

Uso educacional
