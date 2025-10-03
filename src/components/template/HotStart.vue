
<template>
  <div class="background-container" v-if="!bgLoadError">
    <div class="background-fallback"></div>
    <img
        class="background-image"
        :src="resolveBackgroundImagePath(backgroundImageSrc)"
        alt="网站背景图片"
        @load="onBackgroundLoaded"
        @error="onBackgroundError"
        ref="bgImage"
        loading="lazy"
    />
  </div>
  <div class="container" :class="{ 'no-bg': bgLoadError }">
    <!-- 导航按钮 - 放置在右上方 -->
    <div class="navigation-buttons">
      <button @click="navigateToKnowledgeGraph('character')" :class="{ 'active': activeTab === 'character' }">
        人物关系图谱
      </button>
      <button @click="navigateToKnowledgeGraph('event')" :class="{ 'active': activeTab === 'event' }">
        事件关系图谱
      </button>
      <button @click="navigateToKnowledgeGraph('nationality')" :class="{ 'active': activeTab === 'nationality' }">
        民族关系图谱
      </button>
    </div>

    <div v-if="isLoading">
      <p>正在加载数据...</p>
    </div>

    <div v-else>
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
          <img
              :src="resolveImagePath(image.src)"
              :alt="image.alt"
              loading="lazy"
              @error="handleImageError(index)"
          />
        </div>
      </div>

      <div class="card">
        <h2>{{ lastCardTitle }}</h2>
        <p>{{ lastCardContent }}</p>
      </div>

      <footer class="custom-footer">
        <p>{{ copyright }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

// 响应式数据
const pageTitle = ref('');
const subtitle = ref('');
const cards = ref([]);
const images = ref([]);
const lastCardTitle = ref('');
const lastCardContent = ref('');
const copyright = ref('');
const backgroundImageSrc = ref('');
const bgLoadError = ref(false);
const bgImage = ref(null);
const isLoading = ref(true);
const activeTab = ref('character'); // 当前激活的标签
const themeParam = ref('');

const route = useRoute();
const router = useRouter();

// 导航到知识图谱 - 使用路径和查询参数
const navigateToKnowledgeGraph = (namespace) => {
  console.log(`准备导航到 DropQuery，命名空间: ${namespace}`);

  try {
    // 直接使用路径和查询参数进行导航
    //router.push(`/dropQuery?namespace=${namespace}`);
    //console.log(`成功导航到 /dropQuery?namespace=${namespace}`);


    // 直接使用路径和查询参数进行导航，同时传递theme参数
    router.push(`/dropQuery?namespace=${namespace}&theme=${themeParam.value}`);

    console.log(`成功导航到 /dropQuery?namespace=${namespace}&theme=${themeParam.value}`);



    activeTab.value = namespace;
  } catch (error) {
    console.error('导航失败:', error);
    // 可以添加用户友好的错误提示
    alert('导航失败，请稍后再试');
  }
};
// 加载数据
const loadData = async (theme) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/data/${theme}`);
    const data = response.data;
    pageTitle.value = data.pageTitle;
    subtitle.value = data.subtitle;
    cards.value = data.cards;
    images.value = data.images;
    lastCardTitle.value = data.lastCardTitle;
    lastCardContent.value = data.lastCardContent;
    copyright.value = data.copyright;
    backgroundImageSrc.value = data.backgroundImageSrc;
  } catch (error) {
    console.error('数据请求失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 监听路由参数变化
watch(
    () => route.params.theme,
    (newTheme) => {
      if (newTheme) {
        loadData(newTheme);
      } else {
        console.error('主题参数未获取到');
        isLoading.value = false;
      }
    },
    { immediate: true }
);


// 图片错误处理
const handleImageError = (index) => {
  console.error(`图片加载失败: ${images.value[index].src}`);
};

// 背景图片加载完成
const onBackgroundLoaded = () => {
  if (bgImage.value) {
    bgImage.value.classList.add('loaded');
  }
};

// 背景图片加载失败
const onBackgroundError = () => {
  bgLoadError.value = true;
  console.error('背景图片加载失败:', backgroundImageSrc.value);
};

// 解析图片路径
const resolveImagePath = (path) => {
  return `${import.meta.env.BASE_URL}${path.replace('@', '')}`;
};

// 解析背景图片路径
const resolveBackgroundImagePath = (path) => {
  return `${import.meta.env.BASE_URL}${path.replace('@', '')}`;
};

// 组件挂载时加载数据
onMounted(async () => {
  if (route.params.theme) {
    themeParam.value = route.params.theme;
    console.log('从路由参数获取theme:', themeParam.value);
    loadData(themeParam.value);
  } else {
    console.error('主题参数未获取到');
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* 导航按钮样式 - 放置在右上方 */
.navigation-buttons {
  position: relative; /* 固定定位，不随页面滚动 */
  top: 20px; /* 距离顶部20px */
  right: 20px; /* 距离右侧20px */
  display: flex; /* 使用flex布局 */
  gap: 10px; /* 按钮之间的间距 */
  z-index: 1000; /* 确保按钮在其他内容之上 */
}

.navigation-buttons button {
  padding: 8px 16px; /* 按钮内边距 */
  border: none; /* 无边框 */
  border-radius: 4px; /* 圆角 */
  background: rgba(255, 255, 255, 0.8); /* 半透明白色背景 */
  color: #333; /* 深灰色文字 */
  font-weight: bold; /* 加粗文字 */
  cursor: pointer; /* 鼠标指针变为手型 */
  transition: all 0.3s ease; /* 平滑过渡效果 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加轻微阴影 */
}

.navigation-buttons button:hover {
  background: rgba(255, 255, 255, 0.95); /* 鼠标悬停时背景变亮 */
  transform: translateY(-2px); /* 向上浮动效果 */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* 阴影增强 */
}

/* 激活状态的按钮样式 */
.navigation-buttons button.active {
  background: #3498db; /* 蓝色背景 */
  color: white; /* 白色文字 */
}

:root {
  --header-border: #3498db;
  --title-color: #c7ab20;
  --subtitle-color: #7f8c8d;
  --card-title-color: #e74c3c;
  --card-border: #3498db;
  --footer-bg: rgba(238, 229, 229, 0.96);
  --footer-text: #F5F7FAFF;
  --bg-fallback: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --container-bg: rgba(255, 255, 255, 0.85);
  --content-section-gap: 30px;
  --hexagon-item-width: 300px;
  --hexagon-item-height: 300px;
  --hexagon-item-gap: 30px;
  --card-padding: 30px;
  --card-min-width: 300px;
  --card-max-width: 500px;
  --p-line-height: 1.8;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  min-height: 100vh;
  position: relative;
}

.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.background-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-fallback);
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  transition: opacity 0.8s ease, filter 0.8s ease;
  filter: blur(8px);
}

.background-image.loaded {
  opacity: 1;
  filter: blur(0);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background: var(--container-bg);
  min-height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.container.no-bg {
  background: var(--bg-fallback);
}

header {
  text-align: center;
  padding: 40px 0;
  border-bottom: 3px solid var(--header-border);
  margin-bottom: 30px;
}

h1 {
  font-family: 'STXingkai', '华文行楷', cursive;
  font-size: 3.5rem;
  color: var(--title-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
}

.subtitle {
  color: var(--subtitle-color);
  font-size: 1.2rem;
}

.content-section {
  display: flex;
  gap: var(--content-section-gap);
  padding: 20px 0;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  flex: 1;
  min-width: var(--card-min-width);
  max-width: var(--card-max-width);
  background: rgba(255, 255, 255, 0.9);
  padding: var(--card-padding);
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

h2 {
  color: var(--card-title-color);
  font-family: 'STKaiti', '楷体', cursive;
  border-left: 5px solid var(--card-border);
  padding-left: 15px;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

p {
  text-indent: 2em;
  margin-bottom: 15px;
  font-size: 1rem;
  line-height: var(--p-line-height);
  text-align: justify;
}

.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--header-border), transparent);
  margin: 60px 0;
  position: relative;
}

.divider::after {
  content: "✻";
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--container-bg);
  padding: 0 15px;
  color: var(--header-border);
  font-size: 1.5rem;
}

.hexagon-container {
  display: flex;
  justify-content: center;
  gap: var(--hexagon-item-gap);
  margin: 40px 0;
  flex-wrap: wrap;
}

.hexagon-item {
  width: 300px;
  height: 300px;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.hexagon-item:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.hexagon-item img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  transition: transform 0.3s ease;
}

.hexagon-item:hover img {
  transform: scale(1.05);
}

.custom-footer {
  text-align: center;
  padding: 20px;
  background: var(--footer-bg);
  color: var(--footer-text);
  margin-top: 40px;
  border-radius: 5px;
}
</style>