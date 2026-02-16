# Simulator MCP

This Model Context Protocol (MCP) server exposes the DePIN Simulation Engine to LLM agents.

## Capabilities

- `run_simulation`: Runs the `simulateOne` or `runSimulation` logic with customizable parameters.
- `get_results`: Retrieves aggregated results from the last run.

## Installation

This package is part of the `DePin-Stress-Test` monorepo.

```bash
cd packages/simulator-mcp
npm install
```

## Configuration (Claude Desktop / Agent)

Add this to your `claude_desktop_config.json` or agent configuration:

```json
{
  "mcpServers": {
    "simulator": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/Users/devinsonpena/Desktop/Files/DePin-Stress-Test/packages/simulator-mcp/src/index.ts"
      ]
    }
  }
}
```

## Testing

Run the local test script to verify imports and execution:

```bash
npx tsx test-import.ts
```
