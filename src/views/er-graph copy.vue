<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Graph, Cell, Shape } from '@antv/x6';
import { GridLayout, DagreLayout } from '@antv/layout'   // 布局算法

import { data } from './data'

let container: HTMLElement | undefined;
let graph;

// 挂载完成后
onMounted(() => {
  container = document.getElementById('container') as HTMLElement | undefined
  registerNode()
  getData()
})

// 加载数据创建画布
const getData = () => {

  createGraph()
}



// 创建画布
const createGraph = () => {
  graph = new Graph({
    container: container,
    height: 1080,
    background: { color: '#fff' },  // 创建画布时初始化背景相关配置对象
    grid: { size: 10, visible: true, type: 'mesh' }, //创建画布时，通过配置对象来设置背景网格
    connecting: {
      router: {
        name: 'er',
        args: {
          offset: 25,
          direction: 'H',
        },
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: '#A2B1C3',
              strokeWidth: 2,
            },
          },
        })
      },
    },
  })

  // graph.fromJSON()

  const cells: Cell[] = []
  data.forEach((item: any) => {
    if (item.shape === 'edge') {
      cells.push(graph.createEdge(item))
    } else {
      cells.push(graph.createNode(item))
    }
  })
  graph.resetCells(cells)
  graph.zoomToFit({ padding: 10, maxScale: 1 })
  graph.drawBackground({ color: '#fff' })  // 创建画布后也可调用方法重绘背景
  graph.drawGrid({ type: 'mesh' })            // 创建画布后也可调用方法重绘画布网格
  graph.zoom(0.5)                             // 画布和图形整体的缩放
  graph.translate(200, 40)                    // 图形相对画布的相对位置，平移
  graph.centerContent()                       // 将画布内容中心与视口中心对齐
}

// 注册er图节点
const registerNode = () => {
  // 泳道图
  Graph.registerNode(
    'lane',
    {
      inherit: 'rect',
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'rect',
          selector: 'name-rect',
        },
        {
          tagName: 'text',
          selector: 'name-text',
        },
      ],
      attrs: {
        body: {
          fill: '#FFF',
          stroke: '#5F95FF',
          strokeWidth: 1,
        },
        'name-rect': {
          width: 200,
          height: 30,
          fill: '#5F95FF',
          stroke: '#fff',
          strokeWidth: 1,
          x: -1,
        },
        'name-text': {
          ref: 'name-rect',
          refY: 0.5,
          refX: 0.5,
          textAnchor: 'middle',
          fontWeight: 'bold',
          fill: '#fff',
          fontSize: 12,
        },
      },
    },
    true,
  )
  const LINE_HEIGHT = 24
  const NODE_WIDTH = 150
  Graph.registerPortLayout(
    'erPortPosition',
    (portsPositionArgs) => {
      return portsPositionArgs.map((_, index) => {
        return {
          position: {
            x: 0,
            y: (index + 1) * LINE_HEIGHT,
          },
          angle: 0,
        }
      })
    },
    true,
  )

  Graph.registerNode(
    'er-rect',
    {
      inherit: 'rect',
      markup: [
        {
          tagName: 'rect',
          selector: 'body',
        },
        {
          tagName: 'text',
          selector: 'label',
        },
      ],
      attrs: {
        rect: {
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#5F95FF',
        },
        label: {
          fontWeight: 'bold',
          fill: '#ffffff',
          fontSize: 12,
        },
      },
      ports: {
        groups: {
          list: {
            markup: [ //指定了渲染节点/边时使用的 SVG/HTML 片段
              {
                tagName: 'rect',
                selector: 'portBody',
              },
              {
                tagName: 'rect',
                selector: 'portBodyRight',
              },
              {
                tagName: 'rect',
                selector: 'portBodyLeft',
              },
              {
                tagName: 'text',
                selector: 'portNameLabel',
              },
              {
                tagName: 'text',
                selector: 'portTypeLabel',
              },
            ],
            attrs: {
              portBody: {
                width: NODE_WIDTH,
                height: LINE_HEIGHT,
                strokeWidth: 1,
                fill: '#EFF4FF',
                magnet: true, //当 magnet 属性为 true 时，表示该元素可以被链接，即在连线过程中可以被当做连线的起点或终点，与连接桩类似。
                zIndex:1,
              },
              portBodyLeft: {
                width: (NODE_WIDTH / 2),
                height: LINE_HEIGHT,
                strokeWidth: 1,
                stroke: '#5F95FF',
                fill: '#EFF4FF',
                magnet: false,
                ref: 'portBody',

              },
              portBodyRight: {
                width: (NODE_WIDTH / 2),
                height: LINE_HEIGHT,
                strokeWidth: 1,
                stroke: '#5F95FF',
                fill: '#EFF4FF',
                magnet: false,
                refX: (NODE_WIDTH / 2),
                ref: 'portBody',
              },
              portNameLabel: {
                ref: 'portBodyLeft',
                refX: 6,
                refY: 6,
                fontSize: 10,
              },
              portTypeLabel: {
                ref: 'portBodyRight',
                refX: 6,
                refY: 6,
                fontSize: 10,
              },
            },
            position: 'erPortPosition',
          },
        },
      },
    },
    true,
  )

}

</script>

<template>
  <div id="container"></div>
</template>

<style scoped></style>
