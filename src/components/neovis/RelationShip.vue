//neovis.js渲染不上动态关系  -----做了很多试验，neovis.js版本太旧（且不更新维护了），匹配不上neo4j-driver版本**
//RelationShip.vue:742 NeoVis 初始化失败: TypeError: Private element is not present on this object
//改用echarts方式
<template>
  <div id="app">
    <!-- 查询关系类型的按钮 -->
    <button @click="fetchAndDraw">查询关系并绘制图</button>

    <!-- 关系类型选择器 -->
    <select v-model="selectedRelationshipType" @change="drawGraph">
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
import NeoVis from 'neovis.js';

export default {
  name: 'GraphVisualization',
  setup() {
    const relationshipTypes = ref([]); // 存储关系类型
    const errorMessage = ref(''); // 存储错误信息
    const viz = ref(null); // 存储 NeoVis 实例
    const neo4jDriver = inject('$neo4j'); // 注入 Neo4j 驱动
    const selectedRelationshipType = ref(''); // 当前选中的关系类型

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

    /**
     * 查询数据库中的关系类型并初始化可视化
     */
    const fetchAndDraw = async () => {
      // 重置状态
      relationshipTypes.value = [];
      errorMessage.value = '';
      selectedRelationshipType.value = ''; // 重置选择器
      if (viz.value) {
        viz.value.destroy(); // 销毁之前的 NeoVis 实例
      }

      if (!neo4jDriver) {
        errorMessage.value = 'Neo4j 驱动未初始化！';
        console.error(errorMessage.value);
        return;
      }

      const session = neo4jDriver.session();
      try {
        // 执行 Cypher 查询获取所有关系类型
        const result = await session.run('MATCH ()-[r]->() RETURN DISTINCT type(r) AS type');
        relationshipTypes.value = result.records.map(record => record.get('type').toString());

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
      await nextTick(); // 确保 DOM 元素已渲染

      const viz1 = document.getElementById('viz1');
      if (!viz1) {
        console.error('DOM 元素未找到！');
        errorMessage.value = '图可视化容器未找到！';
        return;
      }

      // 动态生成关系颜色配置
      const relationshipConfig = relationshipTypes.value.reduce((acc, type) => {
        acc[type] = {
          caption: true, // 显示关系的 caption（默认显示 type 属性）
          thickness: 'weight', // 关系线的粗细基于 weight 属性
          font: { size: 12, color: '#5073FF' }, // 关系文字样式
          color: relationshipColorMap[type] || relationshipColorMap['默认'], // 使用颜色映射或默认颜色
        };
        return acc;
      }, {});

      // NeoVis 配置对象
      const config = {
        containerId: 'viz1', // 容器 ID
        neo4j: {
          serverUrl: 'bolt://localhost:7687', // Neo4j 服务器地址
          serverUser: 'neo4j', // 用户名
          serverPassword: '123456789', // 密码
        },
        labels: {
          Entity: {
            caption: 'name', // 显示节点的 name 属性
            size: 25, // 节点大小
            font: { size: 16, color: '#99FF00' }, // 节点文字样式
          },
        },
        relationships: relationshipConfig, // 动态设置所有关系类型
        arrows: true, // 显示箭头
        hierarchical: false, // 禁用分层布局
        initialCypher: relationshipType
            ? `MATCH (n)-[r:${relationshipType}]->(m) RETURN n, r, m LIMIT 100`
            : 'MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 100', // 查询语句
        style: {
          height: '100%', // 容器高度
          width: '100%', // 容器宽度
        },
      };

      try {
        // 初始化 NeoVis 实例
        viz.value = new NeoVis(config);
        await viz.value.render(); // 渲染图
        console.log('NeoVis 初始化并渲染成功');

        // 添加事件监听器
        const visInstance = viz.value._visInstance;
        if (visInstance && visInstance.on) {
          // 鼠标悬停关系时触发
          visInstance.on('hoverLink', (event) => {
            const edge = event.target;
            if (edge) {
              const relationshipType = edge.data.relationship.type;
              const sourceNode = edge.data.relationship.start;
              const targetNode = edge.data.relationship.end;
              console.log('悬停的关系:', { type: relationshipType, source: sourceNode, target: targetNode });
            }
          });

          // 点击节点时触发
          visInstance.on('clickNode', (event) => {
            const node = event.nodes[0];
            if (node) {
              console.log('点击的节点:', node);
            }
          });

          // 点击关系时触发
          visInstance.on('clickLink', (event) => {
            const edge = event.edges[0];
            if (edge) {
              console.log('点击的关系:', edge.data.relationship);
            }
          });
        } else {
          console.error('无法访问 NeoVis 的 _visInstance 或事件监听方法不可用');
        }
      } catch (error) {
        console.error('NeoVis 初始化失败:', error);
        errorMessage.value = `NeoVis 初始化失败: ${error.message}`;
      }
    };

    // 生命周期钩子，在组件挂载时执行
    onMounted(() => {
      // 页面加载时可以选择是否自动调用 fetchAndDraw
      // 如果需要，取消下面的注释
      // await fetchAndDraw();
    });

    return {
      relationshipTypes,
      errorMessage,
      selectedRelationshipType,
      fetchAndDraw,
      drawGraph,
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
  font-size: 14px;
}
</style>
