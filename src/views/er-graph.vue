<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Graph, Cell, Shape, Node } from '@antv/x6';
import { register, getTeleport } from '@antv/x6-vue-shape'
// import TestNode from '../components/test.vue'
import { data } from './data'
import { Transform } from '@antv/x6-plugin-transform'
import { useGroup } from './utils/x6util'
// register({
//   shape: 'custom-vue-node',
//   width: 100,
//   height: 100,
//   component: TestNode,
// })
const TeleportContainer = getTeleport()

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

// const initGroup = () => {
//   Graph.registerNode(
//     'custom-group-node',
//     {
//       inherit: 'rect',
//       width: 100,
//       height: 40,
//       attrs: {
//         body: {
//           stroke: '#8f8f8f',
//           strokeWidth: 1,
//           fill: '#fff',
//           rx: 6,
//           ry: 6,
//         },
//       },
//     },
//     true,
//   )

//   class Group extends Node {
//     private collapsed = false
//     private expandSize: { width: number; height: number }

//     protected postprocess() {
//       this.toggleCollapse(false)
//     }

//     isCollapsed() {
//       return this.collapsed
//     }

//     toggleCollapse(collapsed?: boolean) {
//       const target = collapsed == null ? !this.collapsed : collapsed
//       if (target) {
//         this.attr('buttonSign', { d: 'M 1 5 9 5 M 5 1 5 9' })
//         this.expandSize = this.getSize()
//         this.resize(100, 32)
//       } else {
//         this.attr('buttonSign', { d: 'M 2 5 8 5' })
//         if (this.expandSize) {
//           this.resize(this.expandSize.width, this.expandSize.height)
//         }
//       }
//       this.collapsed = target
//     }
//   }


//   Group.config({
//     markup: [
//       {
//         tagName: 'rect',
//         selector: 'body',
//       },
//       {
//         tagName: 'text',
//         selector: 'label',
//       },
//       {
//         tagName: 'g',
//         selector: 'buttonGroup',
//         children: [
//           {
//             tagName: 'rect',
//             selector: 'button',
//             attrs: {
//               'pointer-events': 'visiblePainted',
//             },
//           },
//           {
//             tagName: 'path',
//             selector: 'buttonSign',
//             attrs: {
//               fill: 'none',
//               'pointer-events': 'none',
//             },
//           },
//         ],
//       },
//     ],
//     attrs: {
//       body: {
//         refWidth: '100%',
//         refHeight: '100%',
//         strokeWidth: 1,
//         fill: '#ffffff',
//         stroke: 'none',
//       },
//       buttonGroup: {
//         refX: 8,
//         refY: 8,
//       },
//       button: {
//         height: 14,
//         width: 16,
//         rx: 2,
//         ry: 2,
//         fill: '#f5f5f5',
//         stroke: '#ccc',
//         cursor: 'pointer',
//         event: 'node:collapse',
//       },
//       buttonSign: {
//         refX: 3,
//         refY: 2,
//         stroke: '#808080',
//       },
//       label: {
//         fontSize: 12,
//         fill: '#fff',
//         refX: 32,
//         refY: 10,
//       },
//     },
//   })

//   const createGroup = (
//     id: string,
//     x: number,
//     y: number,
//     width: number,
//     height: number,
//     fill: string,
//     stroke: string
//   ) => {
//     const group = new Group({
//       id,
//       x,
//       y,
//       width,
//       height,
//       attrs: {
//         body: {
//           fill,
//           stroke,
//           strokeWidth: 1,
//         },
//         label: {
//           text: id, fill: '#333',
//           fontSize: 12,
//         },
//       },
//     })
//     graph.addNode(group)
//     return group
//   }

//   const createNode = (
//     id: string,
//     x: number,
//     y: number,
//     width: number,
//     height: number,
//   ) => {
//     return graph.addNode({
//       shape: 'custom-group-node',
//       id,
//       x,
//       y,
//       width,
//       height,
//       label: id,
//     })
//   }

//   const createEdge = (
//     id: string,
//     source: string,
//     target: string,
//     vertices?: { x: number; y: number }[],
//   ) => {
//     return graph.addEdge({
//       id,
//       source,
//       target,
//       vertices,
//       label: id,
//       attrs: {
//         line: {
//           stroke: '#8f8f8f',
//           strokeWidth: 1,
//         },
//       },
//     })
//   }

//   const a = createGroup('a', 100, 40, 480, 280, undefined, '#91d5ff')
//   // const aa = createGroup('aa', 180, 100, 160, 140, '#47C769')
//   // const aaa = createGroup('aaa', 200, 160, 120, 40, '#0491e4')
//   // const b = createNode('b', 450, 200, 50, 50)

//   // a.addChild(aa)
//   // aa.addChild(aaa)
//   // a.addChild(b)

//   // createNode('c', 680, 80, 50, 50)

//   // createEdge('edge1', 'aa', 'b')
//   // createEdge('edge3', 'b', 'c')
//   // aa.addChild(
//   //   createEdge('edge2', 'aa', 'aaa', [
//   //     { x: 60, y: 140 },
//   //     { x: 60, y: 220 },
//   //   ]),
//   // )

//   graph.on('node:collapse', ({ node }: { node: Group }) => {
//     node.toggleCollapse()
//     const collapsed = node.isCollapsed()
//     const collapse = (parent: Group) => {
//       const cells = parent.getChildren()
//       if (cells) {
//         cells.forEach((cell) => {
//           if (collapsed) {
//             cell.hide()
//           } else {
//             cell.show()
//           }

//           if (cell instanceof Group) {
//             if (!cell.isCollapsed()) {
//               collapse(cell)
//             }
//           }
//         })
//       }
//     }

//     collapse(node)
//   })

// }

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
        enabled: true, // 启用调整节点大小的功能
        preserveAspectRatio: false, // 保持纵横比
        minWidth: 20,// 最小宽度
      },
      rotating: {},
    }),
  )

  // graph.fromJSON()

  const cells: Cell[] = []
  data.forEach((item: any) => {
    if (item.shape === 'edge') {
      cells.push(graph.createEdge({
        ...item,
        label: '111'
      }))
    } else {
      const node = graph.createNode({ ...item })
      if (item.shape === 'lane') {
        node.setData({
          parent: true
        })
      }
      cells.push(node)
    }
  })
  graph.resetCells(cells)
  // initGroup()
  const { createGroup } = useGroup(graph)
  createGroup('分组1',0,0,200,300,null,'#5f95ff')

  // graph.addNode({
  //   shape: 'custom-vue-node',
  //   x: 100,
  //   y: 60,
  // })

  graph.on('node:change:parent', ({ node }) => {
    console.log('node:change:parent:', node);

    // node.attr({
    //   label: {
    //     text: 'Child\n(embed)',
    //   },
    // })
  })

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
  <div>
    <div id="container"></div>
    <TeleportContainer />
  </div>
</template>

<style scoped></style>
