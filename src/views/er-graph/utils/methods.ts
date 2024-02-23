import "@antv/x6-vue-shape";
import { useGroup } from "./x6util";
import { uniqueId } from "lodash-es";
import { Graph, Node } from "@antv/x6";
// import { Graph,Shape,Addon,FunctionExt} from '@antv/x6'
import { Dnd } from "@antv/x6-plugin-dnd";

class Group extends Node {
  private collapsed = false;
  private expandSize: { width: number; height: number };

  protected postprocess() {
    this.toggleCollapse(false);
  }

  isCollapsed() {
    return this.collapsed;
  }

  toggleCollapse(collapsed?: boolean) {
    const target = collapsed == null ? !this.collapsed : collapsed;
    if (target) {
      this.attr("buttonSign", { d: "M 1 5 9 5 M 5 1 5 9" });
      this.expandSize = this.getSize();
      this.resize(100, 32);
    } else {
      this.attr("buttonSign", { d: "M 2 5 8 5" });
      if (this.expandSize) {
        this.resize(this.expandSize.width, this.expandSize.height);
      }
    }
    this.collapsed = target;
  }
}

Group.config({
  markup: [
    {
      tagName: "rect",
      selector: "body",
    },
    {
      tagName: "text",
      selector: "label",
    },
    {
      tagName: "g",
      selector: "buttonGroup",
      children: [
        {
          tagName: "rect",
          selector: "button",
          attrs: {
            "pointer-events": "visiblePainted",
          },
        },
        {
          tagName: "path",
          selector: "buttonSign",
          attrs: {
            fill: "none",
            "pointer-events": "none",
          },
        },
      ],
    },
  ],
  attrs: {
    body: {
      refWidth: "100%",
      refHeight: "100%",
      strokeWidth: 1,
      fill: "#ffffff",
      stroke: "none",
    },
    buttonGroup: {
      refX: 8,
      refY: 8,
    },
    button: {
      height: 14,
      width: 16,
      rx: 2,
      ry: 2,
      fill: "#f5f5f5",
      stroke: "#ccc",
      cursor: "pointer",
      event: "node:collapse",
    },
    buttonSign: {
      refX: 3,
      refY: 2,
      stroke: "#808080",
    },
    label: {
      fontSize: 12,
      fill: "#fff",
      refX: 32,
      refY: 10,
    },
  },
});

// 拖拽生成四边形或者圆形
export const startDragToGraph = (graph, type, e) => {
  const { createGroup, createEntity } = useGroup(graph);
  let node = null;
  switch (type) {
    case "Rect":
      node = graph.createNode({
        width: 100,
        height: 60,
        attrs: {
          label: {
            text: "正方形节点",
            fill: "#000000",
            fontSize: 14,
            textWrap: {
              width: -10,
              height: -10,
              ellipsis: true,
            },
          },
          body: {
            stroke: "#000000",
            strokeWidth: 1,
            fill: "#ffffff",
          },
        },
        tools: [
          // { name: 'contextmenu',args:{

          // }},
          {
            name: "node-editor",
            args: {
              attrs: {
                backgroundColor: "#fff",
              },
            },
          },
        ],
        ports: ports,
      });
      break;
    case "Circle":
      node = graph.createNode({
        shape: "ellipse",
        width: 100,
        height: 100,
        attrs: {
          label: {
            text: "圆形节点",
            fill: "#000000",
            fontSize: 14,
            textWrap: {
              width: -20,
              height: -10,
              ellipsis: true,
            },
          },
          body: {
            stroke: "#000000",
            strokeWidth: 1,
            fill: "#ffffff",
          },
        },
        tools: [
          {
            name: "node-editor",
            args: {
              attrs: {
                backgroundColor: "#fff",
              },
            },
          },
        ],
        ports: ports,
      });
      break;
    case "Container":
      node = createGroup(
        "容器",
        100,
        150,
        null,
        "#5F95FF",
        uniqueId(type + "_"),
        { resizable: true, zIndex: 0 }
      );
      node.setZIndex(0);
      break;
    case "ER":
      const list = [
        {
          id: "1-1",
          label: "姓名",
          column: "name",
          type: "string",
        },
        {
          id: "1-2",
          label: "年龄",
          column: "age",
          type: "int",
        },
        {
          id: "1-3",
          label: "性别",
          column: "gender",
          type: "enum",
        },
      ];
      node = graph.createNode({
        shape: "entity-node",
        
        data: {
          title: "学生",
          colsList: list,
        },
        ports: list.map((item) => {
          return {
            id: item.id,
            group: "list",
            data: {
              ...item,
            },
            attrs: {
              portNameLabel: {
                text: item.label,
              },
              portTypeLabel: {
                text: item.type,
              },
            },
          };
        }),
      });

      break;
    default:
      node = graph.createNode({
        shape: "polygon",
        x: 40,
        y: 40,
        width: 120,
        height: 120,
        attrs: {
          label: {
            text: "条件节点",
            fill: "#000000",
            fontSize: 14,
            textWrap: {
              width: -50,
              height: "70%",
              ellipsis: true,
            },
          },
          body: {
            fill: "#ffffff",
            stroke: "#000000",
            refPoints: "0,10 10,0 20,10 10,20",
            strokeWidth: 1,
          },
        },
        tools: [
          {
            name: "node-editor",
            args: {
              attrs: {
                backgroundColor: "#fff",
              },
            },
          },
        ],
        ports: ports,
      });
      break;
  }

  const dnd = new Dnd({ target: graph });
  dnd.start(node, e);
};
const ports = {
  groups: {
    // 输入链接桩群组定义
    top: {
      position: "top",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    // 输出链接桩群组定义
    bottom: {
      position: "bottom",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    left: {
      position: "left",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
    right: {
      position: "right",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "#2D8CF0",
          strokeWidth: 2,
          fill: "#fff",
        },
      },
    },
  },
  items: [
    {
      id: "port1",
      group: "top",
    },
    {
      id: "port2",
      group: "bottom",
    },
    {
      id: "port3",
      group: "left",
    },
    {
      id: "port4",
      group: "right",
    },
  ],
};
