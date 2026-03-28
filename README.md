# careplus-predict
Software Linux do Careplus Predict.

# 🏥 CarePlus Predict

Sistema mobile + backend para monitoramento de dados de saúde em tempo real.

---

## 🚀 Como executar o projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/lincoln743/careplus-predict
cd careplus-predict
```

---

## 🔧 Backend (API)

### 2. Instalar dependências

```bash
cd api
npm install
```

### 3. Rodar o servidor

```bash
node server.js
```

✔ A API será iniciada em:

```
http://localhost:3333
```

---

## 📱 Frontend (Expo)

### 4. Instalar dependências

```bash
cd ../expo
npm install
```

---

## ⚠️ CONFIGURAÇÃO OBRIGATÓRIA (IMPORTANTE)

Para o aplicativo funcionar no celular, você precisa ajustar o IP da máquina.

### 🔎 Descobrir seu IP local

No terminal:

```bash
ip a
```

Procure por algo como:

```
inet 192.168.X.X
```

---

### ✏️ Alterar no arquivo:

```
expo/src/services/api.js
```

Substitua esta linha:

```js
ios: "http://192.168.15.180:3333",
android: "http://192.168.15.180:3333",
```

Pelo seu IP atual:

```js
ios: "http://SEU_IP:3333",
android: "http://SEU_IP:3333",
```

Exemplo:

```js
ios: "http://192.168.0.25:3333",
android: "http://192.168.0.25:3333",
```

---

## ▶️ Rodar o app

```bash
npx expo start -c
```

* Escaneie o QR Code com **Expo Go**
* Ou pressione:

  * `a` → Android Emulator
  * `w` → Web

---

## 🧪 Usuários de teste

| Tipo     | Email                                                 | Senha  |
| -------- | ----------------------------------------------------- | ------ |
| Paciente | [paciente@careplus.com](mailto:paciente@careplus.com) | 123456 |
| Médico   | [medico@careplus.com](mailto:medico@careplus.com)     | 123456 |

---

## ❗ Problemas comuns

### ❌ "Network request failed"

➡️ IP não configurado corretamente no `api.js`

---

### ❌ Não abre no celular

➡️ Celular e computador devem estar na **mesma rede Wi-Fi**

---

### ❌ Funciona no web mas não no celular

➡️ Provavelmente ainda está usando `localhost`

---

## 📌 Tecnologias

* React Native (Expo)
* Node.js (Fastify)
* SQLite (better-sqlite3)
