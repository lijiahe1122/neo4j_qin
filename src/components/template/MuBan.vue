<!--<template>-->
<!--  &lt;!&ndash; 背景容器 - 固定在视口最底层 &ndash;&gt;-->
<!--  <div class="background-container" v-if="!bgLoadError">-->
<!--    &lt;!&ndash; 备用背景 - 当图片加载失败或加载中时显示 &ndash;&gt;-->
<!--    <div class="background-fallback"></div>-->

<!--    &lt;!&ndash; 主背景图片 &ndash;&gt;-->
<!--    <img-->
<!--        class="background-image"-->
<!--        :src="backgroundImageSrc"-->
<!--        alt="网站背景图片"-->
<!--        @load="onBackgroundLoaded"-->
<!--        @error="onBackgroundError"-->
<!--        ref="bgImage"-->
<!--        loading="lazy"-->
<!--    />-->
<!--  </div>-->

<!--  &lt;!&ndash; 主内容容器 &ndash;&gt;-->
<!--  <div class="container" :class="{ 'no-bg': bgLoadError }">-->
<!--    &lt;!&ndash; 页面头部 &ndash;&gt;-->
<!--    <header>-->
<!--      <h1>{{ pageTitle }}</h1>-->
<!--      &lt;!&ndash; 有副标题时才显示 &ndash;&gt;-->
<!--      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>-->
<!--    </header>-->

<!--    &lt;!&ndash; 内容卡片区域 &ndash;&gt;-->
<!--    <div class="content-section">-->
<!--      &lt;!&ndash; 循环渲染卡片，使用index作为key &ndash;&gt;-->
<!--      <div v-for="(card, index) in cards" :key="index" class="card">-->
<!--        <h2>{{ card.title }}</h2>-->
<!--        <p>{{ card.content }}</p>-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; 分隔线 &ndash;&gt;-->
<!--    <div class="divider"></div>-->

<!--    &lt;!&ndash; 六边形图片展示区 &ndash;&gt;-->
<!--    <div class="hexagon-container">-->
<!--      &lt;!&ndash; 循环渲染六边形图片，使用index作为key &ndash;&gt;-->
<!--      <div v-for="(image, index) in images" :key="index" class="hexagon-item">-->
<!--        <img-->
<!--            :src="image.src"-->
<!--            :alt="image.alt"-->
<!--            loading="lazy"-->
<!--            @error="handleImageError(index)"-->
<!--        />-->
<!--      </div>-->
<!--    </div>-->

<!--    &lt;!&ndash; 底部卡片 &ndash;&gt;-->
<!--    <div class="card">-->
<!--      <h2>{{ lastCardTitle }}</h2>-->
<!--      <p>{{ lastCardContent }}</p>-->
<!--    </div>-->

<!--    &lt;!&ndash; 页脚 &ndash;&gt;-->
<!--    <footer class="custom - footer">-->
<!--      <p>{{ copyright }}</p>-->
<!--    </footer>-->
<!--  </div>-->
<!--</template>-->

<!--<script setup>-->
<!--// Vue 3 Composition API-->
<!--import { ref, onMounted } from 'vue';-->

<!--// 响应式数据定义-->
<!--const pageTitle = ref('网站主标题');-->
<!--const subtitle = ref('—— 副标题文字');-->

<!--const cards = ref([-->
<!--  {-->
<!--    title: '第一部分标题',-->
<!--    content: '这里是第一部分的内容，可以详细介绍相关信息。内容段落会自动首行缩进2个字符，符合中文排版习惯。'-->
<!--  },-->
<!--  {-->
<!--    title: '第二部分标题',-->
<!--    content: '这里是第二部分的内容，可以继续添加其他信息。模板采用了响应式设计，在不同设备上都能良好显示。'-->
<!--  }-->
<!--]);-->

<!--const images = ref([-->
<!--  {-->
<!--    src: new URL('@/source/qinshihuang/秦始皇1.jpg', import.meta.url).href,-->
<!--    alt: '描述 '-->
<!--  },-->
<!--  {-->
<!--    src: new URL('@/source/qinshihuang/车.jpg', import.meta.url).href,-->
<!--    alt: '大一统'-->
<!--  },-->
<!--  {-->
<!--    src: new URL('@/source/qinshihuang/书.jpg', import.meta.url).href,-->
<!--    alt: '大一统'-->
<!--  },-->
<!--  // 可以继续添加其他图片-->
<!--]);-->

