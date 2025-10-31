# Agent Delegation Checklist

**Purpose:** Quick reference for meta-orchestrator to ensure proper agent usage
**Status:** MANDATORY for all sessions
**Created:** 2025-10-26

---

## Pre-Task Evaluation (EVERY TASK)

### Decision Tree

```
┌─ Task >5k tokens? ───────────────────┐
│  YES → MUST spawn agent              │
│  NO  → Continue ↓                     │
└──────────────────────────────────────┘

┌─ Multiple independent tasks? ────────┐
│  YES → MUST spawn parallel agents    │
│        (ONE message, multiple Tasks) │
│  NO  → Continue ↓                     │
└──────────────────────────────────────┘

┌─ Substantial file operations? ───────┐
│  YES → SHOULD spawn agent             │
│  NO  → Continue ↓                     │
└──────────────────────────────────────┘

┌─ Combined work >10k tokens? ─────────┐
│  YES → MUST spawn coordinating agent │
│  NO  → May implement directly         │
└──────────────────────────────────────┘
```

---

## Quick Checks

### Before Starting ANY Implementation:

- [ ] What is the token estimate for this task?
- [ ] Is this >5k tokens? (If YES → spawn agent)
- [ ] Are there 2+ independent subtasks? (If YES → parallel agents)
- [ ] Can this be parallelized? (If YES → parallel agents)
- [ ] What's my current agent usage rate? (Target: >60%)

---

## Token Estimation Guide

| Task Type | Typical Tokens | Agent Required? |
|-----------|---------------|-----------------|
| Single file edit (<50 lines) | 1-2k | No |
| Multiple file edits | 3-5k | Yes |
| File reading + analysis | 2-4k | Maybe |
| Content creation (5+ files) | 10-15k | Yes (definitely) |
| Test suite fixes (3+ tests) | 15-20k | Yes (parallel) |
| Documentation updates (3+ files) | 5-8k | Yes |
| Image processing + migration | 10-15k | Yes |
| Code refactoring | 8-12k | Yes |

---

## Parallel Execution Checklist

### When to Use Parallel Agents:

- [ ] 2+ independent tasks identified
- [ ] No dependencies between tasks
- [ ] Each task is substantial (>5k tokens)
- [ ] Results can be synthesized after completion

### How to Spawn in Parallel:

One message with multiple Task tool calls.

---

## Agent Usage Tracking (MANDATORY)

### Add to Every Response:

```yaml
[Agent Usage Check]
Session total tokens: 100,000
Direct implementation: 40,000 (40%)
Agent delegation: 60,000 (60%)
Agent usage rate: 60% (Target: >60%)
Status: GREEN
Action: Continue
```

**Status Levels:**
- GREEN: >60% agent usage (optimal)
- AMBER: 40-60% agent usage (increase delegation)
- RED: <40% agent usage (STOP and evaluate)

---

## Session Checkpoints

### Session Start:
- [ ] Read meta-orchestrator framework
- [ ] Identify all tasks in user request
- [ ] Estimate token size per task
- [ ] Create agent delegation plan
- [ ] Execute with agents

### Before Each Task:
- [ ] Estimate token cost
- [ ] Check delegation criteria
- [ ] Spawn agent if needed
- [ ] Use parallel if possible
- [ ] Track agent usage rate

### Mid-Session (Every 30k tokens):
- [ ] Calculate agent usage rate
- [ ] If <60%: evaluate and adjust
- [ ] Document any delegation issues

### Session End:
- [ ] Calculate final agent usage rate
- [ ] Document lessons learned
- [ ] Update SESSION_HISTORY.md
- [ ] Note delegation patterns

---

## Common Scenarios

### Scenario 1: Multiple Test Fixes
**Task:** Fix 3 failing tests
**Estimate:** 15-20k tokens
**Decision:** Spawn 3 parallel agents (one per test)
**Rationale:** Independent tasks, >5k total, parallelizable

### Scenario 2: Content Migration
**Task:** Migrate 50+ assets
**Estimate:** 40-50k tokens
**Decision:** Spawn 4-5 parallel agents by category
**Rationale:** Large task, independent categories, parallelizable

### Scenario 3: Documentation Update
**Task:** Update 3 doc files
**Estimate:** 5-8k tokens
**Decision:** Spawn 1 agent for all docs
**Rationale:** >5k tokens, related content, single context

### Scenario 4: Small Bug Fix
**Task:** Fix single file (<20 lines)
**Estimate:** 1-2k tokens
**Decision:** Implement directly
**Rationale:** <5k tokens, small scope

---

## Self-Correction Protocol

### If Caught Implementing >5k Token Task:

1. **STOP immediately**
2. Acknowledge: "I should have used an agent for this"
3. Reframe task for agent
4. Spawn appropriate agent(s)
5. Update agent usage tracking

---

## Role Boundaries

### Orchestrator SHOULD:
✅ Analyze and plan
✅ Break down complex tasks
✅ Spawn agents with clear instructions
✅ Synthesize results
✅ Make strategic decisions
✅ Track metrics

### Orchestrator SHOULD NOT:
❌ Implement >5k token tasks directly
❌ Read/edit many files sequentially
❌ Do parallelizable work sequentially
❌ Skip agent evaluation

---

## Quick Reference Card

```
┌───────────────────────────────────────┐
│ BEFORE IMPLEMENTING:                  │
│                                       │
│ 1. Token estimate? _____              │
│ 2. >5k? [Y/N] → Agent?                │
│ 3. Parallel? [Y/N] → Multiple agents? │
│ 4. Usage rate? _____%                 │
│                                       │
│ Target: >60% agent usage              │
└───────────────────────────────────────┘
```

---

## Related Documentation

- [Implementation Decisions Log](IMPLEMENTATION_DECISIONS_LOG.md) - Full decision details
- [Session History](SESSION_HISTORY.md) - Agent usage tracking per session
- [Meta-Orchestrator Framework](/home/ichardart/idp-projects/meta-orchestrator-framework/docs/meta-orchestrator-v3.2-INIT.md)

---

**Remember:** When in doubt, use an agent. The 79% token savings compound quickly.
