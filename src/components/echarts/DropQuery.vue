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

// 颜色配置 - 每个命名空间使用独立的颜色方案
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

  defaultNodeColor: '#1E90FF',
  defaultEdgeColor: '#6b6f6c',
};

class ParticleAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.resizeHandler = this.setupCanvas.bind(this);

    this.setupCanvas();
    this.createParticles();
    this.animate();

    window.addEventListener('resize', this.resizeHandler);
  }

  setupCanvas() {
    this.w = this.canvas.width = this.canvas.parentElement.clientWidth;
    this.h = this.canvas.height = this.canvas.parentElement.clientHeight;
  }

  createParticles() {
    for (let i = 0; i < particleConfig.particleAmount; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        speed: particleConfig.defaultSpeed + Math.random() * particleConfig.variantSpeed,
        direction: Math.random() * Math.PI * 2,
      });
    }
  }

  drawParticle(particle) {
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particleConfig.particleRadius, 0, Math.PI * 2);
    this.ctx.fillStyle = particleConfig.particleColor;
    this.ctx.fill();
  }

  drawLine(p1, p2) {
    const distance = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
    if (distance > 150) return;

    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = particleConfig.lineColor;
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
  }

  updateParticles() {
    this.particles.forEach(particle => {
      particle.x += Math.cos(particle.direction) * particle.speed;
      particle.y += Math.sin(particle.direction) * particle.speed;

      if (particle.x < 0 || particle.x > this.w) {
        particle.direction = Math.PI - particle.direction;
        particle.x = Math.max(particleConfig.particleRadius, Math.min(this.w - particleConfig.particleRadius, particle.x));
      }
      if (particle.y < 0 || particle.y > this.h) {
        particle.direction = -particle.direction;
        particle.y = Math.max(particleConfig.particleRadius, Math.min(this.h - particleConfig.particleRadius, particle.y));
      }
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        this.drawLine(this.particles[i], this.particles[j]);
      }
    }

    this.particles.forEach(particle => this.drawParticle(particle));
    this.updateParticles();

    requestAnimationFrame(() => this.animate());
  }

  destroy() {
    window.removeEventListener('resize', this.resizeHandler);
  }
}

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
    const themeParam = ref(null);


    let chartInstance = null;
    let particleAnimation = null;
    let isDrawing = ref(false);
    let originalData = null; // 保存原始数据用于重置


    const draw = async (entityToSearch = null) => {
      if (isDrawing.value) return;
      isDrawing.value = true;

      // 明确声明data变量
      let data = [];

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

          // 如果namespace变更且没有传入entityToSearch，但themeParam有值，则使用themeParam作为entityToSearch
          if (entityToSearch === null && themeParam.value) {
            entityToSearch = themeParam.value;
          }

          if (entityToSearch) {
            // 搜索特定实体的查询 - 总是返回source, target, type, weight字段
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
            // 默认查询所有关系，但根据theme参数筛选 - 总是返回source, target, type, weight字段
            if (selectedNamespace.value === 'character') {
              if (themeParam.value) {
                // 先查询与主题相关的字符名称列表
                try {
                  const relatedCharsResponse = await session.run(
                      `MATCH (n:character_Entity)-[r]-(m)
                 WHERE m.name = $themeName AND n.name IS NOT NULL
                 RETURN DISTINCT n.name AS characterName`,
                      { themeName: themeParam.value }
                  );

                  const relatedChars = relatedCharsResponse.records.map(record => record.get('characterName'));

                  if (relatedChars.length > 0) {
                    // 构建包含所有相关字符名称的Cypher列表
                    const relatedCharsList = relatedChars.map(name => `'${name}'`).join(', ');

                    // 查询只包含这些相关字符之间的关系，直接返回字段
                    query = `
                  MATCH (n:character_Entity)-[r]->(m:character_Entity)
                  WHERE n.name IN [${relatedCharsList}] AND m.name IN [${relatedCharsList}]
                  RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
                `;
                  } else {
                    // 如果没有找到相关字符，返回空结果集
                    query = 'MATCH (n) WHERE false RETURN n';
                  }
                } catch (error) {
                  console.error('查询相关字符失败:', error);
                  // 如果查询失败，回退到查询所有字符关系
                  query = `
                MATCH (n:character_Entity)-[r]->(m:character_Entity)
                WHERE n.name IS NOT NULL AND m.name IS NOT NULL
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
                }
              } else {
                // 没有theme参数，查询所有字符关系
                query = `
              MATCH (n:character_Entity)-[r]->(m:character_Entity)
              WHERE n.name IS NOT NULL AND m.name IS NOT NULL
              RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
            `;
              }
            } else if (selectedNamespace.value === 'event') {
              if (themeParam.value) {
                // 先查询与主题相关的事件名称列表
                try {
                  const relatedEventsResponse = await session.run(
                      `MATCH (n:event_Entity)-[r]-(m)
                 WHERE m.name = $themeName AND n.name IS NOT NULL
                 RETURN DISTINCT n.name AS eventName`,
                      { themeName: themeParam.value }
                  );

                  const relatedEvents = relatedEventsResponse.records.map(record => record.get('eventName'));

                  if (relatedEvents.length > 0) {
                    // 构建包含所有相关事件名称的Cypher列表
                    const relatedEventsList = relatedEvents.map(name => `'${name}'`).join(', ');

                    // 查询只包含这些相关事件之间的关系，直接返回字段
                    query = `
                  MATCH (n:event_Entity)-[r]->(m:event_Entity)
                  WHERE n.name IN [${relatedEventsList}] AND m.name IN [${relatedEventsList}]
                  RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
                `;
                  } else {
                    // 如果没有找到相关事件，返回空结果集
                    query = 'MATCH (n) WHERE false RETURN n';
                  }
                } catch (error) {
                  console.error('查询相关事件失败:', error);
                  // 如果查询失败，回退到查询所有事件关系
                  query = `
                MATCH (n:event_Entity)-[r]->(m:event_Entity)
                WHERE n.name IS NOT NULL AND m.name IS NOT NULL
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
                }
              } else {
                // 没有theme参数，查询所有事件关系
                query = `
              MATCH (n:event_Entity)-[r]->(m:event_Entity)
              WHERE n.name IS NOT NULL AND m.name IS NOT NULL
              RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
            `;
              }
            } else if (selectedNamespace.value === 'nationality') {
              if (themeParam.value) {
                // 先查询与主题相关的民族名称列表
                try {
                  const relatedNationalitiesResponse = await session.run(
                      `MATCH (n:nationality_Entity)-[r]-(m)
                 WHERE m.name = $themeName AND n.name IS NOT NULL
                 RETURN DISTINCT n.name AS nationalityName`,
                      { themeName: themeParam.value }
                  );

                  const relatedNationalities = relatedNationalitiesResponse.records.map(record => record.get('nationalityName'));

                  if (relatedNationalities.length > 0) {
                    // 构建包含所有相关民族名称的Cypher列表
                    const relatedNationalitiesList = relatedNationalities.map(name => `'${name}'`).join(', ');

                    // 查询只包含这些相关民族之间的关系，直接返回字段
                    query = `
                  MATCH (n:nationality_Entity)-[r]->(m:nationality_Entity)
                  WHERE n.name IN [${relatedNationalitiesList}] AND m.name IN [${relatedNationalitiesList}]
                  RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
                `;
                  } else {
                    // 如果没有找到相关民族，返回空结果集
                    query = 'MATCH (n) WHERE false RETURN n';
                  }
                } catch (error) {
                  console.error('查询相关民族失败:', error);
                  // 如果查询失败，回退到查询所有民族关系
                  query = `
                MATCH (n:nationality_Entity)-[r]->(m:nationality_Entity)
                WHERE n.name IS NOT NULL AND m.name IS NOT NULL
                RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
              `;
                }
              } else {
                // 没有theme参数，查询所有民族关系
                query = `
              MATCH (n:nationality_Entity)-[r]->(m:nationality_Entity)
              WHERE n.name IS NOT NULL AND m.name IS NOT NULL
              RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
            `;
              }
            }
          }

          console.log('Executing query:', query);
          console.log('Search entity:', entityToSearch);
          console.log('Theme parameter:', themeParam.value);

          const queryParams = entityToSearch ? { entityName: entityToSearch } : {};
          const result = await session.run(query, queryParams);

          // ========== 简化的数据处理逻辑 ==========
          // 我们已经确保查询总是返回source, target, type, weight字段或空结果集
          // 所以我们可以简化数据处理逻辑

          try {
            // 直接尝试获取source, target, type, weight字段
            data = result.records.map(record => {
              // 检查记录是否包含我们需要的字段
              if (
                  record.get('source') !== undefined &&
                  record.get('target') !== undefined &&
                  record.get('type') !== undefined &&
                  record.get('weight') !== undefined
              ) {
                return {
                  source: record.get('source'),
                  target: record.get('target'),
                  type: record.get('type'),
                  weight: record.get('weight') || 1,
                };
              } else {
                // 如果记录不包含这些字段，可能是空结果集
                // 检查是否返回了空结果集（没有字段的记录）
                const recordKeys = Object.keys(record);
                if (recordKeys.length === 0) {
                  // 空记录，可能是空结果集
                  return null;
                } else {
                  // 记录包含一些字段，但不是我们需要的字段
                  console.warn('记录包含意外的字段:', recordKeys);
                  return null;
                }
              }
            }).filter(Boolean); // 过滤掉null值

            // 成功获取数据
            console.log('成功获取数据，共', data.length, '条记录');
          } catch (error) {
            console.error('数据处理失败:', error);
            errorMessage.value = `数据处理失败: ${error.message}`;
            return;  // 直接返回，不继续执行
          }
          // ========== 数据处理逻辑结束 ==========

          if (data.length === 0) {
            errorMessage.value = entityToSearch
                ? `未找到与"${entityToSearch}"相关的关系数据`
                : '未查询到有效数据';
            return;
          }

          // 保存原始数据用于重置
          if (!entityToSearch) {
            originalData = data;
            searchResultInfo.value = '';
            hasSearched.value = false;
          } else {
            searchResultInfo.value = `显示与"${entityToSearch}"相关的关系，共${data.length}条`;
            hasSearched.value = true;
          }

          const namespace = selectedNamespace.value;
          const namespaceColor = colorConfig.namespaceBaseColors[namespace] || colorConfig.defaultNodeColor;
          const relationColors = colorConfig.relationColorSchemes[namespace] || {};

          const graphData = {
            nodes: [...new Set(data.flatMap(d => [d.source, d.target]))].map(name => ({
              name,
              itemStyle: {
                color: namespaceColor,
                // 高亮搜索的实体
                opacity: name === entityToSearch ? 1 : 0.8,
                shadowBlur: name === entityToSearch ? 15 : 10,
                shadowColor: name === entityToSearch ? '#fff' : 'rgba(0, 0, 0, 0.3)',
              },
            })),
            links: data.map(d => {
              const relationType = d.type;
              const relationKey = relationType.replace(`${namespace}_`, '');

              const edgeColor = relationColors[relationKey] || colorConfig.defaultEdgeColor;

              return {
                source: d.source,
                target: d.target,
                type: d.type,
                weight: d.weight,
                lineStyle: {
                  color: edgeColor,
                },
              };
            }),
          };

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
                symbolSize: 30,
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
                  router.push(`/hotstart/${response.data[0].theme}`);
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

// 添加重置函数
    const resetChart = () => {
      if (isDrawing.value) return;
      isDrawing.value = true;

      try {
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

        // 重置数据状态
        data = [];
        searchResultInfo.value = '';
        hasSearched.value = false;

        // 渲染空图表或初始图表
        if (particleCanvas.value) {
          particleAnimation = new ParticleAnimation(particleCanvas.value);
        }

        // 可以选择渲染一个空图表或初始提示
        const vizElement = viz1.value;
        if (vizElement) {
          // 渲染一个空图表
          chartInstance = echarts.init(vizElement);
          chartInstance.setOption({
            title: {
              text: 'Neo4j关系图',
              subtext: '点击节点查看相关主题',
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
                data: [], // 空数据
                links: [], // 空链接
              }
            ]
          });
        }

        errorMessage.value = '';
      } catch (error) {
        console.error('重置图表失败:', error);
        errorMessage.value = `重置图表失败: ${error.message}`;
      } finally {
        isDrawing.value = false;
      }
    };

    // 命名空间变更处理
    const handleNamespaceChange = () => {
      console.log('命名空间变更为:', selectedNamespace.value);
      //themeParam.value = null; // 切换命名空间时清除主题参数
      // resetSearch(); // 切换命名空间时重置搜索
      draw();
    };

    // 搜索实体处理
    const searchEntityHandler = () => {
      if (!searchEntity.value.trim()) {
        errorMessage.value = '请输入要搜索的实体名称';
        return;
      }

      isSearching.value = true;
      errorMessage.value = '';
      draw(searchEntity.value.trim());
    };

    // 重置搜索
    // const resetSearch = () => {
    //   searchEntity.value = '';
    //   errorMessage.value = '';
    //   searchResultInfo.value = '';
    //   hasSearched.value = false;
    //   if (originalData) {
    //     draw(); // 使用保存的原始数据重新渲染
    //   }
    // };
    const resetSearch = () => {
      searchEntity.value = '';
      errorMessage.value = '';
      searchResultInfo.value = '';
      hasSearched.value = false;
      //themeParam.value = null; // 清空主题参数

      // 调用draw函数重置图表，不传入任何参数
      draw();
    };

    // 监听命名空间变化
    watch(selectedNamespace, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        handleNamespaceChange();
      }
    });

    // 组件挂载时从路由参数初始化selectedNamespace和themeParam
    onMounted(() => {
      // 从路由查询参数中获取namespace参数
      const query = router.currentRoute.value.query;
      if (query && query.namespace) {
        // 确保namespace是有效的值
        if (['character', 'event', 'nationality'].includes(query.namespace)) {
          selectedNamespace.value = query.namespace;
          console.log(`从查询参数设置 selectedNamespace 为: ${selectedNamespace.value}`);
        } else {
          console.warn(`无效的命名空间参数: ${query.namespace}`);
        }
      } else {
        console.log('查询参数中没有 namespace 参数，使用默认值');
      }

      // 从路由查询参数中获取theme参数
      if (query && query.theme) {
        themeParam.value = query.theme;
        console.log(`从查询参数设置 themeParam 为: ${themeParam.value}`);
      } else {
        console.log('查询参数中没有 theme 参数');
      }

      // 调用draw函数绘制图表
      draw();
    });

// 监听路由参数变化
    watch(
        () => router.currentRoute.value.query,
        (newQuery) => {
          if (newQuery) {
            // 当namespace参数变化时
            if (newQuery.namespace && newQuery.namespace !== selectedNamespace.value) {
              if (['character', 'event', 'nationality'].includes(newQuery.namespace)) {
                selectedNamespace.value = newQuery.namespace;
                console.log(`路由参数namespace变更为: ${selectedNamespace.value}`);
                handleNamespaceChange(); // 这会调用draw()函数
              } else {
                console.warn(`无效的命名空间参数: ${newQuery.namespace}`);
              }
            }

            // 当theme参数变化时
            if (newQuery.theme && newQuery.theme !== themeParam.value) {
              themeParam.value = newQuery.theme;
              console.log(`路由参数theme变更为: ${themeParam.value}`);
              draw(); // 直接调用draw()函数，使用新的theme参数
            }
          }
        }
    );

    // 组件卸载前清理资源
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
</style>
