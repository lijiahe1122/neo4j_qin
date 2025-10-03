<template>
  <div style="min-height: 500px;width: 1200px;margin: 0 auto">
    <div id="viz1" ref="viz1" style="height: 500px;"></div>
    <div v-if="errorMessage" style="color: red; margin-top: 10px;">
      {{ errorMessage }}
    </div>
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

      // 1. 检查DOM是否就绪
      if (!vizElement) {
        console.error('DOM element is not mounted yet!');
        errorMessage.value = '图表容器未加载完成，请刷新页面重试';
        return;
      }

      // 2. 检查Neo4j驱动是否可用
      if (!neo4jDriver) {
        errorMessage.value = 'Neo4j 驱动未初始化！';
        console.error(errorMessage.value);
        return;
      }

      // 3. 执行查询并处理数据
      const session = neo4jDriver.session();
      try {
        const result = await session.run(
            'MATCH (n)-[r]->(m) ' +
            'WHERE n.name IS NOT NULL AND m.name IS NOT NULL ' +
            'RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight'
        );

        const data = result.records.map(record => {
          try {
            return {
              source: record.get('source'),
              target: record.get('target'),
              type: record.get('type'),
              weight: record.get('weight') || 1,
            };
          } catch (e) {
            console.warn('数据转换错误:', e);
            return null;
          }
        }).filter(Boolean);

        if (data.length === 0) {
          errorMessage.value = '未查询到有效数据';
          return;
        }

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
          // title: {
            // text: 'Neo4j 关系图',
            // left: 'middle',
            // textStyle: {
            //   fontSize: 18,
            //   fontWeight: 'bold'
            // }
            title: {
              text: 'Neo4j 关系图',
              subtext: '秦代人物关系图谱',
              left: 'center',
              textStyle: {
                color: '#fff',
                fontSize: 26,
                fontWeight: 'bold',
                textBorderColor: 'rgba(0,102,204,0.8)',
                textBorderWidth: 2
              },
              subtextStyle: {
                color: '#aad8ff',
                fontSize: 14
              }
          },
          tooltip: {
            trigger: 'item',
            formatter: (params) => {
              if (params.dataType === 'edge') {
                const edgeData = params.data;
                return `关系类型: ${edgeData.type}`;
              } else {
                return `节点: ${params.name}`;
              }
            }
          },
          series: [
            {
              type: 'graph',
              layout: 'force',
              force: {
                repulsion: 200,
                edgeLength: 160,
                gravity: 0.05,
                layoutAnimation: true,

              },
              roam: true,
              draggable: true,
              label: {
                show: true,
                position: 'left',
                formatter: '{b}',
                fontSize: 12,
              },
              data: graphData.nodes, symbolSize: 30,
              links: graphData.links.map(link => ({
                ...link,
                type: link.type || '未知关系',
                weight: link.weight || 1,

              })),
              // 关键修改：确保边始终可见，且悬停时才显示tooltip
              lineStyle: {
                color: '#6b6f6c',
                width: 2,
                curveness: 0.1,
                opacity: 0.7, // 确保边不透明


              },
              edgeSymbol: ['none', 'arrow'], // 起点无符号，终点为箭头
              edgeSymbolSize: 6, // 箭头大小
              emphasis: {
                focus: 'adjacency',
                lineStyle: {
                  //width: (params) => Math.max(2, params.data.weight * 1.5),
                  //shadowBlur: 10,
                  //shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
                // 边悬停时显示tooltip，但不隐藏边
                label: {
                  show: true,
                  formatter: '{b}', // 显示边的 type
                  position: 'inside',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#333',


                },
              },
              itemStyle: {
                borderColor: '#fff',
                borderWidth: 2,
                shadowBlur: 10,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
              },

            }
          ]
        };

        const chart = echarts.init(vizElement);
        chart.setOption(option);
        chart.on('click', (params) => {
          if (params.dataType === 'node' && params.name === '秦始皇') {
            // 跳转到指定页面
            window.location.href = 'http://localhost:5173/content'; // 替换为您的目标URL
          }});

        window.addEventListener('resize', () => {
          chart.resize();
        });

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

<style scoped>
/* 移除未使用的样式 */
</style>