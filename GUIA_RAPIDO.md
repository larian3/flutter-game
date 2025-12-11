# 🚀 Guia Rápido - Tap Game Fullstack

## ⚡ Start Rápido (3 minutos)

### 1️⃣ Subir o Backend (Docker)

```powershell
# Na raiz do projeto
docker-compose up -d

# Aguardar 30 segundos para os serviços subirem
# Testar se está rodando:
curl http://localhost:3000/api/health
```

**O que sobe:**
- ✅ MySQL (porta 3306)
- ✅ Redis (porta 6379) 
- ✅ Backend API (porta 3000)

### 2️⃣ Testar a API

```powershell
# Criar um usuário
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"teste","email":"teste@email.com","password":"senha123"}'

# Você receberá um TOKEN. Copie-o!
```

### 3️⃣ Rodar o Jogo Flutter

```powershell
# No projeto
C:\src\flutter\bin\flutter.bat pub get
C:\src\flutter\bin\flutter.bat run -d edge
```

Pronto! O jogo abrirá no navegador! 🎮

---

## 📊 O Que Você Tem Agora

### ✅ Backend Completo
- API REST em TypeScript
- Autenticação JWT
- MySQL para dados
- Redis para cache
- Docker para facilitar

### ✅ Frontend Flutter
- Jogo funcionando
- Multiplataforma (Web, Windows, Android, iOS)
- Interface moderna

---

## 🎯 Para Mostrar em Entrevistas

### 1. Demonstre o Stack Completo

```powershell
# Backend
"Criei uma API REST completa em Node.js + TypeScript com autenticação JWT"

# Mostre: backend/src/server.ts

# Database
"Uso MySQL para dados persistentes e Redis para cache de performance"

# Mostre: backend/src/config/database.ts e redis.ts

# Docker
"Tudo containerizado para facilitar o setup"

# Mostre: docker-compose.yml
```

### 2. Explique a Arquitetura

```
Frontend (Flutter) 
    ↓ HTTP
API REST (Node + TypeScript)
    ↓ 
MySQL (dados) + Redis (cache)
```

### 3. Funcionalidades Principais

- ✅ Registro e login de usuários
- ✅ Sistema de pontuação
- ✅ Leaderboard com cache
- ✅ Validação anti-cheat
- ✅ Testes automatizados

---

## 🔧 Comandos Úteis

### Docker

```powershell
# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Reiniciar
docker-compose restart

# Limpar tudo
docker-compose down -v
```

### Backend

```powershell
cd backend

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Testes
npm test

# Build
npm run build
```

### Flutter

```powershell
# Atualizar dependências
C:\src\flutter\bin\flutter.bat pub get

# Rodar testes
C:\src\flutter\bin\flutter.bat test

# Ver dispositivos
C:\src\flutter\bin\flutter.bat devices

# Limpar cache
C:\src\flutter\bin\flutter.bat clean
```

---

## 📝 Checklist para Portfólio

- [x] Backend Node.js + TypeScript
- [x] MySQL funcionando
- [x] Redis funcionando
- [x] Autenticação JWT
- [x] API REST documentada
- [x] Docker Compose
- [x] Testes básicos
- [x] Frontend Flutter
- [x] README profissional

---

## 💡 Dicas para a Entrevista

### Quando perguntarem sobre Flutter:
*"Desenvolvi um jogo multiplataforma que funciona em Web, Windows, mobile... [mostrar rodando]"*

### Quando perguntarem sobre Node.js:
*"Criei uma API REST completa em TypeScript com autenticação JWT, validação de dados..."*

### Quando perguntarem sobre MySQL:
*"Modelei um banco relacional com relacionamentos, índices otimizados... [mostrar schema]"*

### Quando perguntarem sobre Redis:
*"Implementei cache para o leaderboard com TTL configurável, melhorando performance..."*

### Quando perguntarem sobre Docker:
*"Containerizei toda a aplicação com Docker Compose para facilitar o setup..."*

---

## 🎓 O Que Este Projeto Demonstra

1. **Fullstack** - Frontend + Backend + Database
2. **Arquitetura** - Separação em camadas, padrões de projeto
3. **Segurança** - JWT, bcrypt, validações
4. **Performance** - Cache, índices, pooling
5. **DevOps** - Docker, testes automatizados
6. **Boas Práticas** - TypeScript, documentação, versionamento

---

**🚀 Você tem um projeto COMPLETO e PROFISSIONAL para mostrar!**


