# フォントファイルの配置

PDF出力に日本語フォント（Noto Sans JP）が必要です。

## 必要なファイル

以下のフォントファイルをこのディレクトリに配置してください：

- `NotoSansJP-Regular.ttf`
- `NotoSansJP-Bold.ttf`

## ダウンロード先

Noto Sans JP は Google Fonts から無料でダウンロードできます（OFLライセンス）：
https://fonts.google.com/noto/specimen/Noto+Sans+JP

1. 上記URLにアクセス
2. "Download family" をクリック
3. ZIP を解凍し、static/ フォルダ内から上記2ファイルを取得
4. このディレクトリに配置

## 注意事項

- フォントファイルは `.gitignore` で除外されています（ライセンス配布の懸念のため）
- 各開発者が個別にダウンロード・配置してください
- フォントが無い場合、英字フォールバックされる可能性があります
