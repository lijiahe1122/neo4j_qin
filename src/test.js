import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '123456789')
);

async function test() {
    try {
        const session = driver.session();
        const result = await session.run('RETURN 1');
        console.log('连接成功！', result.records[0].get(0).toNumber());
        session.close();
    } catch (e) {
        console.error('测试失败：', e.message);
    } finally {
        driver.close();
    }
}

test();