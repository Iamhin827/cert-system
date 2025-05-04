# GitHub Pages 部署指南

## 前置準備

1. 確保您有一個 GitHub 帳號
2. 在 GitHub 上創建一個新的倉庫，名為 `cert-system`
3. 將本地代碼推送到 GitHub 倉庫

## 部署步驟

1. 初始化 Git 倉庫（如果還沒有）：
```bash
git init
```

2. 添加遠程倉庫：
```bash
git remote add origin https://github.com/hinforworks/cert-system.git
```

3. 添加所有文件：
```bash
git add .
```

4. 提交更改：
```bash
git commit -m "Initial commit"
```

5. 推送到 GitHub：
```bash
git push -u origin main
```

6. 部署到 GitHub Pages：
```bash
npm run deploy
```

## 訪問網站

部署完成後，您的網站將可以通過以下地址訪問：
https://hinforworks.github.io/cert-system

## 更新網站

每次需要更新網站時，只需要：

1. 修改代碼
2. 提交更改：
```bash
git add .
git commit -m "Update website"
git push
```

3. 重新部署：
```bash
npm run deploy
```

## 故障排除

如果遇到部署問題：

1. 確保 `package.json` 中的 `homepage` 字段正確
2. 檢查 GitHub 倉庫設置中的 Pages 設置
3. 查看 GitHub Actions 的部署日誌

## 注意事項

- GitHub Pages 只支持靜態網站
- 每次部署可能需要等待幾分鐘才能看到更新
- 確保所有資源路徑使用相對路徑 