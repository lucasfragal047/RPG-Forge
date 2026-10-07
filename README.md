# RPG Forge — Mesa Virtual

## Rodar localmente
```bash
npm install
npm start
```
Abra `http://localhost:3000`.

## Como funciona a sala
- Ao entrar no site, aparece **Criar sala** ou **Participar de sala**.
- **Criar sala** gera um código único de 4 caracteres e coloca o criador como **Mestre**.
- **Participar de sala** pede o código recebido do Mestre.
- O servidor é quem cria e valida os códigos; o navegador não decide quem é Mestre.
- O código vincula os jogadores à mesma sala online.

## Render
- Build Command: `npm install`
- Start Command: `npm start`
