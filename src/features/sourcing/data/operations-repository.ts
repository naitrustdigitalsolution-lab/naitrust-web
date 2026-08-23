import { getUserData } from '../../../libs/api/config';
import type { OperationsDatabase } from '../domain/types';
import mockOperationsSeedFixture from '../../../mocks/operations/operations-database.json';

const STORAGE_KEY = 'naitrust:operations-database:v2';
export const OPERATIONS_CHANGED_EVENT = 'naitrust:operations-database-changed';

function cloneSeed(): OperationsDatabase {
  const database = JSON.parse(JSON.stringify(mockOperationsSeedFixture)) as OperationsDatabase;
  if (database.agents.length >= 50 || database.agents.length === 0) return database;

  const cities = ['Guangzhou', 'Shenzhen', 'Yiwu', 'Foshan', 'Dongguan', 'Ningbo', 'Shanghai', 'Hangzhou', 'Quanzhou', 'Xiamen'];
  const categories = ['Consumer electronics', 'Fashion and textiles', 'Furniture', 'Beauty packaging', 'Machinery', 'Homeware', 'Auto parts', 'Custom manufacturing'];
  const firstNames = ['Ada', 'Chidi', 'Tola', 'Ifeoma', 'Emeka', 'Zainab', 'Kunle', 'Amaka', 'David', 'Bisi'];
  const surnames = ['Okafor', 'Adebayo', 'Eze', 'Balogun', 'Ibrahim'];
  const originalAgents = [...database.agents];

  while (database.agents.length < 50) {
    const index = database.agents.length;
    const template = originalAgents[index % originalAgents.length];
    const city = cities[index % cities.length];
    const isCompany = index % 3 === 0;
    const name = `${firstNames[index % firstNames.length]} ${surnames[index % surnames.length]}`;
    database.agents.push({
      ...template,
      id: `mock-agent-${String(index + 1).padStart(2, '0')}`,
      name,
      profileType: isCompany ? 'company' : 'individual',
      businessName: isCompany ? `${city} Bridge Sourcing ${index + 1}` : undefined,
      city,
      secondaryCities: [cities[(index + 1) % cities.length], cities[(index + 2) % cities.length]],
      expertise: [categories[index % categories.length], categories[(index + 3) % categories.length]],
      yearsBasedInChina: 3 + (index % 12),
      rating: Number((4.2 + (index % 8) / 10).toFixed(1)),
      completedTasks: 18 + index * 3,
      responseMinutes: 75 + (index % 10) * 35,
      available: index % 7 !== 0,
      verificationSummary: isCompany
        ? `Registered sourcing business with a verified representative, China operating address and evidence-review process.`
        : `Identity, China location and sourcing work history reviewed by Naitrust operations.`,
    });
  }
  return database;
}

function readDatabase(): OperationsDatabase {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return writeDatabase(cloneSeed(), false);
    const parsed = JSON.parse(value) as OperationsDatabase;
    if (parsed.version !== 2) return writeDatabase(cloneSeed(), false);
    // Keep user-created operations data while refreshing curated profile
    // fields. Agent-controlled availability from storage is preserved.
    const seed = cloneSeed();
    const seedAgentIds = new Set(seed.agents.map((agent) => agent.id));
    const mergedAgents = seed.agents.map((seedAgent) => {
      const storedAgent = parsed.agents.find((agent) => agent.id === seedAgent.id);
      return storedAgent
        ? { ...seedAgent, ...storedAgent, secondaryCities: storedAgent.secondaryCities ?? seedAgent.secondaryCities, availabilitySetBy: 'agent' as const }
        : seedAgent;
    });
    const userCreatedAgents = parsed.agents
      .filter((agent) => !seedAgentIds.has(agent.id))
      .map((agent) => ({
        ...agent,
        secondaryCities: agent.secondaryCities ?? ['Not set', 'Not set'],
        availabilitySetBy: 'agent' as const,
      }));
    const currentOwnerId = getUserData()?.id;
    const seededAssignments = parsed.assignments.length ? parsed.assignments : seed.assignments.map((assignment) => ({ ...assignment, ownerUserId: currentOwnerId ?? assignment.ownerUserId }));
    return writeDatabase({ ...parsed, agents: [...mergedAgents, ...userCreatedAgents], assignments: seededAssignments }, false);
  } catch {
    return writeDatabase(cloneSeed(), false);
  }
}

function writeDatabase(database: OperationsDatabase, notify = true): OperationsDatabase {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(database));
  if (notify) window.dispatchEvent(new CustomEvent(OPERATIONS_CHANGED_EVENT));
  return database;
}

function principal() {
  const user = getUserData();
  if (!user?.id) throw new Error('Sign in to continue.');
  return user;
}

function assertAdmin() {
  const user = principal();
  if (user.role !== 'admin') throw new Error('Admin access required.');
  return user;
}

export const operationsRepository = {
  read: readDatabase,
  mutate: (updater: (database: OperationsDatabase) => OperationsDatabase) => writeDatabase(updater(readDatabase())),
  principal,
  assertAdmin,
  resetMockData: () => writeDatabase(cloneSeed()),
};
