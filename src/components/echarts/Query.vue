<!--<template>-->
<!--  <div style="min-height: 500px;width: 1200px;margin: 0 auto">-->
<!--    <canvas ref="particleCanvas" style="position: absolute; top: 0; left: 0; z-index: 0;"></canvas>-->

<!--    &lt;!&ndash; 添加搜索框 &ndash;&gt;-->
<!--    <div style="margin-bottom: 20px; display: flex; justify-content: center;">-->
<!--      <el-input-->
<!--          v-model="searchQuery"-->
<!--          placeholder="输入实体名称进行查询"-->
<!--          style="width: 400px; margin-right: 10px;"-->
<!--          clearable-->
<!--          @keyup.enter="handleSearch"-->
<!--      />-->
<!--      <el-button type="primary" @click="handleSearch">查询</el-button>-->
<!--      <el-button @click="resetGraph">重置</el-button>-->
<!--    </div>-->

<!--    <div id="viz1" ref="viz1" style="height: 500px;"></div>-->
<!--    <div v-if="errorMessage" style="color: red; margin-top: 10px;">-->
<!--      {{ errorMessage }}-->
<!--    </div>-->
<!--  </div>-->
<!--</template>-->

<!--<script>-->
<!--import { inject, ref, onMounted, nextTick } from 'vue';-->
<!--import * as echarts from 'echarts';-->
<!--import { useRouter } from 'vue-router';-->
<!--import { ElMessage } from 'element-plus';-->

<!--// 粒子动画配置-->
<!--const particleConfig = {-->
<!--  particleColor: 'rgba(255,215,0,0.5)', // 金色粒子-->
<!--  particleAmount: 60,-->
<!--  defaultSpeed: 0.5,-->
<!--  variantSpeed: 1,-->
<!--  lineColor: 'rgba(86,150,222,0.44)',-->
<!--  particleRadius: 2,-->
<!--};-->

<!--class ParticleAnimation {-->
<!--  constructor(canvas) {-->
<!--    this.canvas = canvas;-->
<!--    this.ctx = this.canvas.getContext('2d');-->
<!--    this.particles = [];-->

<!--    this.setupCanvas();-->
<!--    this.createParticles();-->
<!--    this.animate();-->
<!--  }-->

<!--  setupCanvas() {-->
<!--    this.w = this.canvas.width = this.canvas.parentElement.clientWidth;-->
<!--    this.h = this.canvas.height = this.canvas.parentElement.clientHeight;-->
<!--  }-->

<!--  createParticles() {-->
<!--    for(let i = 0; i < particleConfig.particleAmount; i++) {-->
<!--      this.particles.push({-->
<!--        x: Math.random() * this.w,-->
<!--        y: Math.random() * this.h,-->
<!--        speed: particleConfig.defaultSpeed + Math.random() * particleConfig.variantSpeed,-->
<!--        direction: Math.random() * Math.PI * 2,-->
<!--      });-->
<!--    }-->
<!--  }-->

<!--  drawParticle(particle) {-->
<!--    this.ctx.beginPath();-->
<!--    this.ctx.arc(particle.x, particle.y, particleConfig.particleRadius, 0, Math.PI*2);-->
<!--    this.ctx.fillStyle = particleConfig.particleColor;-->
<!--    this.ctx.fill();-->
<!--  }-->

<!--  drawLine(p1, p2) {-->
<!--    const distance = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);-->
<!--    if(distance > 150) return;-->

<!--    this.ctx.beginPath();-->
<!--    this.ctx.moveTo(p1.x, p1.y);-->
<!--    this.ctx.lineTo(p2.x, p2.y);-->
<!--    this.ctx.strokeStyle = particleConfig.lineColor;-->
<!--    this.ctx.lineWidth = 0.5;-->
<!--    this.ctx.stroke();-->
<!--  }-->

