<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="logo">哆啦A梦</div>
      <ul class="nav-links">
        <li><a href="#" @click.prevent="navigateTo('home')">首页</a></li>
        <li><a href="#" @click.prevent="navigateTo('story')">剧情简介</a></li>
        <li><a href="#" @click.prevent="navigateTo('characters')">角色介绍</a></li>
        <li><a href="#" @click.prevent="navigateTo('gallery')">精彩图集</a></li>
        <li><a href="#" @click.prevent="navigateTo('tickets')">购票信息</a></li>
      </ul>
    </nav>

    <!-- 路由视图 -->
    <main>
      <router-view></router-view>
    </main>

    <!-- 页脚 -->
    <footer class="footer">
      <p>© 2023 哆啦A梦剧场版《小黑子》 版权所有</p>
      <p>本网站仅供学习交流使用</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  methods: {
    navigateTo(route) {
      this.$router.push({ name: route });
    }
  }
}
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  background-color: #f0f8ff;
  color: #333;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.navbar {
  background-color: #1e90ff;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

.logo {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
}

.nav-links li {
  margin-left: 1.5rem;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #ffcc00;
}

/* 页脚样式 */
.footer {
  background-color: #1e90ff;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    padding: 1rem;
  }

  .nav-links {
    margin-top: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .nav-links li {
    margin: 0.5rem;
  }
}
</style>