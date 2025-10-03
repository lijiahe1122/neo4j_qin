<template>
  <div style="min-height: 500px; width: 1200px; margin: 0 auto">
    <canvas ref="particleCanvas" style="position: absolute; top: 0; left: 0; z-index: 0;"></canvas>
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
import axios from 'axios';

// 粒子动画配置
const particleConfig = {
  particleColor: 'rgba(255, 215, 0, 0.5)', // 金色粒子
  particleAmount: 60,
  defaultSpeed: 0.5,
  variantSpeed: 1,
  lineColor: 'rgba(86, 150, 222, 0.44)',
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
    const distance = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));
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
    this.particles.forEach(particle => this.drawParticle(particle));
    this.updateParticles();

    requestAnimationFrame(() => this.animate());
  }
}

export default {
  name: 'GraphVisualization',
  setup() {
    const viz1 = ref(null);
    const errorMessage = ref('');
    const neo4jDriver = inject('$neo4j'); // 注入 Neo4j 驱动
    const particleCanvas = ref(null);
    const router = useRouter();

    const draw = async () => {
      await nextTick();
      const vizElement = viz1.value;

      // 初始化粒子动画
      if (particleCanvas.value) {
        new ParticleAnimation(particleCanvas.value);
      }

      // 1. 检查 DOM 是否就绪
      if (!vizElement) {
        console.error('DOM element is not mounted yet!');
        errorMessage.value = '图表容器未加载完成，请刷新页面重试';
        return;
      }

      // 2. 检查 Neo4j 驱动是否可用
      if (!neo4jDriver) {
        errorMessage.value = 'Neo4j 驱动未初始化！';
        console.error(errorMessage.value);
        return;
      }

      // 3. 执行查询并处理数据
      const session = neo4jDriver.session();
      try {
        const result = await session.run(
            'MATCH (n:character_Entity)-[r]->(m:character_Entity) ' +
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
          title: {
            text: 'Neo4j 关系图',
            subtext: '秦代人物关系图谱',
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
              links: graphData.links.map(link => ({
                ...link,
                type: link.type || '未知关系',
                weight: link.weight || 1,
              })),
              // 关键修改：确保边始终可见，且悬停时才显示 tooltip
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
                // 边悬停时显示 tooltip，但不隐藏边
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

        chart.on('click', async (params) => {
          if (params.dataType === 'node') {
            const entityName = params.name;
            try {
              //'http://localhost:3001/api/search-theme'
              //'api/search - theme',
              const response = await axios.get('http://localhost:3001/api/search-theme', {
                params: {
                  entity: entityName
                }
              });
              const themeData = response.data;
              if (themeData.length > 0) {
                const theme = themeData[0].theme;
                router.push(`/reuse/${theme}`);
              } else {
                console.log('未找到相关主题');
              }
            } catch (error) {
              console.error('查询主题失败:', error);
              console.error('错误详情:', error.response ? error.response.data : error.message);
            }
          }
        });

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
      particleCanvas,
      errorMessage,
    };
  },
};
</script>

<style scoped>
/* 移除未使用的样式 */
</style>