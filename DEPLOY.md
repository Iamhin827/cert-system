# 部署指南

## 前置準備

1. 安裝 Vercel CLI：
```bash
npm install -g vercel
```

2. 登入 Vercel：
```bash
vercel login
```

## 部署步驟

1. 本地測試構建：
```bash
npm run build
```

2. 部署到 Vercel：
```bash
npm run deploy
```

## 環境變數設置

在 Vercel 儀表板中設置以下環境變數：

- `REACT_APP_API_URL`: 後端 API 的 URL
- `REACT_APP_ENV`: 環境（production/development）
- `REACT_APP_VERSION`: 應用程式版本

## 自動部署

當您推送代碼到 GitHub 時，Vercel 會自動部署您的應用程式。

## 故障排除

如果遇到部署問題：

1. 檢查構建日誌：
```bash
vercel logs
```

2. 檢查環境變數是否正確設置

3. 確保所有依賴都已正確安裝：
```bash
npm install
```

## 回滾部署

如果需要回滾到之前的版本：

1. 在 Vercel 儀表板中找到之前的部署
2. 點擊 "..." 按鈕
3. 選擇 "Promote to Production" 