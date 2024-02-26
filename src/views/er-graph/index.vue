<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Graph, Cell, Shape, Node } from '@antv/x6';
import { register, getTeleport } from '@antv/x6-vue-shape'
import erEntityNode from './components/er-node/index.vue'
// import { data } from './data'
import { Transform } from '@antv/x6-plugin-transform'
import { Selection } from '@antv/x6-plugin-selection'
import { registerCustomGroupNode, addNodeCollapseListener } from './utils/x6util'
import { startDragToGraph } from "./utils/methods";

import leftDrawer from './components/left-drawer/index.vue'

const TeleportContainer = getTeleport()

let container: HTMLElement | undefined;
let graph;

// 挂载完成后
onMounted(() => {
  container = document.getElementById('container') as HTMLElement | undefined
  registerNode()
  registerCustomGroupNode()
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
    // highlighting: {
    //   magnetAdsorbed: {
    //     name: 'stroke',
    //     args: {
    //       attrs: {
    //         fill: '#5F95FF',
    //         stroke: '#5F95FF',
    //       },
    //     },
    //   },
    // },
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
    embedding: {
      enabled: true,
      findParent({ node }) {
        const bbox = node.getBBox()
        return this.getNodes().filter((node) => {
          const data = node.getData()
          if (data && data.parent) {
            const targetBBox = node.getBBox()
            return bbox.isIntersectWithRect(targetBBox)
          }
          return false
        })
      },
    }
  })

  graph.use(
    new Transform({
      resizing: {
        // enabled: true, // 启用调整节点大小的功能
        enabled(node) {
          // 判断节点是否可调整大小
          return node.isNode() && node.data?.resizable === true;
        },
        preserveAspectRatio(node) {
          // 保持纵横比
          return node.isNode() && node.data?.keepRatio === true;
        },
        minWidth: 20,// 最小宽度
      },
      rotating: {
        enabled(node) {
          // 判断节点是否可旋转角度
          return node.isNode() && node.data?.rotatable === true
        },
      },
    }),
  )
  graph.use(
    new Selection({
      enabled: true,
      showNodeSelectionBox: true,
      showEdgeSelectionBox: false,
      pointerEvents: 'none',
      className: 'on-selection'
      // rubberband:true
    }),
  )

  // 注册节点展开收起监听事件
  addNodeCollapseListener(graph)

  graph.on('node:change:parent', ({ node }) => {
    // 监听节点父级变化事件
    console.log('node:change:parent:', node);
  })

  graph.on('node:added', ({ node }) => {
    // 监听节点添加事件
    if (node?.data?.zIndex !== undefined) {
      node.setZIndex(node.data.zIndex)
    }
  })

  graph.on('cell:selected', ({ cell }) => {
    // 监听节点/边选中事件
    console.log(cell, ":::cell:selected")
  })
  graph.on('cell:unselected', ({ cell }) => {
    // 监听节点/边取消选中事件
    console.log(cell, ":::cell:unselected")
  })

  graph.on('edge:connected', ({ edge, options }) => {
    // console.log(edge, options, 'edge:connected');
    console.log(graph.toJSON());

  })

  graph.on('edge:mouseup', ({ edge, options }) => {
    // console.log(edge, options, 'edge:mouseup');
    if (edge?.target?.cell === edge?.id || edge?.target?.cell === edge?._parent?.id) {
      edge.remove()
    }
    if (!edge?.target?.cell) {
      edge.remove()
    }
  })

  graph.zoomToFit({ padding: 10, maxScale: 1 })
  graph.drawBackground({ color: '#fff' })  // 创建画布后也可调用方法重绘背景
  graph.drawGrid({ type: 'mesh' })            // 创建画布后也可调用方法重绘画布网格
  graph.zoom(0.5)                             // 画布和图形整体的缩放
  graph.translate(200, 40)                    // 图形相对画布的相对位置，平移
  graph.centerContent()                       // 将画布内容中心与视口中心对齐
}