<!--  updateParticles() {-->
<!--    this.particles.forEach(particle => {-->
<!--      particle.x += Math.cos(particle.direction) * particle.speed;-->
<!--      particle.y += Math.sin(particle.direction) * particle.speed;-->

<!--      if(particle.x < 0 || particle.x > this.w) particle.direction = Math.PI - particle.direction;-->
<!--      if(particle.y < 0 || particle.y > this.h) particle.direction = -particle.direction;-->
<!--    });-->
<!--  }-->

<!--  animate() {-->
<!--    this.ctx.clearRect(0, 0, this.w, this.h);-->

<!--    // 绘制连接线-->
<!--    for(let i = 0; i < this.particles.length; i++) {-->
<!--      for(let j = i + 1; j < this.particles.length; j++) {-->
<!--        this.drawLine(this.particles[i], this.particles[j]);-->
<!--      }-->
<!--    }-->

<!--    // 绘制粒子-->
<!--    this.particles.forEach(particle => this.drawParticle(particle));-->
<!--    this.updateParticles();-->

<!--    requestAnimationFrame(() => this.animate());-->
<!--  }-->
<!--}-->

<!--export default {-->
<!--  name: 'GraphVisualization',-->
<!--  setup() {-->
<!--    const viz1 = ref(null);-->
<!--    const errorMessage = ref('');-->
<!--    const neo4jDriver = inject('$neo4j');-->
<!--    const particleCanvas = ref(null);-->
<!--    const router = useRouter();-->
<!--    const searchQuery = ref('');-->
<!--    const chart = ref(null);-->
<!--    const fullGraphData = ref(null); // 存储完整的图数据用于重置-->

<!--    // 初始化图表-->
<!--    const initChart = (graphData) => {-->
<!--      const option = {-->
<!--        title: {-->
<!--          text: 'Neo4j 关系图',-->
<!--          subtext: searchQuery.value ? `查询结果: ${searchQuery.value}` : '秦代人物关系图谱',-->
<!--          left: 'center',-->
<!--          textStyle: {-->
<!--            color: '#fff',-->
<!--            fontSize: 26,-->
<!--            fontWeight: 'bold',-->
<!--            textBorderColor: 'rgba(0,102,204,0.8)',-->
<!--            textBorderWidth: 2-->
<!--          },-->
<!--          subtextStyle: {-->
<!--            color: '#aad8ff',-->
<!--            fontSize: 14-->
<!--          }-->
<!--        },-->
<!--        tooltip: {-->
<!--          trigger: 'item',-->
<!--          formatter: (params) => {-->
<!--            if (params.dataType === 'edge') {-->
<!--              const edgeData = params.data;-->
<!--              return `关系类型: ${edgeData.type}`;-->
<!--            } else {-->
<!--              return `节点: ${params.name}`;-->
<!--            }-->
<!--          }-->
<!--        },-->
<!--        series: [-->
<!--          {-->
<!--            type: 'graph',-->
<!--            layout: 'force',-->
<!--            force: {-->
<!--              repulsion: 200,-->
<!--              edgeLength: 160,-->
<!--              gravity: 0.05,-->
<!--              layoutAnimation: true,-->
<!--            },-->
<!--            roam: true,-->
<!--            draggable: true,-->
<!--            label: {-->
<!--              show: true,-->
<!--              position: 'right',-->
<!--              formatter: '{b}',-->
<!--              fontSize: 12,-->
<!--            },-->
<!--            data: graphData.nodes,-->
<!--            symbolSize: 30,-->
<!--            links: graphData.links.map(link => ({-->
<!--              ...link,-->
<!--              type: link.type || '未知关系',-->
<!--              weight: link.weight || 1,-->
<!--            })),-->
<!--            lineStyle: {-->
<!--              color: '#6b6f6c',-->
<!--              width: 2,-->
<!--              curveness: 0.1,-->
<!--              opacity: 0.7,-->
<!--            },-->
<!--            edgeSymbol: ['none', 'arrow'],-->
<!--            edgeSymbolSize: 6,-->
<!--            emphasis: {-->
<!--              focus: 'adjacency',-->
<!--              label: {-->
<!--                show: true,-->
<!--                formatter: '{b}',-->
<!--                position: 'inside',-->
<!--                fontSize: 14,-->
<!--                fontWeight: 'bold',-->
<!--                color: '#333',-->
<!--              },-->
<!--            },-->
<!--            itemStyle: {-->
<!--              borderColor: '#fff',-->
<!--              borderWidth: 2,-->
<!--              shadowBlur: 10,-->
<!--              shadowColor: 'rgba(0, 0, 0, 0.3)'-->
<!--            },-->
<!--          }-->
<!--        ]-->
<!--      };-->

<!--      if (!chart.value) {-->
<!--        chart.value = echarts.init(viz1.value);-->
<!--      }-->
<!--      chart.value.setOption(option);-->

<!--      chart.value.on('click', (params) => {-->
<!--        if (params.dataType === 'node') {-->
<!--          router.push('Content');-->
<!--        }-->
<!--      });-->
<!--    };-->

<!--    // 执行查询并处理数据-->
<!--    const executeQuery = async (query) => {-->
<!--      const session = neo4jDriver.session();-->
<!--      try {-->
<!--        const result = await session.run(query);-->

<!--        const data = result.records.map(record => {-->
<!--          try {-->
<!--            return {-->
<!--              source: record.get('source'),-->
<!--              target: record.get('target'),-->
<!--              type: record.get('type'),-->
<!--              weight: record.get('weight') || 1,-->
<!--            };-->
<!--          } catch (e) {-->
<!--            console.warn('数据转换错误:', e);-->
<!--            return null;-->
<!--          }-->
<!--        }).filter(Boolean);-->

<!--        if (data.length === 0) {-->
<!--          errorMessage.value = '未查询到有效数据';-->
<!--          return null;-->
<!--        }-->

<!--        return {-->
<!--          nodes: [...new Set(data.flatMap(d => [d.source, d.target]))].map(name => ({name})),-->
<!--          links: data.map(d => ({-->
<!--            source: d.source,-->
<!--            target: d.target,-->
<!--            type: d.type,-->
<!--            weight: d.weight,-->
<!--          })),-->
<!--        };-->
<!--      } catch (error) {-->
<!--        console.error('查询失败:', error);-->
<!--        errorMessage.value = `查询失败: ${error.message}`;-->
<!--        return null;-->
<!--      } finally {-->
<!--        await session.close();-->
<!--      }-->
<!--    };-->

<!--    // 加载完整图数据-->
<!--    const loadFullGraph = async () => {-->
<!--      const graphData = await executeQuery(-->
<!--          'MATCH (n)-[r]->(m) ' +-->
<!--          'WHERE n.name IS NOT NULL AND m.name IS NOT NULL ' +-->
<!--          'RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight'-->
<!--      );-->

<!--      if (graphData) {-->
<!--        fullGraphData.value = graphData;-->
<!--        initChart(graphData);-->
<!--      }-->
<!--    };-->

<!--    // 处理搜索-->
<!--    const handleSearch = async () => {-->
<!--      if (!searchQuery.value.trim()) {-->
<!--        ElMessage.warning('请输入查询内容');-->
<!--        return;-->
<!--      }-->

<!--      const graphData = await executeQuery(-->
<!--          `MATCH (n)-[r]->(m)-->
<!--         WHERE n.name CONTAINS '${searchQuery.value}' OR m.name CONTAINS '${searchQuery.value}'-->
<!--         RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight-->
<!--         UNION-->
<!--         MATCH (n)-[r]->(m)-->
<!--         WHERE n.name CONTAINS '${searchQuery.value}'-->
<!--         RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight-->
<!--         UNION-->
<!--         MATCH (n)-[r]->(m)-->
<!--         WHERE m.name CONTAINS '${searchQuery.value}'-->
<!--         RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight`-->
<!--      );-->

<!--      if (graphData) {-->
<!--        initChart(graphData);-->
<!--      }-->
<!--    };-->

<!--    // 重置图表-->
<!--    const resetGraph = () => {-->
<!--      searchQuery.value = '';-->
<!--      if (fullGraphData.value) {-->
<!--        initChart(fullGraphData.value);-->
<!--      }-->
<!--    };-->

<!--    const draw = async () => {-->
<!--      await nextTick();-->
<!--      const vizElement = viz1.value;-->

<!--      // 初始化粒子动画-->
<!--      if (particleCanvas.value) {-->
<!--        new ParticleAnimation(particleCanvas.value);-->
<!--      }-->

<!--      // 检查DOM是否就绪-->
<!--      if (!vizElement) {-->
<!--        console.error('DOM element is not mounted yet!');-->
<!--        errorMessage.value = '图表容器未加载完成，请刷新页面重试';-->
<!--        return;-->
<!--      }-->

<!--      // 检查Neo4j驱动是否可用-->
<!--      if (!neo4jDriver) {-->
<!--        errorMessage.value = 'Neo4j 驱动未初始化！';-->
<!--        console.error(errorMessage.value);-->
<!--        return;-->
<!--      }-->

<!--      // 加载完整图数据-->
<!--      await loadFullGraph();-->

<!--      // 添加窗口大小调整监听-->
<!--      window.addEventListener('resize', () => {-->
<!--        if (chart.value) {-->
<!--          chart.value.resize();-->
<!--        }-->
<!--      });-->
<!--    };-->

<!--    onMounted(() => {-->
<!--      draw();-->
<!--    });-->

<!--    return {-->
<!--      viz1,-->
<!--      particleCanvas,-->
<!--      errorMessage,-->
<!--      searchQuery,-->
<!--      handleSearch,-->
<!--      resetGraph,-->
<!--    };-->
<!--  },-->
<!--};-->
<!--</script>-->

