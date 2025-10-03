<template>
  <!-- 背景容器 - 固定在视口最底层 -->
  <div class="background-container" v-if="!bgLoadError">
    <!-- 备用背景 - 当图片加载失败或加载中时显示 -->
    <div class="background-fallback"></div>

    <!-- 主背景图片 -->
    <img
        class="background-image"
        :src="backgroundImageSrc"
        alt="网站背景图片"
        @load="onBackgroundLoaded"
        @error="onBackgroundError"
        ref="bgImage"
        loading="lazy"
    />
  </div>

  <!-- 主内容容器 -->
  <div class="container" :class="{ 'no-bg': bgLoadError }">
    <!-- 页面头部 -->
    <header>
      <h1>{{ pageTitle }}</h1>
      <!-- 有副标题时才显示 -->
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </header>

    <!-- 内容卡片区域 -->
    <div class="content-section">
      <!-- 循环渲染卡片，使用index作为key -->
      <div v-for="(card, index) in cards" :key="index" class="card">
        <h2>{{ card.title }}</h2>
        <p>{{ card.content }}</p>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 六边形图片展示区 -->
    <div class="hexagon-container">
      <!-- 循环渲染六边形图片，使用index作为key -->
      <div v-for="(image, index) in images" :key="index" class="hexagon-item">
        <img
            :src="image.src"
            :alt="image.alt"
            loading="lazy"
            @error="handleImageError(index)"
        />
      </div>
    </div>

    <!-- 底部卡片 -->
    <div class="card">
      <h2>{{ lastCardTitle }}</h2>
      <p>{{ lastCardContent }}</p>
    </div>

    <!-- 页脚 -->
    <footer>
      <p>{{ copyright }}</p>
    </footer>
  </div>
</template>

<script setup>
// Vue 3 Composition API
import { ref, onMounted } from 'vue';

// 响应式数据定义
const pageTitle = ref('网站主标题');
const subtitle = ref('—— 副标题文字');

const cards = ref([
  {
    title: '第一部分标题',
    content: '这里是第一部分的内容，可以详细介绍相关信息。内容段落会自动首行缩进2个字符，符合中文排版习惯。'
  },
  {
    title: '第二部分标题',
    content: '这里是第二部分的内容，可以继续添加其他信息。模板采用了响应式设计，在不同设备上都能良好显示。'
  }
]);

const images = ref([
  {
    src: new URL('@/source/qinshihuang/秦始皇1.jpg', import.meta.url).href,
    alt: '描述 '
  },
  {
    src: new URL('@/source/qinshihuang/车.jpg', import.meta.url).href,
    alt: '大一统'
  },
  {
    src: new URL('@/source/qinshihuang/书.jpg', import.meta.url).href,
    alt: '大一统'
  },
  // 可以继续添加其他图片
]);

const lastCardTitle = ref('最后部分标题');
const lastCardContent = ref('这是页面最后一部分的内容区域，可以放置总结性文字或其他信息。模板采用了现代化的设计风格，六边形图片展示区域是其特色之一。');

const copyright = ref('© 2024 公司名称 版权所有');

// 图片加载相关逻辑
const bgImage = ref(null);
const bgLoadError = ref(false);
const backgroundImageSrc = ref(
    new URL('@/source/qinshihuang/大一统.jpg', import.meta.url).href
);

const handleImageError = (index) => {
  console.error(`图片加载失败: ${images.value[index].src}`);
  // 可以设置默认图片或隐藏该六边形
  // images.value[index].src = defaultImagePath;
};

const onBackgroundLoaded = () => {
  if (bgImage.value) {
    // 添加loaded类触发过渡效果
    bgImage.value.classList.add('loaded');
  }
};

const onBackgroundError = () => {
  bgLoadError.value = true;
  console.error('背景图片加载失败:', backgroundImageSrc.value);
};

onMounted(() => {
  if (bgImage.value?.complete) {
    onBackgroundLoaded();
  }
});
</script>