// 注册er图节点
const registerNode = () => {
  const ratio = 2 / 3
  const LINE_HEIGHT = 30
  const NODE_WIDTH = 160
  Graph.registerPortLayout(
    'erPortPosition',
    (portsPositionArgs) => {
      debugger
      return portsPositionArgs.map((_, index) => {
        return {
          position: {
            x: 0,
            y: (index + 1) * LINE_HEIGHT * ratio,
          },
          angle: 0,
        }
      })
    },
    true,
  )

  register({
    shape: 'entity-node',
    component: erEntityNode,
    ports: {
      groups: {
        right: {
          position:'right',
          // position: {
          //   name: 'absolute',
          //   args: { x: '100%', y: ratio * LINE_HEIGHT * 0.5 },
          // },
          attrs: {
            circle: {
              magnet: true,
              r: 4,
              stroke: '#3199FF',
              fill: '#fff',
              strokeWidth: 1,
            },
          }
        },
        list: {
          zIndex: 1,
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
            portBody: {
              width: NODE_WIDTH * ratio,
              height: LINE_HEIGHT * ratio,
              strokeWidth: 1,
              stroke: 'transparent',
              fill: 'transparent',
              magnet: true,
              zIndex: 0,

            },
            portNameLabel: {
              ref: 'portBody',
              refX: 6,
              refY: 6,
              fontSize: 10,
              fill: 'transparent',
              zIndex: 0,
              // magnet: true,
            },
            portTypeLabel: {
              ref: 'portBody',
              refX: 1,
              refY: 6,
              fontSize: 10,
              // fill: 'transparent',
              zIndex: 0,
              r: 5
              // magnet: true,
            },
          },
          position: 'erPortPosition',
        },
      },
    },
  })

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
        {
          tagName: 'rect',
          selector: 'button',
          attrs: {
            fill: "none",
            "pointer-events": "none",
          },
        },
        {
          tagName: 'text',
          selector: 'buttonLabel',
        },
      ],
      attrs: {
        rect: {
          magnet: true,
          strokeWidth: 1,
          stroke: '#5F95FF',
          fill: '#5F95FF',
        },
        label: {
          fontWeight: 'bold',
          fill: '#ffffff',
          fontSize: 12,
        },
        buttonLabel: {
          ref: "button",
          text: '+',
          cursor: "pointer",

        },
        button: {
          ref: "body",
          height: 14,
          width: 16,
          fill: "#f5f5f5",
          stroke: "#ccc",
          cursor: "pointer",
          event: "column:add",

        }
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
              // line: {
              //   width: 1,
              //   height: LINE_HEIGHT,
              //   strokeWidth: 1,
              //   stroke: '#5F95FF',
              //   refX: NODE_WIDTH / 2,
              //   refY: 0,
              //   y1: 0,
              //   y2: LINE_HEIGHT
              // },
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
                fill: '#EFF4FF',
                magnet: true,
              },
              portTypeLabel: {
                ref: 'portBody',
                refX: 95,
                refY: 6,
                fontSize: 10,
                fill: '#EFF4FF',
                magnet: true,
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

// 拖拽生成正方形或者圆形
const startDrag = (type, e) => {
  startDragToGraph(graph, type, e);
}

</script>

<template>
  <div class="container_warp">
    <left-drawer @start-drag="startDrag"></left-drawer>
    <div id="container" class="container"></div>
    <TeleportContainer />
  </div>
</template>

<style  lang="scss">
@import "@/assets/iconfont.css";



.container_warp {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;

  .container {
    flex: 1;
  }

  .x6-edge-selected path:nth-child(2) {
    stroke: #239edd;
    stroke-width: 1.5px;
  }

  // .x6-widget-selection-box {
  //   border: 2px dashed #239edd;
  // }

  // .x6-widget-selection-inner {
  //   border: 1px solid #239edd;
  // }

  // .right_drawer {
  //   height: 100%;
  //   width: 300px;
  //   border-left: 1px solid #eee;
  //   background: #fff;
  // }

  // .left_drawer {
  //   height: 100%;
  //   width: 300px;
  //   border-left: 1px solid #eee;
  //   background: #fff;
  // }
}
</style>
