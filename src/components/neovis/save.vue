<script>
import NeoVis from 'neovis.js';
import $ from 'jquery';
export default {
  data() {
    return {
      viz: null,
      config: {
        containerId: "viz",
        neo4j: {
          serverUrl: "bolt://localhost:7687", // 确保协议和端口正确
          serverUser: "neo4j",               // 与 Neo4j 用户名一致
          serverPassword: "123456789",       // 与 Neo4j 密码一致
          driverConfig: {
            encrypted: "ENCRYPTION_OFF"      // 测试环境关闭加密
          }
        },
        labels: {
          "Entity": {
            label: "name",
            size: "pagerank"
          }
        },
        relationships: {
          "DISTANCE": {
            thickness: "weight",
            caption: true
          }
        },
        initialCypher: "MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 50"
      }
    };
  },
  async mounted() {
    try {
      const driver = await this.createDriver();
      const result = await driver.exeuteQuery("MATCH (n)-[r]->(m) RETURN n, r, m");
      // ... 数据转换逻辑 ...
      this.viz = new NeoVis(this.config);
      this.viz.render();
    } catch (error) {
      console.error("Neo4j连接失败:", error);
      alert(`数据库连接失败：${error.message}`);
    }
  },
  methods: {
    createDriver() {
      return neo4j.driver(
          this.config.neo4j.serverUrl,
          neo4j.auth.basic(
              this.config.neo4j.serverUser,
              this.config.neo4j.serverPassword
          ),
          this.config.neo4j.driverConfig
      );
    }
  },
  beforeUnmount() {
    if (this.viz) this.viz.destroy();
  }
};
</script>