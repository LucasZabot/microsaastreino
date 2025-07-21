# 💪 FitPhysio - Prescrição de Treinos Baseada em Ciência

Uma aplicação web moderna para prescrição de treinos e análise fisiológica baseada na **prescrição invertida**, conectando VO₂máx e FCmáxima para resultados consistentes.

## 🧪 Base Científica

Este projeto é fundamentado no livro **"Fisiologia do Exercício – Nutrição, Energia e Desempenho Humano"** (McArdle, Katch & Katch) e utiliza a metodologia de prescrição invertida para determinar zonas de treinamento precisas.

### Fórmula Principal
```
%FC = (%VO₂ + 42) / 1,41
```

### Cálculos Implementados
- **Idade**: Ano atual - Ano de nascimento
- **IMC**: Peso(kg) / (Altura(m))²
- **FCmáxima**: 208 - (0,7 × idade) - Fórmula de Tanaka
- **TMB**: Fórmula de Mifflin-St Jeor
  - Homens: (10×peso) + (6,25×altura) - (5×idade) + 5
  - Mulheres: (10×peso) + (6,25×altura) - (5×idade) - 161

## 🚀 Funcionalidades Principais

### ✅ Implementadas
- **Cadastro Completo do Usuário**
  - Dados pessoais (nome, data nascimento, sexo, peso, altura)
  - Percentual de gordura corporal (opcional)
  - Cálculos automáticos em tempo real

- **Classificações Automáticas**
  - IMC com classificação por faixa etária
  - Percentual de gordura corporal por idade e sexo
  - FCmáxima e TMB calculados automaticamente

- **Planejamento Personalizado**
  - Seleção de objetivo (emagrecimento, condicionamento, performance, hipertrofia)
  - Nível de experiência (iniciante, intermediário, avançado)
  - Frequência semanal e duração das sessões
  - Prescrição invertida com zonas VO₂ ↔ FC

- **Dashboard Completo**
  - Estatísticas gerais (treinos, tempo total, calorias, FC média)
  - Gráficos de evolução (FC e VO₂ dos últimos 7 treinos)
  - Distribuição por zonas de treinamento
  - Registro manual de treinos
  - Lista de treinos recentes
  - Resumo da prescrição atual

### 🔄 Prescrição Invertida
- Conversão automática entre % VO₂máx e % FCmáxima
- Tabela de referência com valores pré-calculados
- Zonas personalizadas baseadas no objetivo:
  - **Emagrecimento**: 50-70% VO₂ (zona de queima de gordura)
  - **Condicionamento**: 60-80% VO₂ (zona aeróbica)
  - **Performance**: 70-90% VO₂ (zona anaeróbica)
  - **Hipertrofia**: 60-85% VO₂ (zona mista)

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript
- **Chart.js** + React Chart.js 2 (gráficos)
- **date-fns** (manipulação de datas)
- **CSS3** com design responsivo
- **Hooks** para gerenciamento de estado

## 📋 Como Executar

### Pré-requisitos
- Node.js (versão 14 ou superior)
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>

# Entre no diretório
cd fitness-app

# Instale as dependências
npm install

# Execute a aplicação
npm start
```

A aplicação estará disponível em `http://localhost:3000`

### Build para Produção
```bash
npm run build
```

## 📱 Fluxo da Aplicação

### 1. Tela de Cadastro
- Formulário com validação em tempo real
- Cálculos automáticos exibidos instantaneamente
- Design responsivo e intuitivo

### 2. Planejamento do Treino
- Seleção visual de objetivos
- Configuração de frequência e duração
- Preview da prescrição invertida
- Tabela de conversão VO₂ ↔ FC

### 3. Dashboard
- Visão geral das estatísticas
- Gráficos interativos de evolução
- Registro de novos treinos
- Histórico detalhado

## 📊 Classificações Implementadas

### IMC (Adultos ≥ 20 anos)
| Classificação | IMC (kg/m²) |
|---------------|-------------|
| Baixo peso | < 18,5 |
| Normal | 18,5 – 24,9 |
| Sobrepeso | 25 – 29,9 |
| Obesidade grau I | 30 – 34,9 |
| Obesidade grau II | 35 – 39,9 |
| Obesidade grau III | ≥ 40 |

### Percentual de Gordura (Adultos)
| Sexo | Idade | Excelente | Bom | Aceitável | Acima do ideal |
|------|-------|-----------|-----|-----------|----------------|
| Homens | 20–29 | 7–10% | 11–14% | 15–20% | >20% |
| Homens | 30–39 | 8–12% | 13–16% | 17–21% | >21% |
| Mulheres | 20–29 | 16–19% | 20–23% | 24–29% | >29% |
| Mulheres | 30–39 | 17–20% | 21–24% | 25–30% | >30% |

## 🎯 Funcionalidades Premium (Futuras)

- **Sugestão Automática de Treino**: IA gera treinos personalizados
- **Gráficos Comparativos Avançados**: Análises mensais e semanais
- **Exportação em PDF**: Relatórios completos
- **Integração com Smartwatches**: Upload automático de dados
- **Plataformas Externas**: Sincronização com apps de fitness

## 🔧 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── UserRegistration.tsx
│   ├── WorkoutPlanning.tsx
│   ├── Dashboard.tsx
│   └── *.css
├── types/               # Definições TypeScript
│   └── index.ts
├── utils/               # Funções utilitárias
│   └── calculations.ts  # Cálculos fisiológicos
├── App.tsx             # Componente principal
└── App.css             # Estilos globais
```

## 📈 Dados de Exemplo

A aplicação gera automaticamente dados de exemplo para demonstração, incluindo:
- 15 dias de treinos simulados
- Variações realistas de FC e VO₂
- Distribuição por zonas de treinamento
- Cálculo automático de calorias

## 🤝 Contribuições

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 👨‍⚕️ Aviso Médico

Esta aplicação é para fins educacionais e de fitness geral. Sempre consulte um profissional de saúde antes de iniciar qualquer programa de exercícios, especialmente se você tiver condições médicas pré-existentes.

---

**Desenvolvido com 💜 usando React e TypeScript**

*Baseado em evidências científicas para prescrições de treino precisas e eficazes.*
