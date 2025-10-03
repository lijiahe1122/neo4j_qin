// const express = require('express');
// const mysql = require('mysql2/promise');
// const cors = require('cors');
// const app = express();
// const port = 3001;
//
// // 创建数据库连接池
// const pool = mysql.createPool({
//     host: 'localhost', // 数据库主机名
//     user: 'tupu', // 数据库用户名
//     password: '123456', // 数据库密码
//     database: 'page_data' // 数据库名
// });
//
// // 启用CORS
// app.use(cors());
//
// // 解析JSON数据
// app.use(express.json());
//
// // 定义API接口，根据主题获取数据
// app.get('/api/data/:theme', async (req, res) => {
//     const theme = req.params.theme;
//     console.log('接收到的主题参数:', theme);
//     try {
//         const [rows] = await pool.execute('SELECT * FROM pages WHERE theme =?', [theme]);
//         if (rows.length > 0) {
//             const pageData = rows[0];
//             const data = {
//                 pageTitle: pageData.page_title,
//                 subtitle: pageData.subtitle,
//                 cards: JSON.parse(pageData.cards),
//                 images: JSON.parse(pageData.images),
//                 lastCardTitle: pageData.last_card_title,
//                 lastCardContent: pageData.last_card_content,
//                 copyright: pageData.copyright,
//                 backgroundImageSrc: pageData.background_image_src
//             };
//             res.json(data);
//         } else {
//             console.log('未找到对应主题的数据');
//             res.status(404).json({ message: '未找到对应主题的数据' });
//         }
//     } catch (error) {
//         console.error('数据库查询或数据处理错误:', error);
//         res.status(500).json({ message: '服务器内部错误' });
//     }
// });
//
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });

// <>没有加click的</>
// const express = require('express');
// const mysql = require('mysql2/promise');
// const cors = require('cors');
// const app = express();
// const port = 3001;
//
// // 创建数据库连接池
// const pool = mysql.createPool({
//     host: 'localhost', // 数据库主机名
//     user: 'tupu', // 数据库用户名
//     password: '123456', // 数据库密码
//     database: 'page_data', // 数据库名
//     waitForConnections: true,
//     connectionLimit: 10,
//     queueLimit: 0
// });
//
// // 启用CORS
// app.use(cors());
//
// // 解析JSON数据
// app.use(express.json());
//
// // 添加请求日志中间件
// app.use((req, res, next) => {
//     console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//     next();
// });
//
// // 定义API接口，根据主题获取数据
// app.get('/api/data/:theme', async (req, res) => {
//     const theme = req.params.theme;
//     console.log('接收到的主题参数:', theme);
//
//     // 验证主题参数是否为空
//     if (!theme || theme.trim() === '') {
//         return res.status(400).json({
//             message: '主题参数不能为空',
//             error: 'Invalid theme parameter'
//         });
//     }
//
//     try {
//         // 查询数据库
//         const [rows] = await pool.execute(
//             'SELECT * FROM pages WHERE theme = ? LIMIT 1',
//             [theme]
//         );
//
//         if (rows.length === 0) {
//             console.log(`未找到主题为 "${theme}" 的数据`);
//             return res.status(404).json({
//                 message: '未找到对应主题的数据',
//                 availableThemes: await getAvailableThemes()
//             });
//         }
//
//         const pageData = rows[0];
//
//         // 验证JSON字段是否有效
//         let cards, images;
//         try {
//             cards = JSON.parse(pageData.cards || '[]');
//             images = JSON.parse(pageData.images || '[]');
//         } catch (parseError) {
//             console.error('JSON解析错误:', parseError);
//             return res.status(500).json({
//                 message: '数据格式错误',
//                 error: 'Invalid JSON format in database'
//             });
//         }
//
//         const data = {
//             pageTitle: pageData.page_title || '默认标题',
//             subtitle: pageData.subtitle || '',
//             cards: cards,
//             images: images,
//             lastCardTitle: pageData.last_card_title || '',
//             lastCardContent: pageData.last_card_content || '',
//             copyright: pageData.copyright || '© 2023 版权所有',
//             backgroundImageSrc: pageData.background_image_src || '/default-bg.jpg'
//         };
//
//         res.json(data);
//     } catch (error) {
//         console.error('数据库查询或数据处理错误:', error);
//
//         // 根据错误类型返回不同的状态码
//         if (error.code === 'ER_BAD_FIELD_ERROR') {
//             return res.status(500).json({
//                 message: '数据库字段错误',
//                 error: error.message
//             });
//         }
//
//         res.status(500).json({
//             message: '服务器内部错误',
//             error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message
//         });
//     }
// });
//
// // 辅助函数：获取所有可用主题
// async function getAvailableThemes() {
//     try {
//         const [rows] = await pool.execute('SELECT DISTINCT theme FROM pages');
//         return rows.map(row => row.theme);
//     } catch (error) {
//         console.error('获取可用主题失败:', error);
//         return [];
//     }
// }
//
// // 错误处理中间件
// app.use((err, req, res, next) => {
//     console.error('未捕获的错误:', err.stack);
//     res.status(500).json({
//         message: '服务器内部错误',
//         error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
//     });
// });
//
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log('API endpoint: http://localhost:3001/api/data/:theme');
// });


