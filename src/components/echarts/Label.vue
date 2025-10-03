<template>
  <div style="min-height: 500px; width: 1200px; margin: 0 auto; position: relative;">
    <!-- 粒子动画背景 -->
    <canvas ref="particleCanvas" style="position: absolute; top: 0; left: 0; z-index: 0;"></canvas>

    <!-- ECharts图表容器 -->
    <div id="viz1" ref="viz1" style="height: 500px;"></div>

    <!-- 错误信息显示 -->
    <div v-if="errorMessage" style="color: red; margin-top: 10px;">
      {{ errorMessage }}
    </div>

    <!-- 命名空间选择下拉菜单 -->
    <select v-model="selectedNamespace" @change="handleNamespaceChange" style="position: absolute; top: 10px; right: 10px;">
      <option value="character">人物关系</option>
      <option value="event">事件关系</option>
      <option value="nationality">民族关系</option>
    </select>

    <!-- 实体查询窗口 -->
    <div class="search-container" style="position: absolute; bottom: 10px; right: 10px; background-color: rgba(255, 255, 255, 0.8); padding: 10px; border-radius: 5px; z-index: 10; width: 250px;">
      <h4 style="margin: 0 0 10px 0; font-size: 14px;">实体查询</h4>
      <div style="display: flex; margin-bottom: 5px;">
        <input
            v-model="searchEntity"
            type="text"
            placeholder="输入实体名称"
            style="flex: 1; padding: 5px; margin-right: 5px; border: 1px solid #ccc; border-radius: 3px;"
        >
        <button
            @click="searchEntityHandler"
            :disabled="!searchEntity || isSearching"
            style="padding: 5px 10px; background-color: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer; margin-right: 5px;"
        >
          {{ isSearching ? '查询中...' : '查询' }}
        </button>
        <button
            @click="resetSearch"
            :disabled="isSearching"
            style="padding: 5px 10px; background-color: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;"
        >
          重置
        </button>
      </div>
      <div v-if="searchResultInfo" style="font-size: 12px; color: #666;">
        {{ searchResultInfo }}
      </div>
    </div>

    <!-- 图例显示（左下角） -->
    <div class="legend-container" style="position: absolute; bottom: 10px; left: 10px; background-color: rgba(255, 255, 255, 0.8); padding: 5px; border-radius: 3px; z-index: 10;">
      <div v-for="(color, label) in legendColors" :key="label" style="display: flex; align-items: center; margin-bottom: 2px;">
        <div :style="{ width: '12px', height: '12px', backgroundColor: color, marginright:'5px' }"></div>
        <span>{{ label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { inject, ref, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import axios from 'axios';

// 粒子动画配置
const particleConfig = {
  particleColor: 'rgba(255, 215, 0, 0.5)',
  particleAmount: 60,
  defaultSpeed: 0.5,
  variantSpeed: 1,
  lineColor: 'rgba(86, 150, 222, 0.44)',
  particleRadius: 2,
};

// 颜色配置 - 新增类别颜色和图例
const colorConfig = {
  namespaceBaseColors: {
    character: '#37A2DA',
    event: '#FF9F7F',
    nationality: '#6ACC65',
  },
  relationColorSchemes: {
    character: {
      relationship: '#5470C6',
      family: '#91CC75',
      work: '#EE6666',
      association: '#73C0DE',
    },
    event: {
      cause: '#FF9F7F',
      time: '#FCCA64',
      location: '#8B7CF5',
      participant: '#DE7A7A',
    },
    nationality: {
      origin: '#6ACC65',
      related: '#4FC08D',
      culture: '#F0A54A',
      history: '#8A98C0',
    },
  },
  categoryColors: {
    king: '#4285F4',       // 王类别颜色（蓝色）
    prince: '#0F9D58',     // 公子类别颜色（绿色）
    other: '#D3D3D3',      // 其他类别颜色（灰色）
  },
  defaultEdgeColor: '#6b6f6c',
  legendColors: {
    '王': '#4285F4',
    '公子': '#0F9D58',
    '其他': '#D3D3D3',
  },
};

class ParticleAnimation { /* 保持不变 */ }

export default {
  name: 'GraphVisualization',
  setup() {
    const viz1 = ref(null);
    const errorMessage = ref('');
    const neo4jDriver = inject('$neo4j');
    const particleCanvas = ref(null);
    const router = useRouter();
    const selectedNamespace = ref('character');
    const searchEntity = ref('');
    const isSearching = ref(false);
    const hasSearched = ref(false);
    const searchResultInfo = ref('');
    const legendColors = ref(colorConfig.legendColors); // 图例颜色
    let chartInstance = null;
    let particleAnimation = null;
    let isDrawing = ref(false);
    let originalData = null;

    const draw = async (entityToSearch = null) => {
      if (isDrawing.value) return;
      isDrawing.value = true;

      try {
        await nextTick();
        const vizElement = viz1.value;

        // 清理旧资源
        if (chartInstance) {
          chartInstance.dispose();
          chartInstance = null;
        }
        if (particleAnimation) {
          particleAnimation.destroy();
          particleAnimation = null;
        }

        // 初始化粒子动画
        if (particleCanvas.value) {
          particleAnimation = new ParticleAnimation(particleCanvas.value);
        }

        if (!vizElement) {
          errorMessage.value = '图表容器未加载完成，请刷新页面重试';
          return;
        }

        if (!neo4jDriver) {
          errorMessage.value = 'Neo4j驱动未初始化！';
          return;
        }

        const validNamespaces = ['character', 'event', 'nationality'];
        if (!validNamespaces.includes(selectedNamespace.value)) {
          errorMessage.value = '无效的命名空间选择';
          return;
        }

        const session = neo4jDriver.session();
        try {
          let query = '';
          let isSearchQuery = false;

          if (entityToSearch) {
            isSearchQuery = true;
            if (selectedNamespace.value === 'character') {
              query = `
                MATCH (n:character_Entity)-[r]-(m:character_Entity)
                WHERE n.name = $entityName
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
            } else if (selectedNamespace.value === 'event') {
              query = `
                MATCH (n:event_Entity)-[r]-(m:event_Entity)
                WHERE n.name = $entityName
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
            } else if (selectedNamespace.value === 'nationality') {
              query = `
                MATCH (n:nationality_Entity)-[r]-(m:nationality_Entity)
                WHERE n.name = $entityName
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
            }
          } else {
            if (selectedNamespace.value === 'character') {
              query = `
                MATCH (n:character_Entity)-[r]->(m:character_Entity)
                WHERE n.name IS NOT NULL AND m.name IS NOT NULL
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
            } else if (selectedNamespace.value === 'event') {
              query = `
                MATCH (n:event_Entity)-[r]->(m:event_Entity)
                WHERE n.name IS NOT NULL AND m.name IS NOT NULL
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
            } else if (selectedNamespace.value === 'nationality') {
              query = `
                MATCH (n:nationality_Entity)-[r]->(m:nationality_Entity)
                WHERE n.name IS NOT NULL AND m.name IS NOT NULL
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
            }
          }

          const queryParams = entityToSearch ? { entityName: entityToSearch } : {};
          const result = await session.run(query, queryParams);

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
            errorMessage.value = entityToSearch
                ? `未找到与"${entityToSearch}"相关的关系数据`
                : '未查询到有效数据';
            return;
          }

          // 计算节点度和分类
          const nodeDegrees = {};
          const allNodes = data.flatMap(d => [d.source, d.target]);
          allNodes.forEach(node => {
            nodeDegrees[node] = (nodeDegrees[node] || 0) + 1;
          });

          const graphData = {
            nodes: [...new Set(allNodes)].map(name => {
              const category = determineCategory(name);
              return {
                name,
                category,
                degree: nodeDegrees[name],
                itemStyle: {
                  color: colorConfig.categoryColors[category],
                  opacity: 0.8,
                  shadowBlur: 10,
                  shadowColor: 'rgba(0,0,0,0.3)',
                },
              };
            }),
            links: data.map(d => ({
              source: d.source,
              target: d.target,
              type: d.type,
              weight: d.weight,
              lineStyle: {
                color: colorConfig.relationColorSchemes[selectedNamespace.value][d.type.replace(`${selectedNamespace.value}_`, '')] || colorConfig.defaultEdgeColor,
              },
            })),
          };

          // 设置节点大小
          graphData.nodes.forEach(node => {
            node.symbolSize = node.degree * 2 + 20;
            if (entityToSearch && node.name === entityToSearch) {
              node.itemStyle.opacity = 1;
              node.symbolSize += 10;
            }
          });

          const option = {
            title: {
              text: 'Neo4j关系图',
              subtext: selectedNamespace.value === 'character' ? '人物关系图谱' :
                  selectedNamespace.value === 'event' ? '事件关系图谱' :
                      '民族关系图谱',
              left: 'center',
              textStyle: {
                color: '#fff',
                fontSize: 26,
                fontWeight: 'bold',
                textBorderColor: 'rgba(0, 102, 204, 0.8)',
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
                  return `关系类型: ${params.data.type}`;
                } else {
                  return `节点: ${params.name}<br>类别: ${params.data.category}<br>关系数量: ${params.data.degree}`;
                }
              }
            },
            series: [
              {
                type: 'graph',
                layout: 'force',
                force: {
                  repulsion: 200,
                  edgeLength: 200,
                  gravity: 0.05,
                  layoutAnimation: true,
                },
                roam: true,
                draggable: true,
                label: {
                  show: true,
                  position: 'right',
                  formatter: '{b}',
                  fontSize: 12,
                },
                data: graphData.nodes,
                symbolSize: graphData.nodes.map(node => node.symbolSize),
                links: graphData.links,
                lineStyle: {
                  width: 2,
                  curveness: 0.1,
                  opacity: 0.7,
                },
                edgeSymbol: ['none', 'arrow'],
                edgeSymbolSize: 6,
                emphasis: {
                  focus: 'adjacency',
                  lineStyle: {},
                  label: {
                    show: true,
                    formatter: '{b}',
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

          chartInstance = echarts.init(vizElement);
          chartInstance.setOption(option);

          chartInstance.on('click', async (params) => {
            if (params.dataType === 'node') {
              const entityName = params.name;
              try {
                const response = await axios.get('http://localhost:3001/api/search-theme', {
                  params: { entity: entityName }
                });
                if (response.data.length > 0) {
                  router.push(`/reuse/${response.data[0].theme}`);
                } else {
                  console.log('未找到相关主题');
                }
              } catch (error) {
                console.error('查询主题失败:', error);
              }
            }
          });

          window.addEventListener('resize', () => {
            chartInstance?.resize();
          });

          console.log('ECharts图表渲染成功');
        } catch (error) {
          console.error('查询或渲染失败:', error);
          errorMessage.value = `查询或渲染失败: ${error.message}`;
        } finally {
          session.close();
        }
      } finally {
        isDrawing.value = false;
        isSearching.value = false;
      }
    };

    const determineCategory = (name) => {
      if (name.includes('王')) return 'king';
      if (name.includes('公子')) return 'prince';
      return 'other';
    };

    const handleNamespaceChange = () => {
      console.log('命名空间变更为:', selectedNamespace.value);
      resetSearch();
      draw();
    };

    const searchEntityHandler = () => {
      if (!searchEntity.value.trim()) {
        errorMessage.value = '请输入要搜索的实体名称';
        return;
      }
      isSearching.value = true;
      errorMessage.value = '';
      draw(searchEntity.value.trim());
    };

    const resetSearch = () => {
      searchEntity.value = '';
      errorMessage.value = '';
      searchResultInfo.value = '';
      hasSearched.value = false;
      if (originalData) {
        draw();
      }
    };

    watch(selectedNamespace, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        handleNamespaceChange();
      }
    });

    onMounted(() => {
      draw();
    });

    onBeforeUnmount(() => {
      if (chartInstance) {
        chartInstance.dispose();
        chartInstance = null;
      }
      if (particleAnimation) {
        particleAnimation.destroy();
        particleAnimation = null;
      }
      window.removeEventListener('resize', () => {
        chartInstance?.resize();
      });
    });

    return {
      viz1,
      particleCanvas,
      errorMessage,
      selectedNamespace,
      handleNamespaceChange,
      searchEntity,
      isSearching,
      hasSearched,
      searchResultInfo,
      searchEntityHandler,
      resetSearch,
      legendColors,
    };
  },
};
</script>

<style scoped>
select {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #fff;
  font-size: 14px;
  cursor: pointer;
  z-index: 10;
}

select:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.legend-container {
  display: flex;
  flex-direction: column;
}
</style>