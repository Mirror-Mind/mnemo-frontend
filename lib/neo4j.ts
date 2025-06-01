import neo4j, { Driver, Session } from 'neo4j-driver';

class Neo4jService {
  private driver: Driver;

  constructor() {
    this.driver = neo4j.driver(
      'neo4j+s://eb740439.databases.neo4j.io',
      neo4j.auth.basic('neo4j', 'BTSKmUmTYKiVt4quQj8buoFm2Rj-yJymVJTiYFDDydM'),
      {
        connectionAcquisitionTimeout: 30000,
        connectionTimeout: 20000,
        maxConnectionLifetime: 30000,
      }
    );
  }

  async getSession(): Promise<Session> {
    return this.driver.session();
  }

  async getMemoryGraphForUser(userId: string) {
    const session = await this.getSession();
    try {
      const result = await session.run(
        `
        MATCH (user:User {user_id: $userId})-[:HAS_MEMORY]->(memory:Memory)
        OPTIONAL MATCH (memory)-[r:RELATES_TO]->(related:Memory)
        RETURN user, memory, r, related
        `,
        { userId }
      );

      const nodes: any[] = [];
      const links: any[] = [];
      const nodeIds = new Set();

      result.records.forEach(record => {
        const user = record.get('user');
        const memory = record.get('memory');
        const relationship = record.get('r');
        const related = record.get('related');

        // Add user node
        if (user && !nodeIds.has(user.properties.user_id)) {
          nodes.push({
            id: user.properties.user_id,
            name: `User: ${user.properties.user_id}`,
            type: 'user',
            properties: user.properties
          });
          nodeIds.add(user.properties.user_id);
        }

        // Add memory node
        if (memory && !nodeIds.has(memory.identity.toString())) {
          nodes.push({
            id: memory.identity.toString(),
            name: memory.properties.content || 'Memory',
            type: 'memory',
            properties: memory.properties
          });
          nodeIds.add(memory.identity.toString());
        }

        // Add related memory node
        if (related && !nodeIds.has(related.identity.toString())) {
          nodes.push({
            id: related.identity.toString(),
            name: related.properties.content || 'Related Memory',
            type: 'memory',
            properties: related.properties
          });
          nodeIds.add(related.identity.toString());
        }

        // Add user-to-memory relationship
        if (user && memory) {
          links.push({
            source: user.properties.user_id,
            target: memory.identity.toString(),
            type: 'HAS_MEMORY'
          });
        }

        // Add memory-to-memory relationship
        if (memory && related && relationship) {
          links.push({
            source: memory.identity.toString(),
            target: related.identity.toString(),
            type: relationship.type || 'RELATES_TO'
          });
        }
      });

      return { nodes, links };
    } finally {
      await session.close();
    }
  }

  async close() {
    await this.driver.close();
  }
}

export const neo4jService = new Neo4jService(); 