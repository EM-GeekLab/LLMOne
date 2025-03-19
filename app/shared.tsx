export const MODE: Record<string, { title: string; id: string }[]> = {
  bmc: [
    { title: '部署准备', id: 'prepare' },
    { title: '选择服务器连接模式', id: 'connect-mode' },
    { title: '配置连接信息', id: 'connect-info' },
    { title: '选择操作系统', id: 'select-os' },
    { title: '配置主机信息', id: 'host-info' },
    { title: '安装环境', id: 'install-env' },
    { title: '选择模型', id: 'select-model' },
    { title: '完成部署', id: 'finish' },
    { title: '性能测试', id: 'performance-test' },
  ],
  ssh: [
    { title: '部署准备', id: 'prepare' },
    { title: '选择服务器连接模式', id: 'connect-mode' },
    { title: '配置连接信息', id: 'connect-info' },
    { title: '安装环境', id: 'install-env' },
    { title: '选择模型', id: 'select-model' },
    { title: '完成部署', id: 'finish' },
    { title: '性能测试', id: 'performance-test' },
  ],
}
