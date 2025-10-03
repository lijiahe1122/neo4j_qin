<!--<template>-->
<!--  <div style="min-height: 500px;width: 1200px;margin: 0 auto">-->
<!--    <div id="viz1" ref="viz1" style="height: 500px;"></div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { inject, ref, onMounted, nextTick } from 'vue';-->
<!--import * as echarts from 'echarts';-->

<!--export default {-->
<!--  name: 'GraphVisualization',-->
<!--  setup() {-->
<!--    const viz1 = ref(null);-->
<!--    const errorMessage = ref('');-->
<!--    const neo4jDriver = inject('$neo4j'); // 注入 Neo4j 驱动-->

<!--    const draw = async () => {-->
<!--      await nextTick();-->
<!--      const vizElement = viz1.value;-->
<!--      if (!vizElement) {-->
<!--        console.error('DOM element is not mounted yet!');-->
<!--        errorMessage.value = 'DOM element is not mounted yet!';-->
<!--        return;-->
<!--      }-->

<!--      if (!neo4jDriver) {-->
<!--        errorMessage.value = 'Neo4j 驱动未初始化！';-->
<!--        console.error(errorMessage.value);-->
<!--        return;-->
<!--      }-->

<!--      const session = neo4jDriver.session();-->
<!--      try {-->
<!--        const result = await session.run('MATCH (n)-[r]->(m) RETURN n, r, m');-->
<!--        const data = result.records.map(record => {-->
<!--          const source = record.get('n').properties.name;-->
<!--          const target = record.get('m').properties.name;-->
<!--          const type = record.get('r').type;-->
<!--          const weight = record.get('r').properties.weight || 1;-->
<!--          return { source, target, type, weight };-->
<!--        });-->

<!--        const graphData = {-->
<!--          nodes: [...new Set(data.flatMap(d => [d.source, d.target]))].map(name => ({ name })),-->
<!--          links: data.map(d => ({-->
<!--            source: d.source,-->
<!--            target: d.target,-->
<!--            type: d.type,-->
<!--            weight: d.weight,-->
<!--          })),-->
<!--        };-->

<!--        const option = {-->
<!--          title: {-->
<!--            text: 'Neo4j 关系图',-->
<!--            left: 'center',-->
<!--          },-->
<!--          tooltip: {-->
<!--            trigger: 'item',-->
<!--            formatter: (params) => {-->
<!--              if (params.dataType === 'edge') {-->
<!--                return `关系类型: ${params.data.type}<br/>权重: ${params.data.weight}`;-->
<!--              } else {-->
<!--                return `节点: ${params.name}`;-->
<!--              }-->
<!--            },-->
<!--          },-->
<!--          series: [-->
<!--            {-->
<!--              type: 'graph',-->
<!--              layout: 'force',-->
<!--              force: {-->
<!--                repulsion: 100,-->
<!--                edgeLength: 100,-->
<!--              },-->
<!--              roam: true,-->
<!--              label: {-->
<!--                show: true,-->
<!--                position: 'right',-->
<!--                formatter: '{b}',-->
<!--              },-->
<!--              data: graphData.nodes,-->
<!--              links: graphData.links,-->
<!--              emphasis: {-->
<!--                focus: 'adjacency',-->
<!--                lineStyle: {-->
<!--                  width: (params) => params.data.weight * 2,-->
<!--                },-->
<!--              },-->
<!--              lineStyle: {-->
<!--                color: (params) => {-->
<!--                  return '#5073FF';-->
<!--                },-->
<!--                width: 2,-->
<!--                curveness: 0.3,-->
<!--              },-->
<!--            },-->
<!--          ],-->
<!--        };-->

<!--        const chart = echarts.init(vizElement);-->
<!--        chart.setOption(option);-->
<!--        console.log('ECharts 图表渲染成功');-->
<!--      } catch (error) {-->
<!--        console.error('查询或渲染失败:', error);-->
<!--        errorMessage.value = `查询或渲染失败: ${error.message}`;-->
<!--      } finally {-->
<!--        await session.close();-->
<!--      }-->
<!--    };-->

<!--    onMounted(() => {-->
<!--      draw();-->
<!--    });-->

<!--    return {-->
<!--      viz1,-->
<!--      errorMessage,-->
<!--    };-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style>-->
<!--.content {-->
<!--  display: flex;-->
<!--  flex-direction: column;-->
<!--  align-items: center;-->
<!--  justify-content: center;-->
<!--  height: 100vh;-->
<!--}-->
<!--.left {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--}-->
<!--</style>-->

<template>
  <div style="min-height: 500px;width: 1200px;margin: 0 auto">
    <div  id="viz1" ref="viz1" style="height: 500px;"></div>
  </div>
</template>

<script>
import { inject, ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';

export default {
  name: 'GraphVisualization',
  setup() {
    const viz1 = ref(null);
    const errorMessage = ref('');
    const neo4jDriver = inject('$neo4j'); // 注入 Neo4j 驱动

    const draw = async () => {
      await nextTick();
      const vizElement = viz1.value;
      if (!vizElement) {
        console.error('DOM element is not mounted yet!');
        errorMessage.value = 'DOM element is not mounted yet!';
        return;
      }

      if (!neo4jDriver) {
        errorMessage.value = 'Neo4j 驱动未初始化！';
        console.error(errorMessage.value);
        return;
      }

      const session = neo4jDriver.session();
      try {
        const result = await session.run('MATCH (n)-[r]->(m) RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight');
        const data = result.records.map(record => ({
          source: record.get('source'),
          target: record.get('target'),
          type: record.get('type'),
          weight: record.get('weight') || 1,
        }));

        const graphData = {
          nodes: [...new Set(data.flatMap(d => [d.source, d.target]))].map(name => ({ name })),
          links: data.map(d => ({
            source: d.source,
            target: d.target,
            type: d.type,
            weight: d.weight,
          })),
        };

        const option = {
          title: {
            text: 'Neo4j 关系图',
            left: 'center',
          },
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
              if (params.dataType === 'edge') {
                return `源节点: ${params.data.source}<br/>目标节点: ${params.data.target}<br/>关系类型: ${params.data.type}`;
              } else {
                return `节点: ${params.name}`;
              }
            },
          },
          series: [
            {
              type: 'graph',
              layout: 'force',
              force: {
                repulsion: 100,
                edgeLength: 100,
              },
              roam: true,
              draggable: true,
              label: {
                show: true,
                position: 'right',
                formatter: '{b}',
              },
              data: graphData.nodes,
              links: graphData.links,
              emphasis: {
                focus: 'adjacency',
                lineStyle: {
                  width: (params) => params.data.weight * 2,
                },
              },
              lineStyle: {
                color: (params) => {
                  return '#5073FF';
                },
                width: 2,
                curveness: 0.3,
              },
            },
          ],
        };

        const chart = echarts.init(vizElement);
        chart.setOption(option);
        console.log('ECharts 图表渲染成功');
      } catch (error) {
        console.error('查询或渲染失败:', error);
        errorMessage.value = `查询或渲染失败: ${error.message}`;
      } finally {
        await session.close();
      }
    };

    onMounted(() => {
      draw();
    });

    return {
      viz1,
      errorMessage,
    };
  },
};
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.left {
  width: 100%;
  height: 100%;
}
</style>