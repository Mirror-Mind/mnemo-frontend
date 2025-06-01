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
        MATCH (user:User {user_id: $userId})
        OPTIONAL MATCH path = (user)-[*1..2]-(connected)
        WHERE connected <> user
        UNWIND relationships(path) as rel
        UNWIND nodes(path) as node
        RETURN DISTINCT user, node, rel, startNode(rel) as source, endNode(rel) as target
        `,
        { userId }
      );

      const nodes: any[] = [];
      const links: any[] = [];
      const nodeIds = new Set();
      const linkIds = new Set();

      result.records.forEach(record => {
        const user = record.get('user');
        const node = record.get('node');
        const relationship = record.get('rel');
        const source = record.get('source');
        const target = record.get('target');

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

        // Add any connected node
        if (node && node.identity) {
          const nodeId = node.identity.toString();
          if (!nodeIds.has(nodeId)) {
            const nodeType = node.labels.includes('User') ? 'user' : 'memory';
            const nodeName = nodeType === 'user' 
              ? `User: ${node.properties.user_id || nodeId}`
              : node.properties.content || node.properties.name || 'Memory';
            
            nodes.push({
              id: nodeId,
              name: nodeName,
              type: nodeType,
              properties: node.properties
            });
            nodeIds.add(nodeId);
          }
        }

        // Add relationships
        if (relationship && source && target) {
          const sourceId = source.labels.includes('User') 
            ? source.properties.user_id 
            : source.identity.toString();
          const targetId = target.labels.includes('User') 
            ? target.properties.user_id 
            : target.identity.toString();
          
          const linkId = `${sourceId}-${targetId}-${relationship.type}`;
          if (!linkIds.has(linkId)) {
            links.push({
              source: sourceId,
              target: targetId,
              type: relationship.type || 'CONNECTED'
            });
            linkIds.add(linkId);
          }
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