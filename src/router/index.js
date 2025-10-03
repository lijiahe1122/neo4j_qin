// 导入路由创建的相关方法
import {createRouter,createWebHistory} from 'vue-router'

// 导入vue组件
import SelectRelationship from '@/components/neovis/SelectRelationship.vue'
import HelloWorld from "@/components/HelloWorld.vue";
import Graph from '@/components/Graph.vue';
import RelationShip from "@/components/neovis/RelationShip.vue";
import onMounted from "@/components/neovis/onMounted.vue";
import Inject from "@/components/neovis/Inject.vue";
import ECharts from "@/components/echarts/ECharts.vue";
import GraphEcharts from "@/components/echarts/GraphEcharts.vue";
import Gaijin from "@/components/echarts/Gaijin.vue";
import Content from "@/components/template/Content.vue";
import ParticleCanvas from "@/components/echarts/ParticleCanvas.vue";
import QinShiHuang from "@/components/template/QinShiHuang.vue";
import MuBan from "@/components/template/MuBan.vue";
import QinHuang from "@/components/template/QinHuang.vue";
import Query from "@/components/echarts/Query.vue";
import Reuse from "@/components/template/Reuse.vue";
import click from "@/components/echarts/Click.vue";
import Dropdown from "@/components/echarts/Dropdown.vue";
import DropQuery from "@/components/echarts/DropQuery.vue";
import Label from "@/components/echarts/Label.vue";
import HotStart from "@/components/template/HotStart.vue";
import Dropdown1 from "@/components/echarts/Dropdown1.vue";
import duola from "@/components/icons/duola.vue";
// 创建路由对象,声明路由规则
const router = createRouter({
    history: createWebHistory(),
    routes:[
        {
            path: '/',
            component: HelloWorld
        },
        {
            path:'/selectRelationship',
            component:  SelectRelationship
        },
        {
            path:'/graph',
            component:  Graph
        },
        {
            path:'/relationship',
            component:  RelationShip
        },
        {
            path:'/onMounted',
            component:  onMounted
        },
        {
            path:'/inject',
            component:  Inject
        },
        {
            path:'/echarts',
            component:  ECharts
        },
        {
            path:'/graphEcharts',
            component:  GraphEcharts

        },
        {
            path:'/gaijin',
            component:  Gaijin
        },
        {
            path:'/content',
            component:  Content
        },
        {
            path:'/particleCanvas',
            component:  ParticleCanvas
        },
        {
            path:'/qinShiHuang',
            component:  QinShiHuang
        },
        {
            path:'/muBan',
            component:  MuBan
        },
        {
            path:'/qinHuang',
            component:  QinHuang
        },
        {
            path:'/query',
            component:  Query
        },
        {
            path:'/reuse/:theme',
            component:  Reuse
        },
        {
            path:'/click',
            component:  click
        },
        {
            path:'/dropdown',
            component:  Dropdown
        },
        {
            path:'/dropQuery',
            name: 'DropQuery',
            component:  DropQuery
        },
        {
            path:'/dropQuery/:theme',  // 添加参数
            name: 'DropQueryWithTheme',
            component: DropQuery
        },

        {
            path:'/label',
            component:  Label
        },
        {
            path:'/hotStart',
            component:  HotStart
        },
        // 新增动态路由（注意路径格式为 /hotstart/:theme，与原 /reuse/:theme 类似）
        {
            path: '/hotStart/:theme', // 动态参数路由，注意路径中的 hotstart 为小写（与你的组件名 HotStart 对应，Vue 路由不区分大小写）
            name: 'HotStartWithTheme', // 可选：为路由命名，方便后续使用
            component: HotStart // 指向你的 HotStart 组件
        },
        {
            path:'/dropdown1',
            component:  Dropdown1
        },
        {
            path:'/duola',
            component:  duola
        }





    ]

})
// 对外暴露路由对象
export default router;