# `diagramas/` — Documentação Visual da Arquitetura

Esta pasta contém **31 diagramas educativos** gerados via [Figma MCP](https://docs.github.com/en/copilot/customizing-copilot/extending-copilot-chat-with-mcp) diretamente pelo GitHub Copilot no Agent Mode. Todos em Português do Brasil com legendas detalhadas.

## Como foram criados

Os diagramas foram gerados usando o **MCP (Model Context Protocol)** do Figma integrado ao VS Code. O Copilot em Agent Mode leu os arquivos `.agent.md` e `SKILL.md` do projeto e gerou diagramas Mermaid que o Figma converteu em imagens visuais.

Isso demonstra o poder do MCP — integrar ferramentas externas (Figma) diretamente no fluxo de trabalho do Copilot.

## Inventário completo

---

### Arquitetura & Orchestrador

#### Arquitetura Geral do TodoApp

[![Arquitetura Geral](TodoApp%20-%20Arquitetura%20Geral.jpg)](TodoApp%20-%20Arquitetura%20Geral.jpg)

Este diagrama mostra a **visão macro da aplicação**. O usuário acessa o Frontend (React + Vite) na porta 5173, que se comunica via REST API com o Backend (Fastify + TypeScript) na porta 3001. O backend usa Prisma ORM para acessar o PostgreSQL na porta 5432. Os três serviços rodam dentro do Docker Compose, cada um em seu container isolado. As setas indicam o protocolo de comunicação: HTTP entre frontend↔backend e SQL parametrizado entre backend↔banco.

#### Orchestrador — Fluxo de Handoffs entre Agentes

[![Orchestrador](Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg)](Orchestrador%20-%20Fluxo%20de%20Handoffs%20entre%20Agentes.jpg)

O orchestrador é o **agente central** que coordena todo o trabalho. O fluxo começa quando o usuário faz um pedido. O orchestrador detecta o tipo de tarefa (feature, bugfix, deploy ou code review), carrega a skill SKILL.md correspondente, executa as fases sequencialmente delegando para subagentes, valida os critérios de saída (handoff) entre cada fase, e aplica o gate final (tsc clean + testes passando + zero any) antes de entregar o relatório.

---

### Workflows

#### Workflow Feature — Plan → Implement → Review → Verify

[![Feature](Workflow%20Feature%20-%20Plan%20Implement%20Review%20Verify.jpg)](Workflow%20Feature%20-%20Plan%20Implement%20Review%20Verify.jpg)

Workflow para **implementar novas funcionalidades**. Na fase Plan, o orchestrador define escopo e lista arquivos. Na fase Implement, delega para o subagente da camada correta (React Frontend Engineer para UI, PostgreSQL DBA para schema, DevOps Expert para infra). Na fase Review, o Code Reviewer verifica padrões Zod, OWASP e ARIA. Na fase Verify, o QA roda testes e type-check. O gate final exige que o code reviewer tenha aprovado.

#### Workflow Bugfix — Reproduce → Debug → Fix → Test

[![Bugfix](Workflow%20Bugfix%20-%20Reproduce%20Debug%20Fix%20Test.jpg)](Workflow%20Bugfix%20-%20Reproduce%20Debug%20Fix%20Test.jpg)

Workflow para **correção sistemática de bugs**. O QA primeiro reproduz o bug com passos claros. O Debug Mode investiga a causa raiz analisando stack traces e classificando o tipo (lógica, estado, integração ou ambiente). O fix é implementado com a menor mudança possível. O QA cria um teste de regressão obrigatório para garantir que o bug não volte. Gate final: teste de regressão criado e passando.

#### Workflow Deploy — Build → Test → Lint → Verify

[![Deploy](Workflow%20Deploy%20-%20Build%20Test%20Lint%20Verify.jpg)](Workflow%20Deploy%20-%20Build%20Test%20Lint%20Verify.jpg)

Workflow para **validar que o ambiente Docker está saudável**. O DevOps Expert executa `docker compose build` e verifica os 3 serviços. O QA roda a suite de testes backend (Jest) e frontend (Vitest). O orchestrador valida TypeScript com `tsc --noEmit` e confere o `.env.example`. O DevOps Expert faz smoke tests: frontend carrega, API retorna 401 sem auth, webhook rejeita signature inválida.

#### Workflow Code Review — Lint → Security → Review → Approve

[![Code Review](Workflow%20Code%20Review%20-%20Lint%20Security%20Review%20Approve.jpg)](Workflow%20Code%20Review%20-%20Lint%20Security%20Review%20Approve.jpg)

Workflow para **revisão de código**. A fase Lint verifica TypeScript e zero `any`. A fase Security aplica o checklist OWASP Top 10 completo: sem raw SQL, tokens encriptados, HMAC-SHA256 para webhooks, cookies HttpOnly. A fase Review checa padrões por camada (Zod no backend, ARIA no frontend, indexes no Prisma). A fase Approve decide: aprovado, aprovado com sugestões, aprovado condicional, ou mudanças solicitadas.

---

### Agentes

#### Expert React Frontend Engineer

[![React Frontend](Agente%20-%20Expert%20React%20Frontend%20Engineer.jpg)](Agente%20-%20Expert%20React%20Frontend%20Engineer.jpg)

Agente especializado em **React 19, hooks modernos, Zustand, TailwindCSS e acessibilidade WCAG**. É invocado na fase Implement do workflow de feature quando a camada é frontend. Tem acesso a tools como `codebase`, `editFiles`, `runTests`, `search` e `microsoft.docs.mcp`. Seu fluxo interno: receber escopo → analisar componentes existentes → implementar com React 19 best practices → adicionar ARIA labels → escrever testes → retornar código ao orchestrador.

#### PostgreSQL Database Administrator

[![PostgreSQL DBA](Agente%20-%20PostgreSQL%20Database%20Administrator.jpg)](Agente%20-%20PostgreSQL%20Database%20Administrator.jpg)

Agente especializado em **schema Prisma, queries SQL, indexes e migrações**. Tem acesso direto ao banco via tools `pgsql_query`, `pgsql_connect` e `pgsql_visualizeSchema`. Regra importante: SEMPRE usa tools para inspecionar o banco, NUNCA olha no codebase para dados. É invocado quando a camada é database.

#### DevOps Expert

[![DevOps Expert](Agente%20-%20DevOps%20Expert.jpg)](Agente%20-%20DevOps%20Expert.jpg)

Agente que segue o **DevOps Infinity Loop** (Plan → Code → Build → Test → Release → Deploy → Operate → Monitor). Cuida de Dockerfiles, docker-compose, CI/CD e infraestrutura. Tem tools de terminal (`runInTerminal`, `getTerminalOutput`) para executar comandos. É invocado nas fases Build e Verify do workflow de deploy e na fase Implement quando a camada é infra.

#### QA — Quality Assurance

[![QA](Agente%20-%20QA%20Quality%20Assurance.jpg)](Agente%20-%20QA%20Quality%20Assurance.jpg)

Agente de qualidade com 5 princípios: assume que está quebrado até provar o contrário, reproduz antes de reportar, requisitos são o contrato, automatiza o que rodar duas vezes, e é preciso sem ser dramático. Trabalha em 5 etapas: entender escopo → construir plano de testes → escrever/executar testes → testes exploratórios → relatório. Cobre 6 categorias: happy path, boundary, negative, error handling, concurrency e security. Bug reports seguem formato padronizado: título, severidade, passos, esperado vs observado, evidência.

#### Debug Mode

[![Debug Mode](Agente%20-%20Debug%20Mode%20Instructions.jpg)](Agente%20-%20Debug%20Mode%20Instructions.jpg)

Agente de **investigação sistemática de bugs** em 4 fases. Fase 1 (Avaliação): lê erros, examina codebase, reproduz o bug. Fase 2 (Investigação): traça caminho de execução, verifica variáveis e fluxos, forma hipóteses priorizadas. Fase 3 (Resolução): implementa fix mínimo, verifica com testes, testa cenário original. Fase 4 (Garantia de Qualidade): revisa qualidade do fix, adiciona testes preventivos. Diretrizes: ser sistemático, documentar tudo, mudanças incrementais.

#### Code Reviewer

[![Code Reviewer](Agente%20-%20Code%20Reviewer%20TodoApp.jpg)](Agente%20-%20Code%20Reviewer%20TodoApp.jpg)

Agente de **revisão de código** especializado no TodoApp. Primeiro passo: ler o `workflow-code-review/SKILL.md`. Depois analisa quais camadas foram tocadas e aplica checklists específicos. Backend: Zod, services separados, error format, fastify-plugin. Frontend: hooks, Zustand, api/client.ts, ARIA, @dnd-kit. Segurança: OWASP (sem raw SQL, tokens encriptados, HMAC, cookies). Database: indexes, cascade, UTC.

---

### Skills

#### Skill: workflow-feature

[![workflow-feature](SKILL%20-%20workflow-feature%20detalhado.jpg)](SKILL%20-%20workflow-feature%20detalhado.jpg)

Skill que define o **workflow completo de implementação de features** com 4 fases, subagentes por camada, regras obrigatórias (TypeScript strict, Zod, ARIA) e gate final com 4 condições: tsc clean, testes passando, code reviewer aprovou, zero any.

#### Skill: workflow-bugfix

[![workflow-bugfix](SKILL%20-%20workflow-bugfix%20detalhado.jpg)](SKILL%20-%20workflow-bugfix%20detalhado.jpg)

Skill que define a **correção sistemática de bugs** com classificação por tipo (lógica, estado, integração, ambiente), regra de correção mínima ("não refatorar código não relacionado"), e teste de regressão obrigatório como gate final.

#### Skill: workflow-deploy

[![workflow-deploy](SKILL%20-%20workflow-deploy%20detalhado.jpg)](SKILL%20-%20workflow-deploy%20detalhado.jpg)

Skill que define a **validação de deploy Docker** com comandos concretos (`docker compose build`, `docker compose up`, `pg_isready`, `GET /health`), smoke tests de ambiente, e verificação de `.env.example`.

#### Skill: workflow-code-review

[![workflow-code-review](SKILL%20-%20workflow-code-review%20detalhado.jpg)](SKILL%20-%20workflow-code-review%20detalhado.jpg)

Skill que define o **pipeline de code review** com checklist OWASP completo (8 items), checklists por camada (backend, frontend, database), e 4 decisões possíveis (aprovado, aprovado com sugestões, aprovado condicional, mudanças solicitadas).

#### Skill: conventional-commit

[![conventional-commit](SKILL%20-%20conventional-commit.jpg)](SKILL%20-%20conventional-commit.jpg)

Skill que ensina a criar **commits padronizados** seguindo a especificação Conventional Commits. Fluxo: `git status` → `git diff` → stage → construir mensagem XML (type, scope, description, body, footer) → executar `git commit`. Inclui exemplos concretos e validação de cada campo.

#### Skill: JavaScript TypeScript Jest

[![Jest](SKILL%20-%20JavaScript%20TypeScript%20Jest.jpg)](SKILL%20-%20JavaScript%20TypeScript%20Jest.jpg)

Skill de referência com **boas práticas de testes Jest/Vitest**: estrutura de testes (.test.ts em `__tests__/`), mocking eficaz (`jest.mock`, `jest.spyOn`, `mockImplementation`), testes assíncronos (async/await, resolves/rejects), snapshot testing, testes de componentes React (React Testing Library, userEvent), e matchers comuns (toBe, toEqual, toContain, toThrow, toHaveBeenCalledWith).

#### Skill: multi-stage-dockerfile

[![multi-stage-dockerfile](SKILL%20-%20multi-stage-dockerfile.jpg)](SKILL%20-%20multi-stage-dockerfile.jpg)

Skill de referência para criar **Dockerfiles multi-stage otimizados**. Estrutura com 4 stages (dependencies → builder → test → runtime). Boas práticas: imagens oficiais com tags exatas, Alpine para menor footprint, otimização de layers e cache, segurança (não rodar como root, scan de vulnerabilidades, sem secrets na imagem final), e performance (NODE_ENV=production, HEALTHCHECK).

#### Skill: postgresql-code-review

[![postgresql-code-review](SKILL%20-%20postgresql-code-review.jpg)](SKILL%20-%20postgresql-code-review.jpg)

Skill de referência para **review de código PostgreSQL**: JSONB (GIN index + operador @>, CHECK constraints), arrays (GIN index + operador @>, bulk operations), schema design (BIGSERIAL, CITEXT, TIMESTAMPTZ, JSONB DEFAULT), tipos customizados (ENUM, DOMAIN), anti-patterns (VARCHAR ao invés de TEXT, JSONB sem validação), triggers otimizados (WHEN OLD IS DISTINCT FROM NEW), e extensões (uuid-ossp, pgcrypto, pg_trgm).

---

### Conceitos & Boas Práticas

#### Árvore de Decisão: Quando Usar o Quê

[![Árvore de Decisão](Arvore%20de%20Decisao_%20Quando%20Usar%20Agente%20Customizado%20vs%20Generalista%20vs%20Skill.jpg)](Arvore%20de%20Decisao_%20Quando%20Usar%20Agente%20Customizado%20vs%20Generalista%20vs%20Skill.jpg)

Este diagrama ajuda a decidir **quando criar um Agente Customizado, quando usar o Copilot genérico, e quando criar uma Skill**. A árvore guia a decisão com perguntas: "Precisa de persona com tools específicas?" → Agent. "Precisa de conhecimento de domínio reutilizável?" → Skill. "É uma regra geral do projeto?" → Instruction. "É um prompt para tarefa recorrente?" → Prompt File.

#### Ciclo Completo das Skills

[![Ciclo Skills](Ciclo%20Completo%20Skills.png)](Ciclo%20Completo%20Skills.png)

Mostra o **ciclo de vida completo** de uma Agent Skill: criação (definir frontmatter + regras), carregamento (Copilot detecta relevância e lê o SKILL.md), execução (aplica regras durante o trabalho), e evolução (atualizar com base em feedback e novos padrões).

#### Fluxo de Orquestração: Agents + Skills

[![Fluxo Orquestração](Fluxo%20de%20Orquestracao_%20Agents%20+%20Skills%20%E2%80%94%20Como%20Funciona.jpg)](Fluxo%20de%20Orquestracao_%20Agents%20+%20Skills%20%E2%80%94%20Como%20Funciona.jpg)

Detalha **como Agents e Skills trabalham juntos**. O Agent define quem faz (persona + tools), a Skill define como fazer (regras + critérios). O orchestrador conecta os dois: carrega a skill, delega ao agent, valida os critérios da skill, e avança.

#### Handoff Entre Agentes

[![Handoff](Handoff%20Entre%20Agentes_%20Como%20o%20Trabalho%20Flui%20de%20Agente%20para%20Agente.jpg)](Handoff%20Entre%20Agentes_%20Como%20o%20Trabalho%20Flui%20de%20Agente%20para%20Agente.jpg)

Explica o mecanismo de **transferência de trabalho entre agentes**. Cada fase tem critérios de saída claros. Se todos passam (✅), o trabalho flui para o próximo agente. Se algum falha, há até 2 retries antes de escalar ao usuário. Nunca se pula uma fase. O gate final é a última validação antes de declarar o trabalho completo.

#### Hooks: O Que São e Como Funcionam

[![Hooks](Hooks_%20O%20Que%20Sao%2C%20Quando%20Disparam%20e%20Como%20Funcionam.jpg)](Hooks_%20O%20Que%20Sao%2C%20Quando%20Disparam%20e%20Como%20Funcionam.jpg)

Explica o conceito de **Hooks no contexto de agentes**: eventos que disparam ações automáticas em pontos específicos do workflow. Similar a hooks do Git (pre-commit, post-merge), hooks de agentes executam validações, formatações ou notificações automaticamente em momentos chave do ciclo de trabalho.

#### Integração de Prompts: As 6 Camadas de Contexto

[![6 Camadas](Integracao%20de%20Prompts_%20As%206%20Camadas%20que%20Formam%20o%20Contexto%20Final.jpg)](Integracao%20de%20Prompts_%20As%206%20Camadas%20que%20Formam%20o%20Contexto%20Final.jpg)

Mostra como **6 camadas se combinam** para formar o contexto final que o Copilot recebe: (1) instruções pessoais do usuário, (2) instruções da organização, (3) instruções do repositório (`copilot-instructions.md`), (4) instruções path-specific (`.instructions.md` com `applyTo`), (5) persona do agente (`.agent.md`), e (6) prompt do usuário. Todas são fundidas em um único system prompt.

#### Mapa de Referência: Arquivos do Ecossistema

[![Mapa](Mapa%20de%20Referencia_%20Arquivos%20do%20Ecossistema%20de%20Agents%20e%20Skills.jpg)](Mapa%20de%20Referencia_%20Arquivos%20do%20Ecossistema%20de%20Agents%20e%20Skills.jpg)

Mapa completo de **todos os arquivos do ecossistema** de customização do Copilot: onde cada tipo de arquivo fica (`.github/agents/`, `.github/skills/`, `.github/prompts/`, `.github/instructions/`), qual extensão usa, e como se conectam entre si.

#### Modernização de Legacy Code — Workflow em 5 Fases

[![Modernização](Modernizacao%20de%20Legacy%20Code_%20Workflow%20em%205%20Fases%20+%20Boas%20Praticas.jpg)](Modernizacao%20de%20Legacy%20Code_%20Workflow%20em%205%20Fases%20+%20Boas%20Praticas.jpg)

Workflow avançado para **modernizar código legado** usando agentes: análise do código existente, planejamento de migração, implementação incremental, testes de regressão, e validação de compatibilidade. Cada fase tem boas práticas específicas para minimizar riscos.

#### Modernizando Legacy Code — Visão Geral

[![Modernizando](Modernizando%20Legacy%20Code.png)](Modernizando%20Legacy%20Code.png)

Visão geral do processo de **modernização de código legado**: identificar padrões obsoletos, aplicar refatorações seguras com cobertura de testes, migrar gradualmente para arquitetura moderna. Demonstra como agentes AI podem acelerar esse processo mantendo a qualidade.

#### Revisão de Código Gerado por AI

[![Revisão AI](Revisao%20de%20Codigo%20Gerado%20por%20AI.png)](Revisao%20de%20Codigo%20Gerado%20por%20AI.png)

Checklist específico para **revisar código gerado por IA**: verificar se segue os padrões do projeto, se tipos TypeScript estão corretos, se não introduziu dependências desnecessárias, se testes foram incluídos, se segurança OWASP está respeitada, e se a solução é a mais simples possível. Essencial para manter qualidade quando se usa AI assistants.
## Paleta de cores usada

| Camada | Cor | Hex |
|--------|-----|-----|
| Frontend | Azul | `#3B82F6` |
| Backend | Verde | `#10B981` |
| Database | Amarelo | `#F59E0B` |
| Infraestrutura | Roxo | `#8B5CF6` |
| Orchestrador | Vermelho | `#EF4444` |
| Skills | Rosa | `#EC4899` |

## Navegação

- ⬆️ [Voltar ao README principal](../README.md)
- 🤖 [Agents](../.github/agents/README.md) — agentes documentados nos diagramas
- 🛠️ [Skills](../.github/skills/README.md) — skills documentadas nos diagramas
- 🔧 [Backend](../backend/README.md) — backend da aplicação
- 🎨 [Frontend](../frontend/README.md) — frontend da aplicação
