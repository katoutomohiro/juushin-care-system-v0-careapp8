# PowerShell Profile Setup Guide
# 縺薙・繝輔ぃ繧､繝ｫ繧貞盾閠・↓縲￣owerShell 繝励Ο繝輔ぃ繧､繝ｫ繧定ｨｭ螳壹＠縺ｦ繝舌ャ繝√ず繝ｧ繝悶・繝ｭ繝ｳ繝励ヨ繧定・蜍暮亟豁｢

# 1. PowerShell 繝励Ο繝輔ぃ繧､繝ｫ縺ｮ蝣ｴ謇繧堤｢ｺ隱・# $PROFILE
# 邨先棡萓・ C:\Users\YourName\Documents\PowerShell\Microsoft.PowerShellISE_profile.ps1

# 2. 繝励Ο繝輔ぃ繧､繝ｫ縺檎┌縺・ｴ蜷医・菴懈・
# New-Item -Path $PROFILE -ItemType File -Force

# 3. 繝励Ο繝輔ぃ繧､繝ｫ繧堤ｷｨ髮・＠縺ｦ莉･荳九ｒ霑ｽ蜉
# notepad $PROFILE

# === 莉･荳九ｒ繝励Ο繝輔ぃ繧､繝ｫ縺ｮ譛ｫ蟆ｾ縺ｫ霑ｽ蜉 ===

# Cleanup background jobs on exit to avoid "End batch job?" prompt
function Remove-BackgroundJobs {
    $jobs = Get-Job -ErrorAction SilentlyContinue
    if ($jobs) {
        Remove-Job -Job $jobs -Force -ErrorAction SilentlyContinue
    }
}

# PowerShell 邨ゆｺ・凾縺ｫ繧ｯ繝ｪ繝ｼ繝ｳ繧｢繝・・螳溯｡・Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Remove-BackgroundJobs
} -SupportEvent | Out-Null

# === 縺薙％縺ｾ縺ｧ ===

# 4. PowerShell 繧貞・襍ｷ蜍輔＠縺ｦ遒ｺ隱・
# 縺ｾ縺溘・縲∽ｻ･荳九・繝ｯ繝ｳ繝ｩ繧､繝翫・縺ｧ閾ｪ蜍戊ｿｽ蜉・・owerShell 7 謗ｨ螂ｨ・・# Add-Content -Path $PROFILE -Value "`nRegister-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue } -SupportEvent | Out-Null"

