# Claude Code Configuration

This directory contains Claude Code configuration files.

## Structure

```
.claude/
├── agents/              # Specialized AI assistants
│   └── skill-learner.md # Auto-optimizes skills from review feedback
├── commands/            # Slash commands (/command-name)
│   └── dev.md          # Complete development workflow
├── skills/              # Domain knowledge documents
│   ├── requirement-clarification/
│   ├── architecture-design/
│   ├── ui-design-system/
│   ├── code-implementation/
│   └── code-review/
└── settings.local.json  # Personal settings (gitignored)
```

## Workflow Artifacts

Workflow artifacts (requirements, architecture docs, reviews, etc.) are stored in:
- `docs/requirements/` - Requirement documents
- `docs/architecture/` - Architecture designs
- `docs/design/` - UI/UX designs
- `docs/reviews/` - Code review reports
- `docs/learnings/` - Learning cases from optimizations

## Usage

```bash
# Start development workflow
/dev 添加搜索功能

# Manual skill trigger
Use requirement-clarification skill

# Manual agent trigger
Use skill-learner agent
```

See individual files for detailed documentation.
