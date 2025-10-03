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

    <!-- 命名空间选择下拉菜单 - 保留原有功能 -->
    <select v-model="selectedNamespace" @change="handleNamespaceChange" style="position: absolute; top: 10px; right: 100px;">
      <option value="character">人物关系</option>
      <option value="event">事件关系</option>
      <option value="nationality">民族关系</option>
    </select>

    <!-- 新增: 导航按钮 - 添加的新功能 -->
    <!-- 使用绝对定位，放置在右上角，不干扰其他元素 -->
    <div class="navigation-buttons">
      <button
          :class="{ 'active': selectedNamespace === 'character' }"
          @click="navigateTo('character')"
      >
        人物关系
      </button>
      <button
          :class="{ 'active': selectedNamespace === 'event' }"
          @click="navigateTo('event')"
      >
        事件关系
      </button>
      <button
          :class="{ 'active': selectedNamespace === 'nationality' }"
          @click="navigateTo('nationality')"
      >
        民族关系
      </button>
    </div>

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
    let chartInstance = null;
    let particleAnimation = null;
    let isDrawing = ref(false);
    let originalData = null; // 保存原始数据用于重置

    // 绘制函数
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
            // 搜索特定实体的查询
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
            // 默认查询所有关系
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

          console.log('Executing query:', query);
          console.log('Search entity:', entityToSearch);

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

    // 命名空间变更处理 - 更新以支持按钮点击
    const handleNamespaceChange = () => {
      console.log('命名空间变更为:', selectedNamespace.value);
      resetSearch(); // 切换命名空间时重置搜索
      draw();
    };

    // 新增: 导航按钮点击处理函数
    const navigateTo = (namespace) => {
      console.log('通过按钮导航到命名空间:', namespace);
      selectedNamespace.value = namespace; // 更新当前选中的命名空间
      handleNamespaceChange(); // 触发数据重新加载和图表重绘
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
    const resetSearch = () => {
      searchEntity.value = '';
      errorMessage.value = '';
      searchResultInfo.value = '';
      hasSearched.value = false;
      if (originalData) {
        draw(); // 使用保存的原始数据重新渲染
      }
    };

    // 监听命名空间变化 - 保留原有监听功能
    watch(selectedNamespace, (newVal, oldVal) => {
      if (newVal !== oldVal) {
        handleNamespaceChange();
      }
    });

    // 组件挂载时调用draw函数
    onMounted(() => {
      draw();
    });

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
      navigateTo, // 暴露导航函数给模板
    };
  },
};
</script>

<style scoped>
select {
  position: absolute;
  top: 10px;
  right: 100px;
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

/* 导航按钮样式 - 专门为DropQuery组件调整 */
.navigation-buttons {
  position: absolute; /* 使用绝对定位 */
  top: 10px; /* 距离顶部10px */
  right: 10px; /* 距离右侧10px，与下拉菜单在同一水平线上 */
  display: flex;
  gap: 10px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.8); /* 半透明背景 */
  padding: 5px 10px; /* 内边距 */
  border-radius: 5px; /* 圆角 */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* 阴影效果 */
}

.navigation-buttons button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.8);
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.navigation-buttons button:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-1px);
}

.navigation-buttons button.active {
  background: #3498db;
  color: white;
}
</style>