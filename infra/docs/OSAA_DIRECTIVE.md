# 🔬 OSAA Directive: One Single Atomized Action

## Overview
The OSAA (One Single Atomized Action) Directive establishes the standard methodology for all AI-assisted operations in this development environment. This directive ensures maximum clarity, error prevention, and validation at each discrete step of any process.

## Core Definition
An Atomized Action is the smallest possible meaningful and independently verifiable unit of work that can be:
1. Described in specific, concrete terms
2. Executed in isolation
3. Validated as successful or unsuccessful
4. Completed without reliance on concurrent or chained operations

## Governing Principles

### 1. Discreteness
- Each action must be fully self-contained
- No action may depend on the successful completion of a subsequent action
- Each action has a clear beginning and end state

### 2. Specificity
- Instructions must be exhaustively detailed
- No knowledge or experience should be assumed
- All paths, commands, inputs, and expected outputs must be explicitly stated
- All text/code must be complete without placeholders

### 3. Validation
- Every action must include objective validation criteria
- Confirmation must be solicited before proceeding
- Success or failure must be unambiguously determined

### 4. Sequence Control
- No action beyond the current atomic action should be executed
- Next actions are determined only after current action validation
- Conditional branching based on validation results

## Implementation Requirements

### Format for Atomic Actions

Each Atomized Action must be presented in this structure:

# OSAA X.Y: [Action Title]

## Action Description
A clear, concise statement of what this atomic action accomplishes.

## Detailed Instructions
Step-by-step instructions with all necessary details:
- Exact commands to enter
- Precise locations to click
- Complete code to copy/paste (never incomplete or with placeholders)
- Screenshots or visual indicators to watch for
- Potential error conditions and how to identify them

## Validation Criteria
Specific, observable outcomes that indicate success:
- Expected terminal output
- Files/directories that should exist
- Content that should be visible
- System responses to expect

## Confirmation
A direct question requiring explicit confirmation before proceeding.

### Numbering Convention

Actions should be numbered hierarchically:
- Major sequence number (1, 2, 3...)
- Sub-action number (1.1, 1.2, 1.3...)
- Never present more than one numbered action at a time

### Copy-Paste Safety

All code or text blocks must:
- Be fully complete and functional
- Account for potential formatting issues in web interfaces
- Avoid nested script issues
- Use appropriate code fencing
- Never contain placeholders or example values

### Error Handling

If an action fails validation:
- The same action should be reconsidered and adjusted
- Alternative approaches should be presented as new atomic actions
- Root causes must be addressed before proceeding

## Integration with Development Workflow

### When to Apply OSAA
- All environment configuration changes
- Script/code creation or modification
- System-level operations
- Complex multi-step processes
- Any operation that affects system state

### Exceptions to OSAA
- Rapid prototyping (explicitly designated)
- Exploratory conversations
- Conceptual discussions
- Strategy planning sessions

## AI Agent Requirements

All AI agents must:
1. Understand and abide by this directive without exception
2. Never present multiple atomic actions simultaneously 
3. Always verify completion before suggesting next steps
4. Request confirmation explicitly after each action
5. Provide all necessary information without assuming prior knowledge
6. Generate only complete, copy-paste-safe code and commands

## Developer Requirements

Developers should:
1. Confirm completion of each action before proceeding
2. Provide clear success/failure feedback
3. Report exact error messages when issues occur
4. Request clarification for any ambiguous instructions

## Governance Integration

This OSAA Directive extends and supplements:
- OPERATING_RULES.md
- AUTOMATION_PROTOCOL.md
- Project manifests and SOPs

All AI interactions must prioritize this directive when executing operations within the development environment.

## Last Updated: 2025-05-02
