# Flyee — Autonomous Software Engineering Harness

> Este arquivo é gerado automaticamente pelo installer `flyee`.
> Ele configura o comportamento do agente AI neste workspace.

---

## Harness-First Architecture

Este projeto utiliza o **Flyee Autonomous Engineering Harness** — um sistema
autônomo com loop Generator↔Evaluator, enforcement mecânico (Taste Invariants),
e gerenciamento de entropia (GC) para construção e manutenção de software.

> **Inspirado por:**
> - [Anthropic Harness Design](https://www.anthropic.com/engineering/harness-design-long-running-apps)
> - [OpenAI Harness Engineering](https://openai.com/index/harness-engineering/)

### Estrutura

```
.agent/
├── agents/        ← Specialist agents (harness-planner, harness-evaluator, ...)
├── skills/        ← 67+ modular skills
├── workflows/     ← Workflows (harness is the single orchestrator)
├── scripts/       ← Automation scripts (harness_runner.py)
└── flyee-bridge/  ← Sync with Flyee Platform (optional)

.flyee/              ← All Flyee artifacts (spec, rules, discovery, sprints, decisions, AGENTS.md)
```

### Harness-First Operation

**ALL execution scenarios route through the harness:**

| Scenario | Command | Harness Mode |
|----------|---------|--------------|
| **New project** | `/harness "prompt"` or `/new-project` | Full (multi-sprint) |
| **New feature** | `/new-task` | Micro (single-sprint, 2 iter) |
| **Bug fix** | `/debug` | Micro (post-fix evaluation) |
| **Refactoring** | `/execute` | Micro (per task) |
| **Legacy project** | `/harness --legacy` or `/legacy-project` | Legacy (analysis + eval) |
| **Continuation** | `/harness --enhance` | Enhance (foundation + features) |

### Three Pillars

| Pillar | What |
|--------|------|
| **Evaluation Loop** | Generator↔Evaluator with sprint contracts and scoring |
| **Mechanical Enforcement** | Taste invariants (`.flyee/rules/TASTE-RULES.md`) |
| **Entropy Management** | Automated GC to prevent codebase decay |

### Agent Routing

| Domain | Agent |
|--------|-------|
| Autonomous Planning | `harness-planner` (absorbs product-owner, project-planner) |
| Quality Evaluation | `harness-evaluator` (absorbs tdd-reviewer) |
| Web Frontend | `frontend-specialist` |
| Backend/API | `backend-specialist` |
| Mobile | `mobile-developer` |
| Security | `security-auditor` |
| Debugging | `debugger` |
| Multi-task | `orchestrator` |

### Key Workflows

| Command | Description |
|---------|-------------|
| `/harness` | **Primary orchestrator** — autonomous build/enhance/evaluate |
| `/new-task` | Add feature → delegates to Micro-Harness |
| `/debug` | Bug investigation → post-fix evaluation |
| `/execute` | Run existing task → Micro-Harness for features |
| `/task-complete` | Completion with verification gates |
| `/tdd` | SDD creation → feeds harness SPEC |
| `/prd` | PRD creation → feeds harness SPEC |
| `/audit` | Holistic project evaluation across 6 dimensions |

### Deprecated Workflows

| Command | Replacement |
|---------|-------------|
| `/discovery` | `/harness --enhance` |
| `/create` | `/harness "prompt"` |

### Flyee Platform (Optional)

Se `flyee.json` existir na raiz, o agente sincroniza tarefas com a plataforma Flyee.
Sem `flyee.json`, tudo funciona offline com estado local em `.flyee/`.

### Rules

1. Responda no idioma do usuário
2. Código e comentários em inglês
3. Todas as execuções passam pelo harness (Generator↔Evaluator)
4. Siga os gates obrigatórios (Pre-Implementation, Evaluation, Verification)
5. Clean code: sem over-engineering, sem comentários desnecessários
6. **Knowledge Persistence:** Ao concluir trabalho que gera decisões, padrões ou lições,
   atualizar `.flyee/KNOWLEDGE.md` (append-only). Ver skill `knowledge-persistence`.
7. **Taste Rules:** Carregar `.flyee/rules/TASTE-RULES.md` em toda execução que modifica código.
