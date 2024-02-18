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
      cells.push(graph.createEdge({
        ...item,
       label:'111'
      }))
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

  // graph.on('edge:changed', ({ edge, index, options }) => {

  // })
  graph.on('edge:connected', ({ edge, options }) => {
    // console.log(edge, options, 'edge:connected');
  })
  graph.on('edge:mouseup', ({ edge, options }) => {
    // console.log(edge, options, 'edge:mouseup');
    if (!edge?.target?.cell) {
      edge.remove()
    }
  })
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
          magnet: false,
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
            markup: [
              {
                tagName: 'rect',
                selector: 'portBody',
              },
              {
                tagName: 'text',
                selector: 'portNameLabel',
              },
              {
                tagName: 'line',
                selector: 'line',
              },
              {
                tagName: 'text',
                selector: 'portTypeLabel',
              },
            ],
            attrs: {
              line: {
                width: 1,
                height: LINE_HEIGHT,
                strokeWidth: 1,
                stroke: '#5F95FF',
                refX: NODE_WIDTH / 2,
                refY: 0,
                y1: 0,
                y2: LINE_HEIGHT
              },
              portBody: {
                width: NODE_WIDTH,
                height: LINE_HEIGHT,
                strokeWidth: 1,
                stroke: '#5F95FF',
                fill: '#EFF4FF',
              },
              portNameLabel: {
                ref: 'portBody',
                refX: 6,
                refY: 6,
                fontSize: 10,
                magnet: true,

              },
              portTypeLabel: {
                ref: 'portBody',
                refX: 95,
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
