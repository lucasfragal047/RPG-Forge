const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const root = __dirname;
const source = path.join(root, 'dice-source');
const dist = path.join(source, 'dist');
const target = path.join(root, 'public', 'dice');
function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.status !== 0) process.exit(result.status || 1);
}
if (!fs.existsSync(path.join(source, 'package.json'))) {
  console.error('Código-fonte dos dados 3D não encontrado em dice-source/.'); process.exit(1);
}
if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.log('Preparando o sistema de dados 3D do Owlbear (primeira execução)...');
  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund'], source);
  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], source);
}
fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(target, { recursive: true });
fs.cpSync(dist, target, { recursive: true });
console.log('Sistema de dados 3D pronto em public/dice/.');
