//neovis.js不支持inject('$neo4j');驱动
//小用例测试，仅包含驱动注入和查询的纯测试组件

<!--&lt;!&ndash; TestComponent.vue &ndash;&gt;-->
<!--<script setup>-->
<!--import { onMounted, inject } from 'vue';-->
<!--import neo4j from 'neo4j-driver';-->

<!--const neo4jDriver = inject('$neo4j');-->

<!--onMounted(async () => {-->
<!--  try {-->
<!--    const session = neo4jDriver.session();-->
<!--    await session.run("MATCH (n) RETURN n LIMIT 1");-->
<!--    console.log('测试查询成功');-->
<!--  } catch (err) {-->
<!--    console.error('测试查询失败:', err);-->
<!--  }-->
<!--});-->
<!--</script>-->


<!-- NeoVisComponent.vue -->
<!--<template>-->
<!--  <div class="container">-->
<!--    &lt;!&ndash; 确保容器 ID 与 config 中的 containerId 一致 &ndash;&gt;-->
<!--    <div ref="vizContainer" class="viz-container"></div>-->
<!--    <div v-if="isLoading">Loading...</div>-->
<!--    <div v-if="error" class="error">{{ error }}</div>-->
<!--  </div>-->
<!--</template>-->



<!-- inject.vue -->
<script setup>
import { onMounted, inject, ref } from 'vue';
import NeoVis from 'neovis.js';

const isLoading = ref(true);
const error = ref(null);
const neo4jDriver = inject('$neo4j'); // 确保键名正确

onMounted(async () => {
  try {
    if (!neo4jDriver) {
      throw new Error('Neo4j 驱动未注入！');
    }

    // 验证驱动状态
    const session = neo4jDriver.session();
    await session.run("MATCH (n) RETURN n LIMIT 1");
    session.close();

    // 初始化 NeoVis
    const viz = new NeoVis({ containerId: 'viz1' });
    await viz.renderWithCypher(neo4jDriver, "MATCH (n) RETURN n");

    isLoading.value = false;
  } catch (err) {
    console.error('完整错误堆栈:', err);
    error.value = `可视化失败: ${err.message}`;
    isLoading.value = false;
  }
});
</script>
//得出结论
//NeoVis 的版本兼容性
//现象：neovis.js@2.0.0 可能与 neo4j-driver@5.28.1 存在兼容性问题。