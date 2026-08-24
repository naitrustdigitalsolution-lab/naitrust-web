export interface AgentReview {
  id: string;
  agentId: string;
  authorId: string;
  authorName: string;
  rating: number;
  body: string;
  createdAt: string;
  reply?: { body: string; createdAt: string };
}

const STORAGE_KEY = 'naitrust:agent-reviews:v1';

const seedNames = ['Amara Okafor', 'Tunde Bello', 'Chioma Eze', 'David Mensah', 'Aisha Ibrahim', 'Kemi Adeyemi', 'Ikenna Obi'];
const seedBodies = [
  'Clear communication throughout the supplier search. The options were well explained and easy to compare.',
  'The agent asked useful questions about our specification before contacting suppliers and kept the order organised.',
  'Good local knowledge and responsive updates. Inspection evidence was presented clearly.',
  'Helpful with supplier verification and explaining which claims still needed confirmation.',
  'Professional and realistic about lead times. We always knew what the next decision was.',
  'Strong attention to product details and packaging requirements. The final report was easy to understand.',
  'The sourcing process was transparent and the agent responded quickly when our requirements changed.',
];

function readAll(): AgentReview[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as AgentReview[];
  } catch {
    return [];
  }
}

function writeAll(reviews: AgentReview[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function seededReviews(agentId: string): AgentReview[] {
  return seedBodies.map((body, index) => ({
    id: `seed-${agentId}-${index}`,
    agentId,
    authorId: `seed-reviewer-${index}`,
    authorName: seedNames[index],
    rating: index === 3 ? 4 : 5,
    body,
    createdAt: new Date(Date.now() - (index + 1) * 12 * 24 * 60 * 60 * 1000).toISOString(),
    reply: index === 1 ? { body: 'Thank you. I appreciate the clear brief and look forward to supporting your next order.', createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString() } : undefined,
  }));
}

export const agentReviewsApi = {
  list(agentId: string): AgentReview[] {
    const stored = readAll().filter((review) => review.agentId === agentId);
    const storedIds = new Set(stored.map((review) => review.id));
    return [...stored, ...seededReviews(agentId).filter((review) => !storedIds.has(review.id))].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  },

  add(input: { agentId: string; authorId: string; authorName: string; rating: number; body: string }): AgentReview {
    if (input.authorId === input.agentId) throw new Error('You cannot review your own sourcing profile.');
    if (!input.body.trim()) throw new Error('Write a short review before submitting.');
    const review: AgentReview = {
      id: `agent-review-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      agentId: input.agentId,
      authorId: input.authorId,
      authorName: input.authorName,
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      body: input.body.trim(),
      createdAt: new Date().toISOString(),
    };
    writeAll([review, ...readAll()]);
    return review;
  },

  reply(input: { agentId: string; reviewId: string; actorId: string; body: string }) {
    if (input.actorId !== input.agentId) throw new Error('Only this sourcing agent can reply to their reviews.');
    if (!input.body.trim()) throw new Error('Write a reply before publishing.');
    const reviews = readAll();
    const storedReview = reviews.find((item) => item.id === input.reviewId && item.agentId === input.agentId);
    const review = storedReview ?? seededReviews(input.agentId).find((item) => item.id === input.reviewId);
    if (!review) throw new Error('Review not found.');
    if (review.reply) throw new Error('This review already has a reply.');
    const replied = { ...review, reply: { body: input.body.trim(), createdAt: new Date().toISOString() } };
    writeAll(storedReview ? reviews.map((item) => item.id === review.id ? replied : item) : [replied, ...reviews]);
  },
};
