import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

/**
 * Small JSON-file store. Writes are serialised and atomic (write a temp file, then rename),
 * so records survive restarts. In the proposed AWS deployment this is replaced by DynamoDB.
 */
export function createStore(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, 'db.json');
  const empty = { settings: { firmName: '' }, shipments: [], leads: [] };
  let state;
  try {
    state = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    state = structuredClone(empty);
  }
  for (const k of Object.keys(empty)) if (state[k] === undefined) state[k] = structuredClone(empty[k]);

  let queue = Promise.resolve();
  function persist() {
    const snapshot = JSON.stringify(state, null, 2);
    queue = queue.then(async () => {
      const tmp = `${file}.${process.pid}.tmp`;
      await fsp.writeFile(tmp, snapshot);
      await fsp.rename(tmp, file);
    });
    return queue;
  }

  return {
    file,
    read: () => state,
    async mutate(fn) {
      const result = fn(state);
      await persist();
      return result;
    },
    flush: () => queue,
  };
}
