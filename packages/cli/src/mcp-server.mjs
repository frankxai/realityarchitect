import readline from 'node:readline';
import process from 'node:process';
import {
  validateReality,
  assessClaimConfidence,
  readRealityMd,
  emit,
  emitAll,
  nextArtifactBrief,
  briefToMarkdown
} from './index.mjs';

const TOOLS = [
  {
    name: 'reality_validate',
    description: 'Validate a reality.md file or text content against the standard conformance levels (L0 to L3). Catches contradictions, ungrounded assumptions, and missing required invariants.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Absolute or relative path to the reality.md file'
        },
        content: {
          type: 'string',
          description: 'Raw markdown content if checking in-memory text'
        }
      }
    }
  },
  {
    name: 'reality_emit',
    description: 'Emit a tailored agent harness context projection (claude, cursor, opencode, codex, antigravity) from a reality.md file.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to reality.md file'
        },
        target: {
          type: 'string',
          enum: ['claude', 'cursor', 'opencode', 'codex', 'antigravity', 'all'],
          description: 'Target harness or "all" to emit all projections'
        }
      },
      required: ['file_path']
    }
  },
  {
    name: 'reality_brief',
    description: 'Extract the next-artifact brief from reality.md identifying the current operational gap and required build action.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to reality.md file'
        }
      },
      required: ['file_path']
    }
  },
  {
    name: 'reality_graph',
    description: 'Generate the node and edge dependency graph representing personal truths, entities, hardware constraints, and invariant commitments.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to reality.md file'
        }
      },
      required: ['file_path']
    }
  },
  {
    name: 'reality_assess',
    description: 'Assess the empirical reality confidence of an agent claim, code output, or factual statement. Detects 6 failure modes, checks empirical indicators, and applies certainty caps to prevent hallucinations.',
    inputSchema: {
      type: 'object',
      properties: {
        claim_text: {
          type: 'string',
          description: 'The claim, conclusion, or factual statement to assess'
        },
        evidence_items: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of verifiable evidence receipts or indicator codes'
        }
      },
      required: ['claim_text']
    }
  }
];

export async function runMcpServer() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const sendResponse = (response) => {
    process.stdout.write(JSON.stringify(response) + '\n');
  };

  rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    let request;
    try {
      request = JSON.parse(trimmed);
    } catch {
      sendResponse({
        jsonrpc: '2.0',
        id: null,
        error: { code: -32700, message: 'Parse error' }
      });
      return;
    }

    const { id, method, params } = request;

    if (method === 'initialize') {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: {
            name: '@reality-architect/cli',
            version: '0.1.0'
          }
        }
      });
      return;
    }

    if (method === 'notifications/initialized') {
      return;
    }

    if (method === 'tools/list') {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS }
      });
      return;
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};

      try {
        let resultData;

        if (toolName === 'reality_validate') {
          const input = args.file_path || args.content;
          if (!input) throw new Error('Either file_path or content must be provided');
          resultData = validateReality(input);
        } else if (toolName === 'reality_emit') {
          const { existsSync, readFileSync } = await import('node:fs');
          if (!existsSync(args.file_path)) throw new Error(`File not found: ${args.file_path}`);
          const parsed = readRealityMd(readFileSync(args.file_path, 'utf8'));
          if (args.target === 'all') {
            resultData = emitAll(parsed);
          } else {
            resultData = {
              target: args.target || 'claude',
              content: emit(parsed, args.target || 'claude')
            };
          }
        } else if (toolName === 'reality_brief') {
          const { existsSync, readFileSync } = await import('node:fs');
          if (!existsSync(args.file_path)) throw new Error(`File not found: ${args.file_path}`);
          const parsed = readRealityMd(readFileSync(args.file_path, 'utf8'));
          const brief = nextArtifactBrief(parsed);
          resultData = {
            brief,
            markdown: briefToMarkdown(brief)
          };
        } else if (toolName === 'reality_graph') {
          const { existsSync, readFileSync } = await import('node:fs');
          if (!existsSync(args.file_path)) throw new Error(`File not found: ${args.file_path}`);
          const parsed = readRealityMd(readFileSync(args.file_path, 'utf8'));
          resultData = {
            entities: parsed.entities || [],
            invariants: parsed.invariants || [],
            edges: parsed.edges || []
          };
        } else if (toolName === 'reality_assess') {
          resultData = assessClaimConfidence(args.claim_text, args.evidence_items || []);
        } else {
          sendResponse({
            jsonrpc: '2.0',
            id,
            error: { code: -32601, message: `Unknown tool: ${toolName}` }
          });
          return;
        }

        sendResponse({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(resultData, null, 2)
              }
            ]
          }
        });
      } catch (err) {
        sendResponse({
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Error executing ${toolName}: ${err.message}`
              }
            ]
          }
        });
      }
      return;
    }

    sendResponse({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` }
    });
  });
}
