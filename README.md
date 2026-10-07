# LuMaThHu — servidor

O servidor foi trocado sem alterar o `public/index.html` do RPG Forge anterior.

## Rodar localmente
```bash
npm install
npm start
```
Abra `http://localhost:3000`.

## Salas
- O servidor gera um código único de 4 caracteres ao criar a sala.
- Quem cria a sala é o Mestre por autoridade do servidor.
- Participantes entram usando o código.
- Todos ficam na mesma sala online.
- O estado de cada cenário/aba é armazenado separadamente.
- Alterações de mapa, tokens, objetos e neblina são distribuídas em tempo real para quem está na mesma aba.

## Render
- Build Command: `npm install`
- Start Command: `npm start`
