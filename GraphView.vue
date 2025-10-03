<template>
  <div class="myDiv">
    <div id="viz"></div>
    <div class="controls">
      <div class="input-row">
        <input type="text" v-model="searchInput" placeholder="请输入要查找的景点名称" class="search-input">
        <button @click="search" class="search-button">搜索</button>
        <button @click="clearGraph" class="clear-button">清空</button>
      </div>
      <div class="input-row">
        请输入您要查询的距离范围：
        <input type="number" v-model.number="threshold" placeholder="景点相距多少公里以内" style="height: 40px">
        <button @click="find" class="find-button">查找</button>
      </div>
      <div class="input-row">
        请输入您要查询的驾车时间范围：
        <input type="number" v-model.number="time" placeholder="驾车多少小时以内" style="height: 40px">
        <button @click="findTime" class="find-button">查找</button>
      </div>

      <div class="button-row">
        <el-button type="success" plain @click="showRoadTrip">驾车一日游</el-button>
        <el-button type="success" plain @click="showRoadTrip1">驾车三日游</el-button>
      </div>

    </div>
  </div>
</template>

<script>
import NeoVis from 'neovis.js/dist/neovis.js';
import $ from 'jquery';

export default {
  data() {
    return {
      viz: {},
      searchInput: '',
      initialCypher: "MATCH p=()-->() RETURN p ORDER BY RAND() LIMIT 40",
      threshold: null,
      searchPlaceName: '',
      time: null,
    };
  },
  mounted() {
    this.draw();
  },
  methods: {
    draw() {
      const config = {
        containerId: "viz",
        neo4j: {
          serverUrl: 'bolt://localhost:7687',
          serverUser: 'neo4j',
          serverPassword: '123456',
        },
        labels: {
          "Place": {
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
        arrows: false,
        hierarchical: true,
        initialization: "random",
        hierarchicalSeparation: 500,
        initialCypher: this.initialCypher,
      };
      this.viz = new NeoVis(config);
      this.viz.render();
    },
    search() {
      const placeName = this.searchInput.trim();
      if (placeName) {
        this.searchPlaceName = placeName;
        const cypher = `MATCH (p:Place)-[r]-(related) WHERE p.name CONTAINS "${placeName}" RETURN p, r, related`;
        this.viz.renderWithCypher(cypher);
      }
    },
    find() {
      const threshold = this.threshold;
      const searchedPlaceName = this.searchPlaceName;
      if (searchedPlaceName) {
        const cypher = `MATCH (p:Place)-[r:DISTANCE]-(related) WHERE toFloat(r.distance1) < ${threshold} AND p.name CONTAINS "${searchedPlaceName}" RETURN p, r, related`;
        this.viz.renderWithCypher(cypher);
      } else {
        const cypher = `MATCH (p:Place)-[r:DISTANCE]-(related) WHERE toFloat(r.distance1) < ${threshold} RETURN p, r, related ORDER BY toFloat(r.distance1) DESC LIMIT 100`;
        this.viz.renderWithCypher(cypher)
      }

    },
    findTime() {
      const time = this.time;
      // const threshold = this.threshold;
      const searchedPlaceName = this.searchPlaceName;
      if (searchedPlaceName) {
        const cypher = `MATCH (p:Place)-[r:DISTANCE]-(related) WHERE toFloat(r.time1) < ${time} AND p.name CONTAINS "${searchedPlaceName}" RETURN p, r, related`;
        this.viz.renderWithCypher(cypher);
      } else {
        const cypher = `MATCH (p:Place)-[r:DISTANCE]-(related) WHERE toFloat(r.time1) < ${time} RETURN p, r, related ORDER BY toFloat(r.time1) DESC LIMIT 100`;
        this.viz.renderWithCypher(cypher);
      }
    },
    clearGraph() {
      this.searchInput = '';
      this.searchPlaceName = '';
      this.threshold = null;
      this.time = null;
      this.viz.renderWithCypher(this.initialCypher);
    },
    async showRoadTrip() {
      const cypher = `
        MATCH path=(p1:Place)-[t1:DISTANCE]-(p2:Place)-[t2:DISTANCE]-(p3:Place)
        WHERE toFloat(t1.time1) < 0.5 AND toFloat(t2.time1) < 0.5
        WITH p1, p2, p3, t1, t2, path
        RETURN p1, p2, p3, t1, t2, path
        ORDER BY rand()
        LIMIT 1
      `;
      try {
        await this.viz.renderWithCypher(cypher);
      } catch (error) {
        console.error('系统异常，请稍后再试:', error);
      }
    },
    async showRoadTrip1() {
      const cypher = `
      MATCH path=(p1:Place)-[t1:DISTANCE]-(p2:Place)-[t2:DISTANCE]-(p3:Place)-[t3:DISTANCE]-(p4:Place)-[t4:DISTANCE]-(p5:Place)-[t5:DISTANCE]-(p6:Place)
      WHERE toFloat(t1.time1) < 0.5 AND toFloat(t2.time1) < 0.5 AND toFloat(t3.time1) < 0.5 AND toFloat(t4.time1) < 0.5 AND toFloat(t5.time1) < 0.5
      WITH p1, p2, p3, p4, p5, t1, t2, t3, t4, t5, path
      RETURN p1, p2, p3, p4, p5, t1, t2, t3, t4, t5, path
      LIMIT 1
  `;
      try {
        await this.viz.renderWithCypher(cypher);
      } catch (error) {
        console.error('系统异常，请稍后再试:', error);
      }
    },

  }
};
</script>

<style scoped>
.myDiv {
  width: 1300px;
  height: 800px;
}
textarea {
  border: 1px solid lightgray;
  margin: 5px;
  border-radius: 5px;
}
#viz {
  width: 90%;
  height: 100%;
}
.input-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.search-input {
  width: 200px;
  height: 40px;
}
.search-button,
.clear-button,
.submit-button,
.find-button,
.stabilize-button {
  width: 80px;
  height: 40px;
  margin-left: 10px;
}
.button-row {
  display: flex;
  justify-content: flex-start;
}
</style>