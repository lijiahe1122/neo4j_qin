// import './assets/main.css'
//
// import { createApp } from 'vue'
// import App from './App.vue'
//
// createApp(App).mount('#app')


//第二版
// import './assets/main.css'
// import { createApp } from 'vue'
// import App from './App.vue'
// import neo4j from 'neo4j-driver';
// import router from "@/router/index.js";
//
// // 初始化 Neo4j 驱动
// const driver = neo4j.driver(
//     'bolt://localhost:7687', // 替换为你的 Neo4j 服务器地址
//     neo4j.auth.basic('neo4j', '123456789') // 替换为你的用户名和密码
// );
//
// // 创建 Vue 应用实例
// const app = createApp(App);
// app.use(router)
//
// // 将 Neo4j 驱动挂载到 Vue 原型上
// app.config.globalProperties.$neo4j = driver;
//
// // 挂载应用
// app.mount('#app');

// import './assets/main.css'
// import { createApp } from 'vue'
// import App from './App.vue'
// import neo4j from 'neo4j-driver';
// import router from "@/router/index.js";
//
// // 创建 Vue 应用实例
// const app = createApp(App);
// app.use(router)
//
// // 创建并挂载Neo4j驱动，确保在应用挂载后进行
// app.config.globalProperties.$neo4j = null; // 先初始化为null
// app.mount('#app').$nextTick(() => {
//     // 应用挂载完成后初始化驱动
//     app.config.globalProperties.$neo4j = neo4j.driver(
//         'bolt://localhost:7687',
//         neo4j.auth.basic('neo4j', '123456789')
//     );
// });

// main.js
import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import neo4j from 'neo4j-driver';
import router from "@/router/index.js";
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 创建 Vue 应用实例
const app = createApp(App);
app.use(router)
app.use(ElementPlus)

// 初始化并注入Neo4j驱动
const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '123456789')
);
app.provide('$neo4j', driver);

// 挂载应用
app.mount('#app');