<!--<style scoped>-->
<!--/* 可以添加一些自定义样式 */-->
<!--</style>-->


<template>
  <div style="min-height: 500px;width: 1200px;margin: 0 auto">
    <canvas ref="particleCanvas" style="position: absolute; top: 0; left: 0; z-index: 0;"></canvas>

    <!-- 添加搜索框 -->
    <div style="margin-bottom: 20px; display: flex; justify-content: center;">
      <el-input
          v-model="searchQuery"
          placeholder="输入实体名称进行查询"
          style="width: 400px; margin-right: 10px;"
          clearable
          @keyup.enter="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="resetGraph">重置</el-button>
    </div>

    <div id="viz1" ref="viz1" style="height: 500px;"></div>
    <div v-if="errorMessage" style="color: red; margin-top: 10px;">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script>
import { inject, ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// 粒子动画配置
const particleConfig = {
  particleColor: 'rgba(255,215,0,0.5)', // 金色粒子
  particleAmount: 60,
  defaultSpeed: 0.5,
  variantSpeed: 1,
  lineColor: 'rgba(86,150,222,0.44)',
  particleRadius: 2,
};

class ParticleAnimation {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];

    this.setupCanvas();
    this.createParticles();
    this.animate();
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
    this.particles.forEach((particle) => {
      particle.x += Math.cos(particle.direction) * particle.speed;
      particle.y += Math.sin(particle.direction) * particle.speed;

      if (particle.x < 0 || particle.x > this.w) particle.direction = Math.PI - particle.direction;
      if (particle.y < 0 || particle.y > this.h) particle.direction = -particle.direction;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    // 绘制连接线
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        this.drawLine(this.particles[i], this.particles[j]);
      }
    }

    // 绘制粒子
    this.particles.forEach((particle) => this.drawParticle(particle));
    this.updateParticles();

    requestAnimationFrame(() => this.animate());
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
    const searchQuery = ref('');
    const chart = ref(null);
    const fullGraphData = ref(null); // 存储完整的图数据用于重置

    // 初始化图表
    const initChart = (graphData) => {
      console.log('Initializing chart with data:', graphData);
      const option = {
        title: {
          text: 'Neo4j 关系图',
          subtext: searchQuery.value ? `查询结果: ${searchQuery.value}` : '秦代人物关系图谱',
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
              position: 'right',
              formatter: '{b}',
              fontSize: 12,
            },
            data: graphData.nodes,
            symbolSize: 30,
            links: graphData.links.map((link) => ({
              ...link,
              type: link.type || '未知关系',
              weight: link.weight || 1,
            })),
            lineStyle: {
              color: '#6b6f6c',
              width: 2,
              curveness: 0.1,
              opacity: 0.7,
            },
            edgeSymbol: ['none', 'arrow'],
            edgeSymbolSize: 6,
            emphasis: {
              focus: 'adjacency',
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

      if (!chart.value) {
        chart.value = echarts.init(viz1.value);
      }
      chart.value.setOption(option);

      chart.value.on('click', (params) => {
        if (params.dataType === 'node') {
          router.push('Content');
        }
      });
    };

    // 执行查询并处理数据
    const executeQuery = async (query, parameters = {}) => {
      console.log('Executing query:', query, 'with parameters:', parameters);
      const session = neo4jDriver.session();
      try {
        const result = await session.run(query, parameters);
        console.log('Query result:', result);

        const data = result.records.map((record) => {
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
          return null;
        }

        return {
          nodes: [...new Set(data.flatMap((d) => [d.source, d.target]))].map((name) => ({ name })),
          links: data.map((d) => ({
            source: d.source,
            target: d.target,
            type: d.type,
            weight: d.weight,
          })),
        };
      } catch (error) {
        console.error('查询失败:', error);
        errorMessage.value = `查询失败: ${error.message}`;
        return null;
      } finally {
        await session.close();
      }
    };

    // 加载完整图数据
    const loadFullGraph = async () => {
      console.log('Loading full graph data...');
      const graphData = await executeQuery(
          'MATCH (n)-[r]->(m) ' +
          'WHERE n.name IS NOT NULL AND m.name IS NOT NULL ' +
          'RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight'
      );

      if (graphData) {
        fullGraphData.value = graphData;
        initChart(graphData);
      }
    };

    // 处理搜索
    const handleSearch = async (event) => {
      event.stopPropagation();
      console.log('Search button clicked. Search query:', searchQuery.value);
      if (!searchQuery.value.trim()) {
        ElMessage.warning('请输入查询内容');
        return;
      }

      const searchValue = searchQuery.value;
      const graphData = await executeQuery(
          `MATCH (n)-[r]->(m)
         WHERE n.name CONTAINS $searchValue OR m.name CONTAINS $searchValue
         RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
         UNION
         MATCH (n)-[r]->(m)
         WHERE n.name CONTAINS $searchValue
         RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight
         UNION
         MATCH (n)-[r]->(m)
         WHERE m.name CONTAINS $searchValue
         RETURN n.name AS source, m.name AS target, type(r) AS type, r.weight AS weight`,
          { searchValue }
      );

      if (graphData) {
        initChart(graphData);
      }
    };

    // 重置图表
    const resetGraph = (event) => {
      event.stopPropagation();
      console.log('Reset button clicked.');
      searchQuery.value = '';
      if (fullGraphData.value) {
        initChart(fullGraphData.value);
      }
    };

    const draw = async () => {
      await nextTick();
      const vizElement = viz1.value;

      // 初始化粒子动画
      if (particleCanvas.value) {
        new ParticleAnimation(particleCanvas.value);
      }

      // 检查DOM是否就绪
      if (!vizElement) {
        console.error('DOM element is not mounted yet!');
        errorMessage.value = '图表容器未加载完成，请刷新页面重试';
        return;
      }

      // 检查Neo4j驱动是否可用
      if (!neo4jDriver) {
        errorMessage.value = 'Neo4j 驱动未初始化！';
        console.error(errorMessage.value);
        return;
      }

      // 加载完整图数据
      await loadFullGraph();

      // 添加窗口大小调整监听
      window.addEventListener('resize', () => {
        if (chart.value) {
          chart.value.resize();
        }
      });
    };

    onMounted(() => {
      draw();
    });

    return {
      viz1,
      particleCanvas,
      errorMessage,
      searchQuery,
      handleSearch,
      resetGraph,
    };
  },
};
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>