<!--const lastCardTitle = ref('最后部分标题');-->
<!--const lastCardContent = ref('这是页面最后一部分的内容区域，可以放置总结性文字或其他信息。模板采用了现代化的设计风格，六边形图片展示区域是其特色之一。');-->

<!--const copyright = ref('© 2024 公司名称 版权所有');-->

<!--// 图片加载相关逻辑-->
<!--const bgImage = ref(null);-->
<!--const bgLoadError = ref(false);-->
<!--const backgroundImageSrc = ref(-->
<!--    new URL('@/source/qinshihuang/大一统.jpg', import.meta.url).href-->
<!--);-->

<!--const handleImageError = (index) => {-->
<!--  console.error(`图片加载失败: ${images.value[index].src}`);-->
<!--  // 可以设置默认图片或隐藏该六边形-->
<!--  // images.value[index].src = defaultImagePath;-->
<!--};-->

<!--const onBackgroundLoaded = () => {-->
<!--  if (bgImage.value) {-->
<!--    // 添加loaded类触发过渡效果-->
<!--    bgImage.value.classList.add('loaded');-->
<!--  }-->
<!--};-->

<!--const onBackgroundError = () => {-->
<!--  bgLoadError.value = true;-->
<!--  console.error('背景图片加载失败:', backgroundImageSrc.value);-->
<!--};-->

<!--onMounted(() => {-->
<!--  if (bgImage.value?.complete) {-->
<!--    onBackgroundLoaded();-->
<!--  }-->
<!--});-->
<!--</script>-->

<!--<style scoped>-->
<!--/* CSS变量定义 */-->
<!--:root {-->
<!--  &#45;&#45;header-border: #3498db;-->
<!--  &#45;&#45;title-color: #2c3e50;-->
<!--  &#45;&#45;subtitle-color: #7f8c8d;-->
<!--  &#45;&#45;card-title-color: #e74c3c;-->
<!--  &#45;&#45;card-border: #3498db;-->
<!--  &#45;&#45;footer-bg: rgba(44, 62, 80, 0.9);-->
<!--  &#45;&#45;footer-text: #ecf0f1;-->
<!--  &#45;&#45;bg-fallback: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);-->
<!--  &#45;&#45;container-bg: rgba(255, 255, 255, 0.85);-->
<!--  &#45;&#45;content-section-gap: 30px;-->
<!--  &#45;&#45;hexagon-item-width: 280px;-->
<!--  &#45;&#45;hexagon-item-height: 280px;-->
<!--  &#45;&#45;hexagon-item-gap: 30px;-->
<!--  &#45;&#45;card-padding: 30px;-->
<!--  &#45;&#45;card-min-width: 300px;-->
<!--  &#45;&#45;card-max-width: 500px;-->
<!--  &#45;&#45;p-line-height: 1.8;-->
<!--}-->

<!--/* 全局重置样式 */-->
<!--* {-->
<!--  margin: 0;-->
<!--  padding: 0;-->
<!--  box-sizing: border-box;-->
<!--}-->

<!--/* 基础页面样式 */-->
<!--body {-->
<!--  font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;-->
<!--  line-height: 1.6;-->
<!--  color: #333;-->
<!--  min-height: 100vh;-->
<!--  position: relative;-->
<!--}-->

<!--/* 背景容器样式 */-->
<!--.background-container {-->
<!--  position: fixed;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  z-index: -1;-->
<!--  overflow: hidden;-->
<!--}-->

