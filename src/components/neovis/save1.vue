<template>
  <div class="myDiv">
    <div id="viz"></div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import NeoVis from 'neovis.js/dist/neovis.js'; // 确保路径正确

const viz = ref(null);
const initialCypher = "MATCH (n)-[r:一名]->(m) RETURN n, r, m";

onMounted(() => {
  draw();
});

const draw = () => {
  const config = {
    containerId: "viz",
    neo4j: {
      serverUrl: 'bolt://localhost:7687',
      serverUser: 'neo4j',
      serverPassword: '123456789',
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
      "一名": {
        "title": "一名",
        "thickness": "weight", // 确保关系属性存在
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
    initialCypher: initialCypher,
  };

  viz.value = new NeoVis(config);
  viz.value.render();
};
</script>