# 💰 CoinScout

一個讓你在 Discord 上即時查詢加密貨幣資產的機器人，資料來源為 [CoinGecko API](https://www.coingecko.com/)。支援多用戶記錄，不需要冷錢包地址、資料只儲存在你自己電腦中！適合個人、家庭使用。

---

## 🚀 專案特色

*  **無需提供錢包地址**：不連接鏈上、不需要冷錢包資訊，資產紀錄完全由你輸入  
*  **資料私有安全**：所有用戶資料都儲存在你本地的 JSON 檔案中，不會外傳  
*  **支援多幣種**：支援 BTC、ETH、DOGE、ADA、SOL、USDT 等十多種主流幣種  
*  **即時幣價查詢**：與 CoinGecko API 串接，報價即時更新  
*  **Slash 指令支援**：使用直覺的 `/money`、`/total`、`/set` 指令管理資產  

---

## 📦 建立開發環境

### 1. 安裝 Node.js

請先從 [https://nodejs.org](https://nodejs.org) 安裝 Node.js（建議 LTS 版本）

### 2. 初始化與安裝依賴

```bash
npm install
```

### 3. 建立 `.env` 檔案

請在專案根目錄下建立 `.env` 檔案，內容如下：

```
DISCORD_TOKEN=你的 Discord Bot Token
CLIENT_ID=你的 Bot 應用程式 ID
```

你可以從 **[Discord Developer Portal](https://discord.com/developers/applications)** 取得這些資訊：

- `DISCORD_TOKEN` 是機器人登入所需的密鑰  
- `CLIENT_ID` 是 Slash 指令註冊所需的應用程式 ID


### 4. 註冊 Slash 指令（只需執行一次）

```bash
node register-commands.js
```

---

## 🛠 打包成 EXE 檔案

### 1. 全域安裝 pkg 工具

```bash
npm install -g pkg
```

### 2. 清除原始環境（建議）

```bash
rmdir /s /q node_modules
del package-lock.json
npm install
```

### 3. 編譯 EXE

```bash
pkg index.js --targets node18-win-x64 --output dist/CryptoBot.exe
```

### 4. dist 執行環境

請確認下列檔案是否存在 `dist/` 資料夾：

```
dist/
├── CryptoBot.exe
├── .env
├── portfolio.json     ← 初始可為 {}
└── settings.json      ← 初始可為 { "currency": "twd" }
```

---

## ✏️ 指令清單

| 指令                                     | 說明                             |
| -------------------------------------- | ------------------------------ |
| `/money coin:<幣種>`                     | 查詢某幣的即時價格                      |
| `/total name:<名稱>`                     | 查詢某使用者的資產總和                    |
| `/set name:<名稱> coin:<幣種> amount:<數量>` | 設定使用者資產資料                      |
| `/remove name:<名稱>`                    | 刪除使用者整份資料                      |
| `/setcurrency currency:<幣別>`           | 設定顯示幣價的幣別 (USD / TWD / JPY...) |