<!--/* 备用背景 - 渐变背景 */-->
<!--.background-fallback {-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  background: var(&#45;&#45;bg-fallback);-->
<!--}-->

<!--/* 主背景图片样式 */-->
<!--.background-image {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  object-fit: cover;-->
<!--  position: absolute;-->
<!--  top: 0;-->
<!--  left: 0;-->
<!--  opacity: 0;-->
<!--  transition: opacity 0.8s ease, filter 0.8s ease;-->
<!--  filter: blur(8px);-->
<!--}-->

<!--/* 图片加载完成后的样式 */-->
<!--.background-image.loaded {-->
<!--  opacity: 1;-->
<!--  filter: blur(0);-->
<!--}-->

<!--/* 主体内容容器 */-->
<!--.container {-->
<!--  max-width: 1200px;-->
<!--  margin: 0 auto;-->
<!--  padding: 40px 20px;-->
<!--  background: var(&#45;&#45;container-bg);-->
<!--  min-height: 100vh;-->
<!--  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);-->
<!--  position: relative;-->
<!--}-->

<!--/* 无背景时的容器样式 */-->
<!--.container.no-bg {-->
<!--  background: var(&#45;&#45;bg-fallback);-->
<!--}-->

<!--/* 头部样式 */-->
<!--header {-->
<!--  text-align: center;-->
<!--  padding: 40px 0;-->
<!--  border-bottom: 3px solid var(&#45;&#45;header-border);-->
<!--  margin-bottom: 30px;-->
<!--}-->

<!--/* 主标题样式 */-->
<!--h1 {-->
<!--  font-family: 'STXingkai', '华文行楷', cursive;-->
<!--  font-size: clamp(2.5rem, 5vw, 3.5rem);-->
<!--  color: var(&#45;&#45;title-color);-->
<!--  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);-->
<!--  margin-bottom: 15px;-->
<!--}-->

<!--/* 副标题样式 */-->
<!--.subtitle {-->
<!--  color: var(&#45;&#45;subtitle-color);-->
<!--  font-size: 1.2rem;-->
<!--}-->

<!--/* 内容区域布局 */-->
<!--.content-section {-->
<!--  display: flex;-->
<!--  gap: var(&#45;&#45;content-section-gap);-->
<!--  padding: 20px 0;-->
<!--  flex-wrap: wrap;-->
<!--  justify-content: center;-->
<!--}-->

<!--/* 卡片样式 */-->
<!--.card {-->
<!--  flex: 1;-->
<!--  min-width: var(&#45;&#45;card-min-width);-->
<!--  max-width: var(&#45;&#45;card-max-width);-->
<!--  background: rgba(255, 255, 255, 0.9);-->
<!--  padding: var(&#45;&#45;card-padding);-->
<!--  border-radius: 10px;-->
<!--  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);-->
<!--  margin-bottom: 20px;-->
<!--  transition: transform 0.3s ease, box-shadow 0.3s ease;-->
<!--}-->

<!--/* 卡片悬停效果 */-->
<!--.card:hover {-->
<!--  transform: translateY(-5px);-->
<!--  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);-->
<!--}-->

<!--/* 二级标题样式 */-->
<!--h2 {-->
<!--  color: var(&#45;&#45;card-title-color);-->
<!--  font-family: 'STKaiti', '楷体', cursive;-->
<!--  border-left: 5px solid var(&#45;&#45;card-border);-->
<!--  padding-left: 15px;-->
<!--  margin-bottom: 20px;-->
<!--  font-size: 1.5rem;-->
<!--}-->

<!--/* 段落文本样式 */-->
<!--p {-->
<!--  text-indent: 2em;-->
<!--  margin-bottom: 15px;-->
<!--  font-size: 1rem;-->
<!--  line-height: var(&#45;&#45;p-line-height);-->
<!--  text-align: justify;-->
<!--}-->

<!--/* 分隔线样式 */-->
<!--.divider {-->
<!--  width: 100%;-->
<!--  height: 1px;-->
<!--  background: linear-gradient(90deg, transparent, var(&#45;&#45;header-border), transparent);-->
<!--  margin: 60px 0;-->
<!--  position: relative;-->
<!--}-->

<!--/* 分隔线中间的装饰元素 */-->
<!--.divider::after {-->
<!--  content: "✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻✻";-->
<!--  position: absolute;-->
<!--  left: 50%;-->
<!--  top: 50%;-->
<!--  transform: translate(-50%, -50%);-->
<!--  background: var(&#45;&#45;container-bg);-->
<!--  padding: 0 15px;-->
<!--  color: var(&#45;&#45;header-border);-->
<!--  font-size: 1.5rem;-->
<!--}-->

<!--/* 六边形图片容器 */-->
<!--.hexagon-container {-->
<!--  display: flex;-->
<!--  justify-content: center;-->
<!--  gap: var(&#45;&#45;hexagon-item-gap);-->
<!--  margin: 40px 0;-->
<!--  flex-wrap: wrap;-->
<!--}-->

<!--/* 单个六边形项目 */-->
<!--.hexagon-item {-->
<!--  //width: var(&#45;&#45;hexagon-item-width);-->
<!--  //height: var(&#45;&#45;hexagon-item-height);-->
<!--  width: 300px;-->
<!--  height: 300px;-->
<!--  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);-->
<!--  transition: transform 0.3s ease;-->
<!--  background: rgba(255, 255, 255, 0.9);-->
<!--  padding: 5px;-->
<!--  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);-->
<!--}-->

<!--/* 六边形悬停效果 */-->
<!--.hexagon-item:hover {-->
<!--  transform: scale(1.05);-->
<!--  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);-->
<!--}-->

<!--/* 六边形内图片样式 */-->
<!--.hexagon-item img {-->
<!--  width: 100%;-->
<!--  height: 100%;-->
<!--  object-fit: contain;-->
<!--  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);-->
<!--  transition: transform 0.3s ease;-->
<!--}-->

<!--.hexagon-item:hover img {-->
<!--  transform: scale(1.05);-->
<!--}-->

<!--/* 页脚样式 */-->
<!--.custom- footer {-->
<!--            text-align: center;-->
<!--            padding: 20px;-->
<!--            background: var(&#45;&#45;footer-bg);-->
<!--            color: var(&#45;&#45;footer-text);-->
<!--            margin-top: 40px;-->
<!--            border-radius: 5px;-->
<!--          }-->

<!--/* 响应式设计 - 适配不同屏幕 */-->
<!--@media (max-width: 1024px) {-->
<!--  :root {-->
<!--    &#45;&#45;content-section-gap: 20px;-->
<!--    &#45;&#45;hexagon-item-width: 240px;-->
<!--    &#45;&#45;hexagon-item-height: 240px;-->
<!--    &#45;&#45;hexagon-item-gap: 20px;-->
<!--    &#45;&#45;card-padding: 25px;-->
<!--    &#45;&#45;card-min-width: 250px;-->
<!--    &#45;&#45;p-line-height: 1.7;-->
<!--  }-->
<!--}-->

<!--@media (max-width: 768px) {-->
<!--  :root {-->
<!--    &#45;&#45;content-section-gap: 15px;-->
<!--    &#45;&#45;hexagon-item-width: 200px;-->
<!--    &#45;&#45;hexagon-item-height: 200px;-->
<!--    &#45;&#45;hexagon-item-gap: 15px;-->
<!--    &#45;&#45;card-padding: 20px;-->
<!--    &#45;&#45;card-min-width: 100%;-->
<!--    &#45;&#45;p-line-height: 1.6;-->
<!--  }-->

<!--  h1 {-->
<!--    font-size: 2.2rem;-->
<!--  }-->
<!--}-->

<!--@media (max-width: 480px) {-->
<!--  :root {-->
<!--    &#45;&#45;content-section-gap: 10px;-->
<!--    &#45;&#45;hexagon-item-width: 160px;-->
<!--    &#45;&#45;hexagon-item-height: 160px;-->
<!--    &#45;&#45;hexagon-item-gap: 10px;-->
<!--    &#45;&#45;card-padding: 15px;-->
<!--    &#45;&#45;p-line-height: 1.5;-->
<!--  }-->

<!--  .container {-->
<!--    padding: 20px 15px;-->
<!--  }-->

<!--  h1 {-->
<!--    font-size: 1.8rem;-->
<!--  }-->
<!--}-->
<!--</style>-->







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
      <!-- 可替换主标题文本 -->
      <h1>{{ pageTitle }}</h1>
      <!-- 有副标题时才显示，可替换副标题文本 -->
      <p v-if="subtitle" class="subtitle">{{ subtitle }}</p>
    </header>

    <!-- 内容卡片区域 -->
    <div class="content-section">
      <!-- 循环渲染卡片，使用index作为key -->
      <div v-for="(card, index) in cards" :key="index" class="card">
        <!-- 可替换卡片标题文本 -->
        <h2>{{ card.title }}</h2>
        <!-- 可替换卡片内容文本 -->
        <p>{{ card.content }}</p>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="divider"></div>

    <!-- 六边形图片展示区 -->
    <div class="hexagon-container">
      <!-- 循环渲染六边形图片，使用index作为key -->
      <div v-for="(image, index) in images" :key="index" class="hexagon-item">
        <!-- 可替换图片路径和描述 -->
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
      <!-- 可替换底部卡片标题文本 -->
      <h2>{{ lastCardTitle }}</h2>
      <!-- 可替换底部卡片内容文本 -->
      <p>{{ lastCardContent }}</p>
    </div>

    <!-- 页脚 -->
    <footer class="custom-footer">
      <!-- 可替换版权信息文本 -->
      <p>{{ copyright }}</p>
    </footer>
  </div>
</template>

<script setup>
// Vue 3 Composition API
import { ref, onMounted } from 'vue';

// 可替换主标题文本
const pageTitle = ref('网站主标题');
// 可替换副标题文本
const subtitle = ref('—— 副标题文字');

// 可添加、删除、修改卡片信息，包括标题和内容
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

// 可添加、删除、修改图片信息，包括路径和描述
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
  }
]);

// 可替换底部卡片标题文本
const lastCardTitle = ref('最后部分标题');
// 可替换底部卡片内容文本
const lastCardContent = ref('这是页面最后一部分的内容区域，可以放置总结性文字或其他信息。模板采用了现代化的设计风格，六边形图片展示区域是其特色之一。');

// 可替换版权信息文本
const copyright = ref('© 2024 公司名称 版权所有');

// 图片加载相关逻辑
const bgImage = ref(null);
const bgLoadError = ref(false);
// 可替换背景图片路径
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
/* CSS变量定义，可修改颜色、尺寸等样式 */
:root {
  /* 可替换头部边框颜色 */
  --header-border: #3498db;
  /* 可替换主标题颜色 */
  --title-color: #c7ab20;
  /* 可替换副标题颜色 */
  --subtitle-color: #7f8c8d;
  /* 可替换卡片标题颜色 */
  --card-title-color: #e74c3c;
  /* 可替换卡片标题左边框颜色 */
  --card-border: #3498db;
  /* 可替换页脚背景颜色 */
  --footer-bg: rgba(238, 229, 229, 0.96);
  /* 可替换页脚文字颜色 */
  --footer-text: #F5F7FAFF;
  /* 可替换备用背景渐变 */
  --bg-fallback: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* 可替换主内容容器背景颜色 */
  --container-bg: rgba(255, 255, 255, 0.85);
  /* 可替换内容卡片区域间距 */
  --content-section-gap: 30px;
  /* 可替换六边形图片宽度 */
  --hexagon-item-width: 300px;
  /* 可替换六边形图片高度 */
  --hexagon-item-height: 300px;
  /* 可替换六边形图片之间的间距 */
  --hexagon-item-gap: 30px;
  /* 可替换卡片内边距 */
  --card-padding: 30px;
  /* 可替换卡片最小宽度 */
  --card-min-width: 300px;
  /* 可替换卡片最大宽度 */
  --card-max-width: 500px;
  /* 可替换段落行高 */
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
  /* 可替换页面字体 */
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
  font-size: 3.5rem;
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
  //width: var(--hexagon-item-width);
  //height: var(--hexagon-item-height);
  width: 300px;
  height: 300px;
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
  object-fit: contain;
  clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  transition: transform 0.3s ease;
}

.hexagon-item:hover img {
  transform: scale(1.05);
}

/* 页脚样式 */
.custom-footer {
  text-align: center;
  padding: 20px;
  background: var(--footer-bg);
  color: var(--footer-text);
  margin-top: 40px;
  border-radius: 5px;
}
</style>