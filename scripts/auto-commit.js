const { execSync } = require("child_process");
function sh(cmd){ return execSync(cmd,{encoding:"utf8"}).trim(); }

function loop(){
  try{
    const changes = sh("git status --porcelain");
    if(!changes) return;
    sh("git add -A");
    const msg = `chore(dev autosave): ${new Date().toISOString()}`;
    sh(`git commit -m "${msg}"`);
    if(process.env.AUTOPUSH === "true"){ sh("git push"); }
    console.log(`[autosave] committed: ${msg}`);
  }catch(e){ console.error("[autosave] error:", e.message); }
}
setInterval(loop, 60*1000);
console.log("[autosave] running every 60s. Set AUTOPUSH=true to push.");
