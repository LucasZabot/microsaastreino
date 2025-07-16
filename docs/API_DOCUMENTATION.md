# API Documentation - Workout App Backend

## Visão Geral

Esta é a documentação completa da API do Workout App Backend, desenvolvido em Node.js com Express, PostgreSQL e integração com Stripe.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.workoutapp.com/api
```

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. Inclua o token no header Authorization:

```
Authorization: Bearer <token>
```

## Estrutura de Resposta

Todas as respostas seguem o padrão:

```json
{
  "success": true|false,
  "message": "Mensagem descritiva",
  "data": {
    // Dados da resposta
  }
}
```

## Endpoints

### 🔐 Autenticação (`/auth`)

#### POST `/auth/register`
Registra um novo usuário.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "birth_date": "1990-01-01",
  "gender": "male",
  "height": 180,
  "weight": 75,
  "fitness_level": "beginner",
  "goals": ["weight_loss", "strength"],
  "injuries": []
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@email.com",
      "fitness_level": "beginner",
      "is_premium": false
    },
    "token": "jwt_token_here"
  }
}
```

#### POST `/auth/login`
Faz login do usuário.

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

#### GET `/auth/me`
Retorna informações do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

#### PUT `/auth/profile`
Atualiza perfil do usuário.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "João Silva Santos",
  "weight": 73,
  "goals": ["muscle_gain", "strength"],
  "preferred_workout_duration": 45
}
```

#### PUT `/auth/password`
Altera senha do usuário.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "senha123",
  "newPassword": "novaSenha456"
}
```

### 🏋️ Exercícios (`/exercises`)

#### GET `/exercises`
Lista exercícios com filtros e paginação.

**Query Parameters:**
- `page` (int): Página (padrão: 1)
- `limit` (int): Itens por página (padrão: 10)
- `category` (string): Categoria do exercício
- `difficulty_level` (string): Nível de dificuldade
- `muscle_groups` (string): Grupos musculares (separados por vírgula)
- `equipment` (string): Equipamentos (separados por vírgula)
- `search` (string): Busca por nome ou descrição

**Response:**
```json
{
  "success": true,
  "data": {
    "exercises": [
      {
        "id": "uuid",
        "name": "Push-ups",
        "description": "Classic bodyweight exercise",
        "category": "strength",
        "muscle_groups": ["chest", "shoulders", "triceps"],
        "difficulty_level": "beginner",
        "equipment": ["none"],
        "instructions": "Start in plank position...",
        "tips": ["Keep core tight"],
        "safety_notes": ["Don't arch back"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

#### GET `/exercises/:id`
Retorna exercício específico.

#### POST `/exercises`
Cria novo exercício.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Supino Inclinado",
  "description": "Exercício para peito superior",
  "category": "strength",
  "muscle_groups": ["chest", "shoulders"],
  "primary_muscles": ["chest"],
  "secondary_muscles": ["shoulders", "triceps"],
  "equipment": ["barbell", "bench"],
  "difficulty_level": "intermediate",
  "force_type": "push",
  "mechanics": "compound",
  "instructions": "Deite no banco inclinado...",
  "tips": ["Mantenha os ombros retraídos"],
  "safety_notes": ["Use um spotter"]
}
```

#### PUT `/exercises/:id`
Atualiza exercício existente.

#### DELETE `/exercises/:id`
Remove exercício.

#### GET `/exercises/categories`
Lista categorias de exercícios.

#### GET `/exercises/muscle-groups`
Lista grupos musculares.

#### GET `/exercises/equipment`
Lista equipamentos.

### 🏃 Treinos (`/workouts`)

#### GET `/workouts`
Lista treinos do usuário.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`, `limit`: Paginação
- `category`: Categoria do treino
- `difficulty_level`: Nível de dificuldade
- `status`: Status do treino (draft, active, completed)
- `is_template`: Se é template (true/false)
- `search`: Busca por nome
- `date_from`, `date_to`: Filtro por data

#### GET `/workouts/:id`
Retorna treino específico com exercícios.

#### POST `/workouts`
Cria novo treino.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Treino de Peito",
  "description": "Treino focado no peitoral",
  "category": "upper_body",
  "difficulty_level": "intermediate",
  "duration_minutes": 60,
  "muscle_groups": ["chest", "triceps"],
  "equipment_needed": ["barbell", "dumbbell"],
  "exercises": [
    {
      "exercise_id": "uuid",
      "order": 1,
      "sets": 3,
      "reps": 10,
      "weight": 80,
      "rest_time_seconds": 60
    }
  ]
}
```

#### PUT `/workouts/:id`
Atualiza treino existente.

#### DELETE `/workouts/:id`
Remove treino.

#### POST `/workouts/:id/start`
Inicia treino.

#### POST `/workouts/:id/complete`
Completa treino.

#### GET `/workouts/stats`
Estatísticas de treinos do usuário.

**Query Parameters:**
- `period` (int): Período em dias (padrão: 30)

### 💳 Pagamentos (`/payments`)

#### GET `/payments/plans`
Lista planos de assinatura disponíveis.

**Response:**
```json
{
  "success": true,
  "data": {
    "plans": [
      {
        "id": "price_id",
        "name": "Premium Monthly",
        "description": "Acesso completo mensal",
        "amount": 2999,
        "currency": "usd",
        "interval": "month",
        "features": ["AI recommendations", "Premium exercises"]
      }
    ]
  }
}
```

