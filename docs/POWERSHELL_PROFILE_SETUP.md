# PowerShell Profile Setup Guide
# このファイルを参考に、PowerShell プロファイルを設定してバッチジョブプロンプトを自動防止

# 1. PowerShell プロファイルの場所を確認
# $PROFILE
# 結果例: C:\Users\YourName\Documents\PowerShell\Microsoft.PowerShellISE_profile.ps1

# 2. プロファイルが無い場合は作成
# New-Item -Path $PROFILE -ItemType File -Force

# 3. プロファイルを編集して以下を追加
# notepad $PROFILE

# === 以下をプロファイルの末尾に追加 ===

# Cleanup background jobs on exit to avoid "End batch job?" prompt
function Remove-BackgroundJobs {
    $jobs = Get-Job -ErrorAction SilentlyContinue
    if ($jobs) {
        Remove-Job -Job $jobs -Force -ErrorAction SilentlyContinue
    }
}

# PowerShell 終了時にクリーンアップ実行
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Remove-BackgroundJobs
} -SupportEvent | Out-Null

# === ここまで ===

# 4. PowerShell を再起動して確認

# または、以下のワンライナーで自動追加（PowerShell 7 推奨）
# Add-Content -Path $PROFILE -Value "`nRegister-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue } -SupportEvent | Out-Null"
