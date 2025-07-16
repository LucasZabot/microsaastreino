# 💪 WorkoutApp - React Native

Um aplicativo completo para treinos com React Native, oferecendo treinos personalizados, sistema de timer avançado, controle de exercícios e funcionalidades premium.

## 🚀 Funcionalidades

### ✅ Implementadas

- **Autenticação Completa**
  - Login e cadastro de usuários
  - Gerenciamento de sessão com Redux
  - Recuperação de senha
  - Persistência de dados

- **Sistema de Navegação**
  - Stack Navigator para autenticação
  - Tab Navigator para funcionalidades principais
  - Navegação intuitiva e fluida

- **Gerenciamento de Estado**
  - Redux Toolkit para estado global
  - Persistência com Redux Persist
  - Slices para auth, workouts e timer

- **Componentes Reutilizáveis**
  - Button com variações (primary, secondary, outline)
  - Input com validação e máscara
  - WorkoutCard para exibição de treinos
  - Timer com animações e controle

- **Serviços de API**
  - Cliente HTTP configurado com Axios
  - Interceptors para token refresh
  - Serviços para auth, workouts e pagamentos

### 🔄 Em Desenvolvimento

- **Telas Principais**
  - Dashboard com estatísticas
  - Lista de treinos com filtros
  - Detalhes do treino
  - Player de treino com timer
  - Perfil do usuário
  - Configurações

- **Sistema de Timer**
  - Cronômetro para exercícios
  - Controle de séries e repetições
  - Tempo de descanso
  - Notificações sonoras

- **Funcionalidades Premium**
  - Tela de assinaturas
  - Integração com sistema de pagamentos
  - Planos premium com recursos exclusivos

## 🛠️ Tecnologias Utilizadas

- **React Native 0.80.1**
- **TypeScript** para tipagem estática
- **Redux Toolkit** para gerenciamento de estado
- **React Navigation** para navegação
- **React Native Paper** para componentes UI
- **Axios** para requisições HTTP
- **Redux Persist** para persistência
- **React Native Vector Icons** para ícones
- **React Native Linear Gradient** para gradientes
- **React Native Reanimated** para animações

## 📦 Instalação

### Pré-requisitos

- Node.js (versão 16 ou superior)
- React Native CLI
- Android Studio (para Android) ou Xcode (para iOS)
- Emulador Android ou dispositivo físico

### Passos para Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/workout-app.git
cd workout-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Para iOS (somente macOS)**
```bash
cd ios && pod install && cd ..
```

4. **Configure as variáveis de ambiente**
```bash
# Edite src/services/api.ts
# Altere a URL da API para seu backend
const API_BASE_URL = 'https://sua-api.com';
```

5. **Execute o aplicativo**

Para Android:
```bash
npx react-native run-android
```

Para iOS:
```bash
npx react-native run-ios
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── WorkoutCard.tsx
│   └── Timer.tsx
├── navigation/          # Configuração de navegação
│   ├── AppNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── screens/            # Telas da aplicação
│   ├── LoadingScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── LoginScreen.tsx
│   └── ...
├── services/           # Serviços de API
│   ├── api.ts
│   ├── authService.ts
│   ├── workoutService.ts
│   └── paymentService.ts
├── store/              # Redux store
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── workoutSlice.ts
│       └── timerSlice.ts
├── types/              # Tipos TypeScript
│   └── index.ts
└── utils/              # Utilitários
```

## 🎯 Funcionalidades Detalhadas

### Sistema de Autenticação
- Login com email e senha
- Cadastro de novos usuários
- Validação de formulários
- Recuperação de senha
- Refresh token automático

### Workouts
- Lista de treinos categorizados
- Filtros por dificuldade e categoria
- Favoritos
- Histórico de treinos
- Avaliações

### Timer Avançado
- Cronômetro visual com animações
- Controle de exercícios e séries
- Tempo de descanso personalizado
- Notificações e alertas
- Pausar/retomar treino

### Sistema de Pagamentos
- Planos de assinatura
- Integração com gateways
- Histórico de pagamentos
- Gerenciamento de cartões

## 📱 Telas Principais

### Autenticação
- **Welcome**: Tela inicial com apresentação
- **Login**: Formulário de login
- **Register**: Cadastro de usuário
- **ForgotPassword**: Recuperação de senha

### Principal
- **Dashboard**: Estatísticas e progresso
- **Workouts**: Lista de treinos
- **WorkoutDetails**: Detalhes do treino
- **WorkoutPlayer**: Execução do treino
- **Timer**: Cronômetro de exercícios
- **Profile**: Perfil do usuário
- **Settings**: Configurações
- **Subscription**: Planos premium
- **Payment**: Processamento de pagamentos

## 🔧 Configuração da API

O aplicativo espera uma API REST com os seguintes endpoints:

### Autenticação
```
POST /auth/login
POST /auth/register
POST /auth/logout
POST /auth/refresh
POST /auth/forgot-password
POST /auth/reset-password
```

### Workouts
```
GET /workouts
GET /workouts/:id
POST /workouts/:id/favorite
DELETE /workouts/:id/favorite
GET /workouts/history
POST /workouts/complete
```

### Pagamentos
```
GET /payments/plans
POST /payments/subscribe
GET /payments/current-subscription
POST /payments/cancel-subscription
```

## 🎨 Design System

### Cores Principais
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #f3f4f6 (Gray)
- **Success**: #10b981 (Emerald)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

### Tipografia
- **Títulos**: Font weight 700
- **Subtítulos**: Font weight 600
- **Texto normal**: Font weight 400
- **Texto pequeno**: Font weight 500

## 📊 Estado da Aplicação

### AuthState
```typescript
{
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### WorkoutState
```typescript
{
  workouts: Workout[];
  currentWorkout: Workout | null;
  favorites: string[];
  history: WorkoutHistory[];
  isLoading: boolean;
  error: string | null;
}
```

### TimerState
```typescript
{
  currentTime: number;
  isRunning: boolean;
  isResting: boolean;
  currentExercise: number;
  currentSet: number;
  totalSets: number;
  exerciseName: string;
}
```

## 🧪 Testes

Para executar os testes:

```bash
npm test
```

Para executar com coverage:

```bash
npm run test:coverage
```

## 🚀 Deploy

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
cd ios
xcodebuild -workspace WorkoutApp.xcworkspace -scheme WorkoutApp -configuration Release -archivePath WorkoutApp.xcarchive archive
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autor

- **Seu Nome** - [GitHub](https://github.com/seu-usuario)

## 🆘 Suporte

Para suporte, entre em contato:
- Email: suporte@workoutapp.com
- Issues: [GitHub Issues](https://github.com/seu-usuario/workout-app/issues)

---

**Desenvolvido com ❤️ usando React Native**