#### POST `/payments/subscribe`
Cria assinatura.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "price_id": "price_xxx",
  "payment_method_id": "pm_xxx"
}
```

#### GET `/payments/subscriptions`
Lista assinaturas do usuário.

#### DELETE `/payments/subscription/:id`
Cancela assinatura.

#### POST `/payments/subscription/:id/reactivate`
Reativa assinatura cancelada.

#### GET `/payments/history`
Histórico de pagamentos.

#### POST `/payments/webhook`
Webhook do Stripe (público).

### 🤖 IA e Recomendações (`/ai`)

#### GET `/ai/recommendations/workouts`
Recomendações de treinos personalizadas.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `category`: Categoria desejada
- `duration`: Duração em minutos
- `difficulty_level`: Nível de dificuldade
- `muscle_groups`: Grupos musculares
- `equipment`: Equipamentos disponíveis

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "type": "goal_based",
        "exercise": {
          "id": "uuid",
          "name": "Supino",
          "category": "strength"
        },
        "score": 0.9,
        "reason": "Great for strength",
        "suggested_sets": 3,
        "suggested_reps": 8,
        "suggested_weight": null
      }
    ],
    "profile": {
      "fitness_level": "intermediate",
      "goals": ["strength"],
      "injuries": []
    }
  }
}
```

#### GET `/ai/recommendations/exercises`
Recomendações de exercícios.

#### POST `/ai/generate-plan`
Gera plano de treino completo.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "duration": 7,
  "goals": ["strength", "muscle_gain"],
  "difficulty_level": "intermediate",
  "preferred_duration": 60,
  "preferred_days": [1, 3, 5],
  "equipment_available": ["barbell", "dumbbell"]
}
```

#### POST `/ai/personalized-workout`
Cria treino personalizado.

**Body:**
```json
{
  "focus_areas": ["chest", "shoulders"],
  "duration": 45,
  "equipment_available": ["dumbbell"],
  "intensity_level": "moderate"
}
```

#### GET `/ai/progressive-training`
Sugestões de progressão.

**Query Parameters:**
- `exercise_id`: ID do exercício
- `current_weight`: Peso atual
- `current_reps`: Repetições atuais
- `current_sets`: Séries atuais

#### GET `/ai/muscle-balance`
Análise de equilíbrio muscular.

#### GET `/ai/variety-suggestions`
Sugestões de variedade nos treinos.

#### GET `/ai/goal-insights`
Insights sobre os objetivos do usuário.

#### GET `/ai/fitness-assessment`
Avaliação fitness completa.

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `429` - Muitas requisições
- `500` - Erro interno do servidor

## Rate Limiting

A API possui rate limiting configurado:
- Janela: 15 minutos
- Limite: 100 requisições por IP

## Paginação

Endpoints que retornam listas suportam paginação:

**Query Parameters:**
- `page` (int): Página (padrão: 1)
- `limit` (int): Itens por página (padrão: 10, máximo: 100)

**Response:**
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

## Webhooks

### Stripe Webhook

Endpoint: `POST /api/payments/webhook`

Eventos processados:
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Erros Comuns

### Erro de Validação
```json
{
  "success": false,
  "message": "Validation error",
  "errors": "\"name\" is required"
}
```

### Erro de Autenticação
```json
{
  "success": false,
  "message": "Invalid token"
}
```

### Erro de Autorização
```json
{
  "success": false,
  "message": "Premium subscription required"
}
```

## Exemplos de Uso

### Fluxo de Registro e Login

```javascript
// 1. Registrar usuário
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@email.com',
    password: 'senha123',
    fitness_level: 'beginner'
  })
});

const { data } = await registerResponse.json();
const token = data.token;

// 2. Buscar exercícios
const exercisesResponse = await fetch('/api/exercises?category=strength', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const exercises = await exercisesResponse.json();

// 3. Criar treino
const workoutResponse = await fetch('/api/workouts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Meu Treino',
    category: 'strength',
    difficulty_level: 'beginner',
    duration_minutes: 45,
    exercises: [
      {
        exercise_id: exercises.data.exercises[0].id,
        order: 1,
        sets: 3,
        reps: 10
      }
    ]
  })
});
```

### Fluxo de Assinatura

```javascript
// 1. Listar planos
const plansResponse = await fetch('/api/payments/plans');
const plans = await plansResponse.json();

// 2. Criar assinatura
const subscriptionResponse = await fetch('/api/payments/subscribe', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    price_id: plans.data.plans[0].id,
    payment_method_id: 'pm_xxx'
  })
});
```

### Fluxo de Recomendações IA

```javascript
// 1. Obter recomendações de treinos
const recommendationsResponse = await fetch('/api/ai/recommendations/workouts?category=strength&duration=45', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const recommendations = await recommendationsResponse.json();

// 2. Gerar plano personalizado
const planResponse = await fetch('/api/ai/generate-plan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    duration: 7,
    goals: ['strength', 'muscle_gain'],
    difficulty_level: 'intermediate'
  })
});
```

## Testes

A API pode ser testada usando ferramentas como:
- Postman
- Insomnia
- cURL
- Swagger UI (disponível em `/api/docs`)

## Versionamento

Esta é a versão 1.0.0 da API. Futuras versões serão versionadas como:
- `/api/v1/...`
- `/api/v2/...`

## Suporte

Para suporte técnico:
- Email: support@workoutapp.com
- Documentação: http://localhost:3000/api/docs
- GitHub Issues: [Link para issues]