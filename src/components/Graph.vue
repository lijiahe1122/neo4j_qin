<template>
<!--  <div class="content" >-->
<!--    <div style="height:100%;" ref="Screen">-->
<!--      <div class="left" id="viz1" ref="viz1"></div>-->
<!--    </div>-->
<!--  </div>-->
<div style="min-height: 500px;width: 1200px;margin: 0 auto">
  <div  id="viz1" ref="viz1" style="height: 500px;"></div>
</div>
</template>
<script>
import NeoVis from 'neovis.js';
export default {
  data() {
    return {
      databaseName: 'neo4j',
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.draw();
    });
  },
  methods: {
    draw() {
      const viz1 = this.$refs.viz1;
      if (!viz1) {
        console.error('DOM element is not mounted yet!');
        return;
      }
      const config = {
            containerId: "viz1",
            neo4j: {  // 添加认证信息
              serverUrl: "bolt://localhost:7687", // 协议改为 bolt（推荐）
              serverUser: "neo4j",              // 默认用户名
              serverPassword: "123456789",          // 默认密码（根据实际修改）
            },
            labels: {
              "Entity": {
                label: "name",
                size: 200,
                font: {
                  size: 35,
                  color: "rgba(153,255,0,0.7)"
                }
              }
            },
            relationships: {
              "DISTANCE": {
                "title": "distance",
                "thickness": "weight",
                "caption": true,
              font: {
                size: 15,
                color: "rgb(80,115,255)"
              }
            }
          },
          arrows: true,
          hierarchical: true,
          hierarchical_sort_method: 'directed',
          initialCypher: "MATCH (n)-[r]->(m) RETURN n, r, m",
          // style: {
          //   height: '100%',
          //   width: '100%'
          // }
    };
    try {
      const viz = new NeoVis(config);
      console.log('NeoVis initialized successfully');
      viz.render();
      console.log('Rendering completed');
    } catch (error) {
      console.error('Error initializing NeoVis:', error);
    }
    // const viz = new NeoVis(config);
    // viz.render();
  },
}
}
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

