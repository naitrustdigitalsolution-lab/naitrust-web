import { getUserData } from '../../../libs/api/config';
import type { OperationsDatabase } from '../domain/types';
import mockOperationsSeedFixture from '../../../mocks/operations/operations-database.json';

const STORAGE_KEY = 'naitrust:operations-database:v2';
export const OPERATIONS_CHANGED_EVENT = 'naitrust:operations-database-changed';

function cloneSeed(): OperationsDatabase {
  return JSON.parse(JSON.stringify(mockOperationsSeedFixture)) as OperationsDatabase;
}

function readDatabase(): OperationsDatabase {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return writeDatabase(cloneSeed(), false);
    const parsed = JSON.parse(value) as OperationsDatabase;
    return parsed.version === 2 ? parsed : writeDatabase(cloneSeed(), false);
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
