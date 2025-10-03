<template>
  <div class="container">
    <header>
      <h1>{{ pageTitle }}</h1>
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </header>
    <div class="content-section">
      <div v-for="(card, index) in cards" :key="index" class="card">
        <h2>{{ card.title }}</h2>
        <p>{{ card.content }}</p>
      </div>
    </div>
    <div class="divider"></div>
    <div class="hexagon-container">
      <div v-for="(image, index) in images" :key="index" class="hexagon-item">
        <img :src="image.src" :alt="image.alt" />
      </div>
    </div>
    <div class="card">
      <h2>{{ lastCardTitle }}</h2>
      <p>{{ lastCardContent }}</p>
    </div>
    <footer>
      <p>{{ copyright }}</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 页面数据
const pageTitle = ref('秦始皇');
const subtitle = ref('—— 主要功绩');
const cards = ref([
  {
    title: '统一六国',
    content: '先后灭韩、赵、魏、楚、燕、齐六国，结束春秋战国500余年分裂，建立中国首个中央集权制王朝——秦朝。'
  },
  {
    title: '车同轨、书同文',
    content: '统一全国马车轮距（轨距为六尺），修建驰道（国家级道路网）。废除六国异体字，推行小篆（后简化為隶书）为官方文字。'
  }
]);
const images = ref([
  {
    src: '@/source/qinshihuang/秦始皇1.jpg',
    alt: '统一六国'
  },
  {
    src: '@/source/qinshihuang/车.jpg',
    alt: '车同轨'
  },
  {
    src: '@/source/qinshihuang/书.jpg',
    alt: '书同文'
  }
]);
const lastCardTitle = ref('主要事迹');
const lastCardContent = ref('秦始皇（前259—前210年）统一六国，建立中国首个中央集权王朝；推行“车同轨、书同文、行同伦”，统一度量衡；修筑长城、驰道，奠定大一统基础，影响中国两千余年。');
const copyright = ref('© 替换为版权信息');
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: '宋体', SimSun, serif;
  line-height: 1.6;
  background: url('@/source/qinshihuang/大一统.jpg') no-repeat center center fixed;
  background-size: cover;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background: transparent;
  min-height: 100vh;
}

header {
  text-align: center;
  padding: 40px 0;
  border-bottom: 3px solid #替换为头部边框颜色;
}

h1 {
  font-family: '华文行楷', STXingkai, cursive;
  font-size: 3.5em;
  color: #替换为标题颜色;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.content-section {
  display: flex;
  gap: 30px;
  padding: 20px 0;
  flex-wrap: wrap;
}

.card {
  flex: 1;
  min-width: 300px;
  background: rgba(255, 255, 255, 0.8);
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

h2 {
  color: #替换为二级标题颜色;
  font-family: '楷体', Kaiti, cursive;
  border-left: 5px solid #替换为二级标题左边框颜色;
  padding-left: 15px;
  margin-bottom: 20px;
}

p {
  text-indent: 2em;
  margin-bottom: 15px;
  font-size: 16px;
  line-height: 1.8;
}

.divider {
  width: 100%;
  height: 80px;
  background: url('替换为分隔线图片路径') repeat-x;
  margin: 40px 0;
  opacity: 0.8;
}

footer {
  text-align: center;
  padding: 20px;
  background: rgba(替换为页脚背景颜色, 0.9);
  color: #替换为页脚文字颜色;
  margin-top: 40px;
}

.hexagon-container {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: -150px 0 50px;
  flex-wrap: wrap;
}

.hexagon-item {
  width: 300px;
  height: 300px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px;
}

.hexagon-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.5em;
  }
  .hexagon-item {
    width: 250px;
    height: 250px;
  }
}
</style>