const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();
const port = 3001;

// 创建数据库连接池
const pool = mysql.createPool({
    host: 'localhost', // 数据库主机名
    user: 'tupu', // 数据库用户名
    password: '123456', // 数据库密码
    database: 'page_data', // 数据库名
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 启用CORS
app.use(cors());

// 解析JSON数据
app.use(express.json());

// 添加请求日志中间件
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// 定义API接口，根据主题获取数据
app.get('/api/data/:theme', async (req, res) => {
    const theme = req.params.theme;
    console.log('接收到的主题参数:', theme);

    // 验证主题参数是否为空
    if (!theme || theme.trim() === '') {
        return res.status(400).json({
            message: '主题参数不能为空',
            error: 'Invalid theme parameter'
        });
    }

    try {
        // 查询数据库
        const [rows] = await pool.execute(
            'SELECT * FROM pages WHERE theme =? LIMIT 1',
            [theme]
        );

        if (rows.length === 0) {
            console.log(`未找到主题为 "${theme}" 的数据`);
            return res.status(404).json({
                message: '未找到对应主题的数据',
                availableThemes: await getAvailableThemes()
            });
        }

        const pageData = rows[0];

        // 验证JSON字段是否有效
        let cards, images;
        try {
            cards = JSON.parse(pageData.cards || '[]');
            images = JSON.parse(pageData.images || '[]');
        } catch (parseError) {
            console.error('JSON解析错误:', parseError);
            return res.status(500).json({
                message: '数据格式错误',
                error: 'Invalid JSON format in database'
            });
        }

        const data = {
            pageTitle: pageData.page_title || '默认标题',
            subtitle: pageData.subtitle || '',
            cards: cards,
            images: images,
            lastCardTitle: pageData.last_card_title || '',
            lastCardContent: pageData.last_card_content || '',
            copyright: pageData.copyright || '© 2023 版权所有',
            backgroundImageSrc: pageData.background_image_src || '/default-bg.jpg'
        };

        res.json(data);
    } catch (error) {
        console.error('数据库查询或数据处理错误:', error);

        // 根据错误类型返回不同的状态码
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            return res.status(500).json({
                message: '数据库字段错误',
                error: error.message
            });
        }

        res.status(500).json({
            message: '服务器内部错误',
            error: process.env.NODE_ENV === 'production'? 'Internal Server Error' : error.message
        });
    }
});

// 新增接口：根据实体名称搜索主题
app.get('/api/search-theme', async (req, res) => {
    const entity = req.query.entity;
    console.log('接收到的实体参数:', entity);

    // 验证实体参数是否为空
    if (!entity || entity.trim() === '') {
        return res.status(400).json({
            message: '实体参数不能为空',
            error: 'Invalid entity parameter'
        });
    }

    try {
        // 查询数据库中theme字段是否包含该实体
        const [rows] = await pool.execute(
            'SELECT * FROM pages WHERE theme LIKE?',
            [`%${entity}%`]
        );

        res.json(rows);
    } catch (error) {
        console.error('数据库查询错误:', error);
        res.status(500).json({
            message: '服务器内部错误',
            error: process.env.NODE_ENV === 'production'? 'Internal Server Error' : error.message
        });
    }
});

// 辅助函数：获取所有可用主题
async function getAvailableThemes() {
    try {
        const [rows] = await pool.execute('SELECT DISTINCT theme FROM pages');
        return rows.map(row => row.theme);
    } catch (error) {
        console.error('获取可用主题失败:', error);
        return [];
    }
}

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('未捕获的错误:', err.stack);
    res.status(500).json({
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'production'? 'Internal Server Error' : err.message
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('API endpoint: http://localhost:3001/api/data/:theme');
});