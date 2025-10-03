//详细错误: Error: Neo4j 驱动实例无效！


<template>
  <view class="content">
    <!-- 加载状态提示 -->
    <div v-if="isLoading" class="loading">加载中...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- 可视化容器 -->
<!--    <div style="height: 100%;" ref="Screen">-->
<!--      <div class="left" id="viz1" ref="viz1"></div>-->
<!--    </div>-->
    <div style="min-height: 500px;width: 1200px;margin: 0 auto">
      <div  id="viz1" ref="viz1" style="height: 500px;"></div>
    </div>
  </view>
</template>

<script>
import { defineComponent, inject, onMounted, onUnmounted, ref } from 'vue'
import NeoVis from 'neovis.js'
import neo4j from 'neo4j-driver';

export default defineComponent({
  name: 'NeoVisComponent',
  setup() {
    const viz1 = ref(null)
    const neo4jDriver = inject('$neo4j') // 注入驱动
    const isLoading = ref(true)
    const error = ref(null)

    // 定义关系颜色映射（动态从数据库获取时备用）
    const relationshipColorMap = {
      "主要功绩": "#FFE66D",
      "儿子": "#4ECDC4",
      "侄子": "#FF6B6B",
      "制度改革": "#6B5B95",
      "默认": "#5073FF"
    }

    // 动态获取所有关系类型
    const getRelationshipTypes = async () => {
      try {
        if (!neo4jDriver) throw new Error('Neo4j 驱动未注入')

        const session = neo4jDriver.session()
        const result = await session.run(
            "MATCH ()-[r]->() RETURN DISTINCT type(r) AS type"
        )
        session.close()
        return result.records.map(record => record.get("type"))
      } catch (err) {
        error.value = `获取关系类型失败: ${err.message}`
        return []
      }
    }

    // 动态生成 relationships 配置
    const buildRelationshipsConfig = (types) => {
      const defaultStyle = {
        font: { size: 15, color: "#5073FF" },
        thickness: "weight",
        arrows: true,
        caption: true
      }

      return types.reduce((acc, type) => {
        acc[type] = {
          ...defaultStyle,
          title: type,
          color: relationshipColorMap[type] || relationshipColorMap["默认"],
          // 特殊关系覆盖样式
          ...(type === "国际地位" ? { arrows: "to", caption: false } : {}),
          ...(type === "军事行动" ? { thickness: "count" } : {})
        }
        return acc
      }, {})
    }

    // 初始化可视化
    const draw = async () => {
      try {
        isLoading.value = true
        error.value = null

        const neo4jDriver = inject('$neo4j');
        if (!neo4jDriver || typeof neo4jDriver.executeQuery !== 'function') {
          throw new Error('Neo4j 驱动实例无效！');
        }

        const relationshipTypes = await getRelationshipTypes()
        const relationships = buildRelationshipsConfig(relationshipTypes)

        const config = {
          containerId: 'viz1',
          neo4j: {
            serverUrl: 'bolt://localhost:7687',
            serverUser: 'neo4j',
            serverPassword: '123456789'
          },
          labels: {
            'Entity': {
              label: 'name',
              size: 200,
              font: { size: 35, color: 'rgba(153,255,0,0.7)' }
            }
          },
          relationships,
          arrows: true,
          hierarchical: true,
          initialCypher: 'MATCH (n)-[r]->(m) RETURN n, r, m',
          style: { height: '100%', width: '100%' }
        }

        const viz = new NeoVis(config)
        await viz.render()
        isLoading.value = false

        // const cypher = "MATCH (n)-[r]->(m) RETURN n, r, m";
        // console.log("Executing Cypher:", cypher); // 检查输出是否正常
        // await viz.renderWithCypher(neo4jDriver, cypher);

//解决了半天是否得出结论NeoVis不适合用驱动eject注入渲染,以下是修改的部分，本来打算把上面账号密码去掉

       // const viz = new NeoVis(config);
        //await viz.renderWithCypher(neo4jDriver, "MATCH (n)-[r]->(m) RETURN n, r, m");


        // // 1. 强制生成一个全新的会话
        // const session = neo4jDriver.session();
        //
        // // 2. 直接使用会话执行 Cypher（绕过 NeoVis 的校验）
        // const result = await session.run("MATCH (n) RETURN n LIMIT 1");
        // console.log('查询结果:', result.records); // 确认是否能获取数据
        //
        // // 3. 使用 NeoVis 渲染（确保 Cypher 已验证）
        // const cypher = "MATCH (n) RETURN n LIMIT 1";
        // const viz = new NeoVis(config);
        // await viz.renderWithCypher(neo4jDriver, cypher);



      } catch (err) {
        console.error('详细错误:', err); // 打印完整错误信息
        error.value = `可视化初始化失败: ${err.message}`
        isLoading.value = false
      }
    }

    // 生命周期管理
    onMounted(() => {
      draw()
    })

    onUnmounted(() => {
      // 清理 NeoVis 实例
      if (viz1.value) {
        viz1.value.destroy()
      }
    })

    return { viz1, isLoading, error }
  }
})
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

.loading {
  font-size: 20px;
  color: #666;
}

.error {
  color: #ff4444;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>

