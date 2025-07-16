# Workout App Backend

Backend completo em Node.js para um app de treinos com sistema de autenticação JWT, CRUD completo, integração com pagamentos Stripe, algoritmo de IA para recomendações e estrutura de banco PostgreSQL.

## 🚀 Funcionalidades

- **Sistema de Autenticação JWT** - Registro, login, reset de senha
- **CRUD Completo** - Usuários, exercícios e treinos
- **API de Prescrição Automática** - Geração de treinos personalizados
- **Integração Stripe** - Pagamentos e assinaturas premium
- **IA para Recomendações** - Algoritmo inteligente de sugestões
- **Banco PostgreSQL** - Estrutura robusta e escalável
- **Documentação Swagger** - API totalmente documentada
- **Rate Limiting** - Proteção contra spam e ataques
- **Validação de Dados** - Validação completa com Joi
- **Tratamento de Erros** - Sistema robusto de error handling

## 🛠️ Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados
- **Sequelize** - ORM
- **JWT** - Autenticação
- **Stripe** - Pagamentos
- **Joi** - Validação
- **Swagger** - Documentação
- **Winston** - Logging
- **Helmet** - Segurança
- **CORS** - Cross-Origin Resource Sharing
- **Rate Limiting** - Controle de taxa

## 📁 Estrutura do Projeto

```
workout-app-backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── exerciseController.js
│   │   ├── workoutController.js
│   │   ├── paymentController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Exercise.js
│   │   ├── Workout.js
│   │   ├── WorkoutExercise.js
│   │   ├── Subscription.js
│   │   ├── Payment.js
│   │   └── index.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── exerciseRoutes.js
│   │   ├── workoutRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── aiRoutes.js
│   ├── services/
│   │   └── aiRecommendationService.js
│   └── server.js
├── .env.example
├── package.json
└── README.md
```

## 🚀 Instalação e Configuração

### 1. Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL (v12 ou superior)
- Conta Stripe (para pagamentos)

### 2. Clonagem e Instalação

```bash
git clone <repository-url>
cd workout-app-backend
npm install
```

### 3. Configuração das Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Configure as seguintes variáveis no arquivo `.env`:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workout_app
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Configuração do Banco de Dados

Crie um banco PostgreSQL:

```sql
CREATE DATABASE workout_app;
```

### 5. Executar o Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📊 Documentação da API

Acesse a documentação completa da API em: `http://localhost:3000/api/docs`

## 🔐 Endpoints Principais

### Autenticação

```
POST /api/auth/register     - Registrar usuário
POST /api/auth/login        - Login
GET  /api/auth/me          - Perfil do usuário
PUT  /api/auth/profile     - Atualizar perfil
PUT  /api/auth/password    - Alterar senha
```

### Exercícios

```
GET    /api/exercises           - Listar exercícios
GET    /api/exercises/:id       - Exercício específico
POST   /api/exercises           - Criar exercício
PUT    /api/exercises/:id       - Atualizar exercício
DELETE /api/exercises/:id       - Deletar exercício
GET    /api/exercises/categories - Categorias
```

### Treinos

```
GET    /api/workouts              - Listar treinos
GET    /api/workouts/:id          - Treino específico
POST   /api/workouts              - Criar treino
PUT    /api/workouts/:id          - Atualizar treino
DELETE /api/workouts/:id          - Deletar treino
POST   /api/workouts/:id/start    - Iniciar treino
POST   /api/workouts/:id/complete - Completar treino
```

### Pagamentos

```
GET  /api/payments/plans         - Planos disponíveis
POST /api/payments/subscribe     - Criar assinatura
GET  /api/payments/subscriptions - Listar assinaturas
POST /api/payments/webhook       - Webhook Stripe
```

### IA e Recomendações

```
GET  /api/ai/recommendations/workouts    - Recomendações de treinos
GET  /api/ai/recommendations/exercises   - Recomendações de exercícios
POST /api/ai/generate-plan              - Gerar plano de treino
POST /api/ai/personalized-workout       - Treino personalizado
GET  /api/ai/fitness-assessment         - Avaliação fitness
```

## 🧪 Testes

Execute os testes:

```bash
npm test
```

## 🔧 Scripts Disponíveis

```bash
npm start           # Iniciar servidor
npm run dev         # Desenvolvimento com nodemon
npm test           # Executar testes
npm run migration:create # Criar migração
npm run migration:run    # Executar migrações
```

## 📈 Funcionalidades da IA

O sistema de IA oferece:

- **Recomendações Personalizadas** - Baseadas no perfil e histórico do usuário
- **Análise de Equilíbrio Muscular** - Identifica músculos pouco trabalhados
- **Progressão Inteligente** - Sugere aumento de carga e repetições
- **Variedade de Treinos** - Evita monotonia com novos exercícios
- **Planos Automáticos** - Gera planos de treino completos

## 💳 Integração com Stripe

- **Assinaturas Recorrentes** - Planos mensais e anuais
- **Webhooks** - Sincronização automática de pagamentos
- **Múltiplos Planos** - Suporte a diferentes níveis de assinatura
- **Gerenciamento** - Cancelamento e reativação de assinaturas

## 🔒 Segurança

- **JWT Authentication** - Tokens seguros
- **Rate Limiting** - Proteção contra spam
- **Helmet** - Headers de segurança
- **Validação** - Todas as entradas são validadas
- **CORS** - Controle de origem

## 🚀 Deploy

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
PORT=8080
DB_HOST=your-production-db-host
STRIPE_SECRET_KEY=sk_live_your_live_key
# ... outras variáveis
```

### Docker (Opcional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📧 Contato

Para suporte e questões:
- Email: support@workoutapp.com
- GitHub: [Issues](https://github.com/your-repo/issues)

---

**Desenvolvido com ❤️ para a comunidade fitness**
