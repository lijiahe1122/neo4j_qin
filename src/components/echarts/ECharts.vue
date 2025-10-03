
<template>
  <div id="app">
    <!-- 查询关系类型的按钮 -->
    <button @click="fetchAndDraw">查询关系并绘制图</button>

    <!-- 关系类型选择器 -->
    <select v-model="selectedRelationshipType" @change="drawGraph(selectedRelationshipType)">
      <option value="">请选择关系类型</option>
      <option v-for="type in relationshipTypes" :key="type" :value="type">{{ type }}</option>
    </select>

    <!-- 关系类型列表 -->
    <ul v-if="relationshipTypes.length > 0">
      <li v-for="type in relationshipTypes" :key="type">{{ type }}</li>
    </ul>

    <!-- 图可视化容器 -->
    <div id="viz1" ref="viz1" class="viz-container"></div>

    <!-- 错误信息提示 -->
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
  </div>
</template>

<script>
import { inject, ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts'; // 引入 ECharts
import { Neo4jDriver } from 'neo4j-driver'; // 如果需要直接使用 Neo4j 驱动

export default {
  name: 'GraphVisualization',
  setup() {
    const relationshipTypes = ref([]); // 存储关系类型
    const errorMessage = ref(''); // 存储错误信息
    const viz = ref(null); // 存储 ECharts 实例
    const neo4jDriver = inject('$neo4j'); // 注入 Neo4j 驱动
    const selectedRelationshipType = ref(''); // 当前选中的关系类型

    /**
     * 查询数据库中的关系类型并初始化可视化
     */
    const fetchAndDraw = async () => {
      // 重置状态
      relationshipTypes.value = [];
      errorMessage.value = '';
      selectedRelationshipType.value = ''; // 重置选择器
      if (viz.value) {
        viz.value.dispose(); // 销毁之前的 ECharts 实例
      }

      if (!neo4jDriver) {
        errorMessage.value = 'Neo4j 驱动未初始化！';
        console.error(errorMessage.value);
        return;
      }

      const session = neo4jDriver.session();
      try {
        // 执行 Cypher 查询获取所有关系类型
        const result = await session.run(
            'MATCH ()-[r]->() RETURN DISTINCT type(r) AS type'
        );
        relationshipTypes.value = result.records.map(record =>
            record.get('type').toString()
        );

        // 如果有查询结果，绘制图
        if (relationshipTypes.value.length > 0) {
          // 如果没有选中类型，默认绘制第一个关系类型
          if (!selectedRelationshipType.value) {
            selectedRelationshipType.value = relationshipTypes.value[0];
          }
          await drawGraph(selectedRelationshipType.value);
        } else {
          console.warn('未查询到任何关系类型！');
          errorMessage.value = '未查询到任何关系类型！';
        }
      } catch (error) {
        console.error('查询失败:', error);
        errorMessage.value = `查询失败: ${error.message}`;
      } finally {
        await session.close();
      }
    };

    /**
     * 根据选定的关系类型绘制图
     * @param {string} relationshipType - 要绘制的关系类型
     */
    const drawGraph = async (relationshipType) => {
      // 确保 DOM 元素已渲染
      await nextTick();

      const viz1 = document.getElementById('viz1');
      if (!viz1) {
        console.error('DOM 元素未找到！');
        errorMessage.value = '图可视化容器未找到！';
        return;
      }

      // 初始化 ECharts 实例
      viz.value = echarts.init(viz1);

      // 查询关系数据
      const session = neo4jDriver.session();
      try {
        const cypherQuery = relationshipType
            ? `MATCH (n)-[r:${relationshipType}]->(m) RETURN n.name AS source, m.name AS target, r.type AS type, r.weight AS weight LIMIT 100`
            : 'MATCH (n)-[r]->(m) RETURN n.name AS source, m.name AS target, r.type AS type, r.weight AS weight LIMIT 100';

        const result = await session.run(cypherQuery);
        const data = result.records.map(record => ({
          source: record.get('source'),
          target: record.get('target'),
          type: record.get('type'),
          weight: record.get('weight') || 1, // 默认权重为 1
        }));

        // 构建 ECharts 的 graph 数据
        const graphData = {
          nodes: [...new Set(data.flatMap(d => [d.source, d.target]))].map(name => ({ name })),
          links: data.map(d => ({
            source: d.source,
            target: d.target,
            type: d.type,
            weight: d.weight,
          })),
        };

        // 配置 ECharts
        const option = {
          title: {
            text: `关系图 - ${relationshipType || '全部关系'}`,
            left: 'center',
          },
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
              if (params.dataType === 'edge') {
                return `关系类型: ${params.data.type}<br/>权重: ${params.data.weight}`;
              } else {
                return `节点: ${params.name}`;
              }
            },
          },
          series: [
            {
              type: 'graph',
              layout: 'force', // 力导向布局
              force: {
                repulsion: 100, // 节点之间的排斥力
                edgeLength: 100, // 边的长度
              },
              roam: true, // 允许缩放和平移
              label: {
                show: true,
                position: 'right',
                formatter: '{b}', // 显示节点名称
              },
              data: graphData.nodes,
              links: graphData.links,
              emphasis: {
                focus: 'adjacency',
                lineStyle: {
                  width: (params) => params.data.weight * 2, // 根据权重调整边的宽度
                },
              },
              lineStyle: {
                color: (params) => {
                  // 根据关系类型设置颜色
                  return relationshipColorMap[params.data.type] || '#5073FF';
                },
                width: 2,
                curveness: 0.3,
              },
            },
          ],
        };

        // 设置配置并渲染图表
        viz.value.setOption(option);
        console.log('ECharts 图表渲染成功');

      } catch (error) {
        console.error('查询或渲染失败:', error);
        errorMessage.value = `查询或渲染失败: ${error.message}`;
      } finally {
        await session.close();
      }
    };

    // 定义关系颜色映射
    const relationshipColorMap = {
      "亲属关系": "#FFE66D",
      "军事行动": "#4ECDC4",
      "外交事件": "#FF6B6B",
      "制度改革": "#6B5B95",
      "父亲": "#4ECDC4",
      "儿子": "#FFE66D",
      "默认": "#5073FF"
    };

    // 生命周期钩子，在组件挂载时执行
    onMounted(() => {
      // 页面加载时可以选择是否自动调用 fetchAndDraw
      // 如果需要，取消下面的注释
      // fetchAndDraw();
    });

    return {
      relationshipTypes,
      errorMessage,
      selectedRelationshipType,
      fetchAndDraw,
      drawGraph, // 虽然 drawGraph 被 fetchAndDraw 调用，但保留以供未来扩展
    };
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.viz-container {
  width: 80%; /* 容器宽度为视口宽度的 80% */
  height: 60vh; /* 容器高度为视口高度的 60% */
  min-width: 800px; /* 最小宽度 */
  max-width: 1200px; /* 最大宽度 */
  min-height: 400px; /* 最小高度 */
  margin: 20px auto; /* 居中 */
  border: 1px solid #ccc; /* 可选：添加边框 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 可选：添加阴影 */
}

button {
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 10px;
}

button:hover {
  background: #66b1ff;
}

select {
  padding: 8px 16px;
  background: #ffffff;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 10px 0;
}

li {
  padding: 4px 8px;
  margin: 4px 0;
  background: #f5f7fa;
  border-radius: 4px;
  display: inline-block;
  margin-right: 10px;
}

/* 图可视化容器样式 */
#viz1 {
  width: 100%;
  height: 100%;
}

/* 错误信息提示 */
p {
  margin-top: 10px;
}
</style>