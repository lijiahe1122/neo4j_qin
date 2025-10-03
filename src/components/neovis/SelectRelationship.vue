
//neo4j-driver：官方提供的 Neo4j 数据库驱动，用于直接连接 Neo4j 数据库，执行 Cypher 查询，并处理返回的原始数据（如节点、关系等）。
//neovis.js:基于 neo4j-driver 的可视化库，将查询结果转换为交互式图形（如节点-关系图）;

<template>
  <div id="app">
    <button @click="fetchRelationshipTypes">查询关系类型</button>
    <ul v-if="relationshipTypes.length > 0">
      <li v-for="type in relationshipTypes" :key="type">{{ type }}</li>
    </ul>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { inject, ref } from 'vue';

export default {
  name: 'RelationshipQuery',
  setup() {
    // 响应式数据
    const relationshipTypes = ref([]);
    const errorMessage = ref('');

    // 注入 Neo4j 驱动（确保在根组件中已通过 app.provide 注入）
    const neo4jDriver = inject('$neo4j');

    const fetchRelationshipTypes = async () => {
      // 重置状态
      relationshipTypes.value = [];
      errorMessage.value = '';

      if (!neo4jDriver) {
        errorMessage.value = 'Neo4j 驱动未初始化！';
        return;
      }

      const session = neo4jDriver.session();
      try {
        // 执行 Cypher 查询（v4.x+ 使用 session.run）
        const result = await session.run(
            'MATCH ()-[r]->() RETURN DISTINCT type(r) AS type'
        );

        // 处理结果集
        relationshipTypes.value = result.records.map(record =>
            record.get('type').toString()
        );
      } catch (error) {
        console.error('查询失败:', error);
        errorMessage.value = `查询失败: ${error.message}`;
      } finally {
        // 确保会话关闭
        await session.close();
      }
    };

    return {
      relationshipTypes,
      errorMessage,
      fetchRelationshipTypes
    };
  }
};
</script>

<style scoped>
button {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #66b1ff;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 4px 8px;
  margin: 4px 0;
  background: #f5f7fa;
  border-radius: 4px;
}
</style>