# 🚀 Guia de Configuração Rápida - WorkoutApp

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **React Native CLI**: `npm install -g react-native-cli`
- **Android Studio** (para desenvolvimento Android)
- **Xcode** (para desenvolvimento iOS - somente macOS)

## 🔧 Instalação e Configuração

### 1. Navegue para o diretório do projeto
```bash
cd WorkoutApp
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configuração para iOS (somente macOS)
```bash
cd ios && pod install && cd ..
```

### 4. Configuração do Android
Certifique-se de que o Android Studio está instalado e configurado com:
- Android SDK
- Android Virtual Device (AVD) ou dispositivo físico conectado

### 5. Configuração da API
Edite o arquivo `src/services/api.ts` e altere a URL da API:
```typescript
const API_BASE_URL = 'https://sua-api.com'; // Substitua pela URL do seu backend
```

## 🏃‍♂️ Executando o Aplicativo

### Para Android:
```bash
npx react-native run-android
```

### Para iOS:
```bash
npx react-native run-ios
```

### Para iniciar o Metro bundler separadamente:
```bash
npx react-native start
```

## 🔍 Estrutura Atual do Projeto

```
WorkoutApp/
├── src/
│   ├── components/
│   │   ├── Button.tsx ✅
│   │   ├── Input.tsx ✅
│   │   ├── WorkoutCard.tsx ✅
│   │   └── Timer.tsx ✅
│   ├── navigation/
│   │   ├── AppNavigator.tsx ✅
│   │   ├── AuthNavigator.tsx ✅
│   │   └── MainNavigator.tsx ✅
│   ├── screens/
│   │   ├── LoadingScreen.tsx ✅
│   │   ├── WelcomeScreen.tsx ✅
│   │   ├── LoginScreen.tsx ✅
│   │   └── [outras telas em desenvolvimento]
│   ├── services/
│   │   ├── api.ts ✅
│   │   ├── authService.ts ✅
│   │   ├── workoutService.ts ✅
│   │   └── paymentService.ts ✅
│   ├── store/
│   │   ├── index.ts ✅
│   │   └── slices/
│   │       ├── authSlice.ts ✅
│   │       ├── workoutSlice.ts ✅
│   │       └── timerSlice.ts ✅
│   └── types/
│       └── index.ts ✅
├── App.tsx ✅
├── package.json ✅
└── README.md ✅
```

## 🎯 Funcionalidades Implementadas

### ✅ Completas
- **Autenticação**: Sistema completo de login/cadastro
- **Navegação**: Stack e Tab navigators configurados
- **Estado Global**: Redux com persistência
- **Componentes Base**: Button, Input, WorkoutCard, Timer
- **Serviços API**: Cliente HTTP com interceptors
- **Telas Base**: Welcome, Login, Loading

### 🔄 Em Desenvolvimento
- **Telas Principais**: Dashboard, WorkoutList, Profile, etc.
- **Funcionalidades Premium**: Assinaturas e pagamentos
- **Sistema de Timer**: Implementação completa
- **Backend Integration**: Conectar com API real

## 📱 Fluxo de Navegação

```
App Start → Loading Screen
    ↓
Authentication Check
    ↓
Not Authenticated → Welcome → Login/Register
    ↓
Authenticated → Main App (Tab Navigator)
    ↓
Dashboard | Workouts | Profile | Settings
```

## 🛠️ Comandos Úteis

### Desenvolvimento
```bash
# Limpar cache do Metro
npx react-native start --reset-cache

# Limpar build Android
cd android && ./gradlew clean && cd ..

# Limpar build iOS
cd ios && xcodebuild clean && cd ..

# Executar testes
npm test

# Lint do código
npm run lint
```

### Debug
```bash
# Abrir React Native Debugger
npx react-native log-android  # Logs do Android
npx react-native log-ios      # Logs do iOS
```

## 🔧 Configurações Adicionais

### Ícones (React Native Vector Icons)
Para Android, os ícones já estão configurados. Para iOS, certifique-se de que os ícones estão linkados.

### Gradientes (React Native Linear Gradient)
Já configurado para ambas as plataformas.

### Animações (React Native Reanimated)
Configuração adicional pode ser necessária para Android. Verifique a documentação oficial.

## 🐛 Problemas Comuns

### Metro bundler não inicia
```bash
npx react-native start --reset-cache
```

### Erro de dependências
```bash
npm install --legacy-peer-deps
```

### Erro no Android
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

### Erro no iOS
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

## 🎨 Próximos Passos

1. **Implementar telas restantes** (Dashboard, WorkoutList, Profile, etc.)
2. **Conectar com backend real**
3. **Implementar funcionalidades do timer**
4. **Adicionar sistema de pagamentos**
5. **Testes unitários e de integração**
6. **Configurar CI/CD**

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os pré-requisitos estão instalados
2. Consulte a documentação oficial do React Native
3. Verifique os logs de erro no terminal
4. Limpe o cache e rebuild o projeto

---

**Pronto para começar o desenvolvimento! 🚀**