type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: { readOnlyHint?: boolean };
  execute: (input: Record<string, unknown>) => Promise<unknown>;
};

type WebModelContext = {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => Promise<void>;
};

const PUBLIC_PAGES = {
  home: '/',
  'how-it-works': '/how-it-works',
  'use-cases': '/use-cases',
  help: '/help',
  faqs: '/faqs',
  contact: '/contact',
} as const;

function modelContext(): WebModelContext | undefined {
  const currentDocument = document as Document & { modelContext?: WebModelContext };
  const currentNavigator = navigator as Navigator & { modelContext?: WebModelContext };
  return currentDocument.modelContext ?? currentNavigator.modelContext;
}

/** Registers public, low-risk browser tools when the experimental WebMCP API exists. */
export function registerWebMcpTools(): void {
  const context = modelContext();
  if (!context) return;

  const controller = new AbortController();
  window.addEventListener('pagehide', () => controller.abort(), { once: true });

  const tools: WebMcpTool[] = [
    {
      name: 'naitrust.list_public_resources',
      title: 'List Naitrust public resources',
      description: 'Returns the safe, public Naitrust pages available for product and safe-deal information.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true },
      execute: async () => ({
        content: [{ type: 'text', text: JSON.stringify(PUBLIC_PAGES) }],
      }),
    },
    {
      name: 'naitrust.open_public_page',
      title: 'Open a Naitrust public page',
      description: 'Navigates this browser tab to a selected public Naitrust information page. It cannot perform authenticated or transaction actions.',
      inputSchema: {
        type: 'object',
        properties: {
          page: { type: 'string', enum: Object.keys(PUBLIC_PAGES) },
        },
        required: ['page'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const page = String(input.page) as keyof typeof PUBLIC_PAGES;
        const path = PUBLIC_PAGES[page];
        if (!path) throw new Error('Unsupported public page.');
        window.location.assign(path);
        return { content: [{ type: 'text', text: `Opening ${path}` }] };
      },
    },
  ];

  for (const tool of tools) {
    void context.registerTool(tool, { signal: controller.signal }).catch(() => {
      // Experimental browsers can reject registration when the feature is disabled.
    });
  }
}
