# Graphify Knowledge Graph Rules

## 1. Knowledge Graph Location
- The project's Graphify knowledge graph resides in `graphify-out/`.
- `graphify-out/GRAPH_REPORT.md` details architecture, god nodes, and community structure.
- `graphify-out/wiki/index.md` provides indexed navigation across modules and relations.

## 2. Querying Knowledge
- Use `graphify query "<question>"` for natural language semantic questions about code relationships.
- Use `graphify path "<ComponentA>" "<ComponentB>"` to trace execution and dependency paths across components.
- Use `graphify explain "<concept>"` to understand domain models or subsystem architectures.

## 3. Maintenance
- After making structural code changes (adding/modifying schemas, API routes, or major UI modules), run `graphify update .` to keep the AST and relationship graph synchronized.