<style scoped>
/* CSS变量定义 */
:root {
  --header-border: #3498db;
  --title-color: #2c3e50;
  --subtitle-color: #7f8c8d;
  --card-title-color: #e74c3c;
  --card-border: #3498db;
  --footer-bg: rgba(44, 62, 80, 0.9);
  --footer-text: #ecf0f1;
  --bg-fallback: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  --container-bg: rgba(255, 255, 255, 0.85);
  --content-section-gap: 30px;
  --hexagon-item-width: 280px;
  --hexagon-item-height: 280px;
  --hexagon-item-gap: 30px;
  --card-padding: 30px;
  --card-min-width: 300px;
  --card-max-width: 500px;
  --p-line-height: 1.8;
}

/* 全局重置样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 基础页面样式 */
body {
  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  min-height: 100vh;
  position: relative;
}

/* 背景容器样式 */
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

/* 备用背景 - 渐变背景 */
.background-fallback {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--bg-fallback);
}

/* 主背景图片样式 */
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

/* 图片加载完成后的样式 */
.background-image.loaded {
  opacity: 1;
  filter: blur(0);
}

/* 主体内容容器 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  background: var(--container-bg);
  min-height: 100vh;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

/* 无背景时的容器样式 */
.container.no-bg {
  background: var(--bg-fallback);
}

/* 头部样式 */
header {
  text-align: center;
  padding: 40px 0;
  border-bottom: 3px solid var(--header-border);
  margin-bottom: 30px;
}

/* 主标题样式 */
h1 {
  font-family: 'STXingkai', '华文行楷', cursive;
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  color: var(--title-color);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  margin-bottom: 15px;
}

/* 副标题样式 */
.subtitle {
  color: var(--subtitle-color);
  font-size: 1.2rem;
}

/* 内容区域布局 */
.content-section {
  display: flex;
  gap: var(--content-section-gap);
  padding: 20px 0;
  flex-wrap: wrap;
  justify-content: center;
}

/* 卡片样式 */
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

/* 卡片悬停效果 */
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* 二级标题样式 */
h2 {
  color: var(--card-title-color);
  font-family: 'STKaiti', '楷体', cursive;
  border-left: 5px solid var(--card-border);
  padding-left: 15px;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

/* 段落文本样式 */
p {
  text-indent: 2em;
  margin-bottom: 15px;
  font-size: 1rem;
  line-height: var(--p-line-height);
  text-align: justify;
}

/* 分隔线样式 */
.divider {
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--header-border), transparent);
  margin: 60px 0;
  position: relative;
}

/* 分隔线中间的装饰元素 */
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

/* 六边形图片容器 */
.hexagon-container {
  display: flex;
  justify-content: center;
  gap: var(--hexagon-item-gap);
  margin: 40px 0;
  flex-wrap: wrap;
}

/* 单个六边形项目 */
.hexagon-item {
  width: var(--hexagon-item-width);
  height: var(--hexagon-item-height);
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  padding: 5px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

/* 六边形悬停效果 */
.hexagon-item:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* 六边形内图片样式 */
.hexagon-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  transition: transform 0.3s ease;
}

.hexagon-item:hover img {
  transform: scale(1.05);
}

/* 页脚样式 */
footer {
  text-align: center;
  padding: 20px;
  background: var(--footer-bg);
  color: var(--footer-text);
  margin-top: 40px;
  border-radius: 5px;
}

/* 响应式设计 - 适配不同屏幕 */
@media (max-width: 1024px) {
  :root {
    --content-section-gap: 20px;
    --hexagon-item-width: 240px;
    --hexagon-item-height: 240px;
    --hexagon-item-gap: 20px;
    --card-padding: 25px;
    --card-min-width: 250px;
    --p-line-height: 1.7;
  }
}

@media (max-width: 768px) {
  :root {
    --content-section-gap: 15px;
    --hexagon-item-width: 200px;
    --hexagon-item-height: 200px;
    --hexagon-item-gap: 15px;
    --card-padding: 20px;
    --card-min-width: 100%;
    --p-line-height: 1.6;
  }

  h1 {
    font-size: 2.2rem;
  }
}

@media (max-width: 480px) {
  :root {
    --content-section-gap: 10px;
    --hexagon-item-width: 160px;
    --hexagon-item-height: 160px;
    --hexagon-item-gap: 10px;
    --card-padding: 15px;
    --p-line-height: 1.5;
  }

  .container {
    padding: 20px 15px;
  }

  h1 {
    font-size: 1.8rem;
  }
}
</style>