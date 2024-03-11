import { Graph, Node } from "@antv/x6";
import { register } from "@antv/x6-vue-shape";
import erEntityNode from "../components/er-node/index.vue";

const LINE_HEIGHT = 24;
const NODE_WIDTH = 150;
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
      tagName: "rect",
      selector: "labelRect",
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
    labelRect: {
      refWidth: "100%",
      height: 30,
      fill: "#5F95FF",
    },
    label: {
      ref: "labelRect",
      refY: 10,
      refX: 0.5,
      textAnchor: "middle",
      // fontWeight: "bold",
      fill: "#fff",
      fontSize: 12,
    },
  },
  ports: {
    groups: {
      portRight: {
        position: { name: "right" },
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5f95ff",
            fill: "#fff",
            x: -6,
            y: -6,
            strokeWidth: 1,
          },
        },
      },
      portLeft: {
        // position: { name: 'right' },
        attrs: {
          circle: {
            r: 4,
            magnet: true,
            stroke: "#5f95ff",
            fill: "#fff",
            x: -6,
            y: -6,
            strokeWidth: 1,
          },
        },
      },
    },
    items: [
      { id: "port1", group: "portLeft" },
      { id: "port2", group: "portRight" },
      // { id: "port3", group: "portLeft" },
      // { id: "port4", group: "portLeft" },
    ],
  },
});
export { Group };

class Entity extends Node {
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

Entity.config({
  markup: [
    {
      tagName: "rect",
      selector: "body",
    },
    {
      tagName: "rect",
      selector: "labelRect",
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
    labelRect: {
      refWidth: "100%",
      height: 30,
      fill: "#5F95FF",
    },
    label: {
      ref: "labelRect",
      refY: 10,
      refX: 0.5,
      textAnchor: "middle",
      // fontWeight: "bold",
      fill: "#fff",
      fontSize: 12,
    },
  },
  ports: {
    groups: {
      right: {
        position: "right",
        attrs: {
          circle: {
            magnet: true,
            stroke: "#8f8f8f",
            r: 5,
          },
        },
      },
      list: {
        markup: [
          {
            tagName: "rect",
            selector: "portBody",
          },
          {
            tagName: "text",
            selector: "portNameLabel",
          },
          {
            tagName: "line",
            selector: "line",
          },
          {
            tagName: "text",
            selector: "portTypeLabel",
          },
        ],
        attrs: {
          portBody: {
            width: NODE_WIDTH,
            height: LINE_HEIGHT,
            strokeWidth: 1,
            fill: "transparent",
            stroke: "#5F95FF",
            // fill: '#EFF4FF',
          },
          portNameLabel: {
            ref: "portBody",
            refX: 6,
            refY: 6,
            fontSize: 10,
            // fill: '#EFF4FF',
            fill: "transparent",
            magnet: true,
          },
          portTypeLabel: {
            ref: "portBody",
            refX: 95,
            refY: 6,
            fontSize: 10,
            fill: "transparent",
            // fill: '#5F95FF',
            // r:5,
            magnet: true,
          },
        },
        position: "erPortPosition",
      },
    },
  },
});
export const addNodeCollapseListener = (graph) => {
  graph.on("node:collapse", ({ node }: { node: Group }) => {
    console.log("collapse", node);
    node.toggleCollapse();
    const collapsed = node.isCollapsed();
    const collapse = (parent: Group) => {
      const cells = parent.getChildren();
      if (cells) {
        cells.forEach((cell) => {
          if (collapsed) {
            cell.hide();
          } else {
            cell.show();
          }

          if (cell instanceof Group) {
            if (!cell.isCollapsed()) {
              collapse(cell);
            }
          }
        });
      }
    };
    collapse(node);
  });
};

// 注册组合节点
export const registerCustomGroupNode = () => {
  Graph.registerNode(
    "container-node",
    {
      inherit: "rect",
      width: 100,
      height: 200,
      attrs: {
        body: {
          stroke: "#8f8f8f",
          strokeWidth: 1,
          fill: "#fff",
          rx: 6,
          ry: 6,
        },
      },
    },
    true
  );
};

export const useGroup = (graph) => {
  const createEntity = ({ id, label, width, height, ports }) => {
    const entity = new Entity({
      id,
      label,
      width,
      height,
      ports,
      attrs: {
        label: {
          text: label,
        },
      },
    });
    return entity;
  };
  interface GroupParams {
    resizable?: boolean;
    shape?: string;
    zIndex?: number;
    others: any;
  }

  const createGroup = (
    text: string,
    width: number,
    height: number,
    fill: string,
    stroke: string,
    id: string,
    params: GroupParams
  ) => {
    const { resizable, others, zIndex } = params || {};
    const group = new Group({
      shape: "container",
      id,
      width,
      height,
      data: { parent: true, resizable: resizable, zIndex },
      tools: [
        {
          name: "node-editor",
          args: {
            x: 0,
            y: 0,
            height: LINE_HEIGHT,
            getText({ cell }) {
              return cell?.attrs?.text?.text?.trim() || "";
            },
            setText: ({ cell, value }) => {
              cell.attr("text/text", value);
              cell.setData({
                handler: {
                  type: "group:title:update",
                  title: value,
                },
              });
              cell.setData({
                handler: null,
              });
              // 'text/text'
            },
            // setText({cell, text}){
            //   console.log(cell,text);

            // },
            attrs: {
              backgroundColor: "transparent",
              color:'#fff'
            },
          },
        },
      ],
      attrs: {
        body: {
          fill: fill || undefined,
          stroke,
          strokeWidth: 1,
        },
        text: {
          text,
        },
        // label: {
        //   text,
        // },
      },
      ...(others || {}),
    });
    // graph.createTransformWidget(group);
    return group;
  };

  const createNode = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    return graph.addNode({
      shape: "container-node",
      id,
      x,
      y,
      width,
      height,
      label: id,
    });
  };

  const createEdge = (
    id: string,
    source: string,
    target: string,
    vertices?: { x: number; y: number }[]
  ) => {
    return graph.addEdge({
      id,
      source,
      target,
      vertices,
      label: id,
      attrs: {
        line: {
          stroke: "#8f8f8f",
          strokeWidth: 1,
        },
      },
    });
  };

  return { Group, createGroup, createNode, createEdge, createEntity };
};

// 注册er图节点
export const registerNode = () => {
  const ratio = 2 / 3;
  const LINE_HEIGHT = 30;
  const NODE_WIDTH = 160;
  Graph.registerPortLayout(
    "erPortPosition",
    (portsPositionArgs, elemBBox) => {
      return portsPositionArgs.map((_, index) => {
        return {
          position: {
            x: 0,
            y:
              elemBBox.height < LINE_HEIGHT
                ? 0
                : (index + 1) * LINE_HEIGHT * ratio,
          },
          zIndex: 1,
          angle: 0,
        };
      });
    },
    true
  );

  register({
    shape: "entity-node",
    component: erEntityNode,
    zIndex: 2,
    ports: {
      groups: {
        right: {
          // position: 'top',
          position: {
            name: "absolute",
            args: { x: "100%", y: ratio * LINE_HEIGHT * 0.5 },
          },
          attrs: {
            circle: {
              magnet: true,
              r: 5,
              stroke: "#3199FF",
              fill: "#fff",
              strokeWidth: 1,
            },
          },
        },
        list: {
          zIndex: 1,
          markup: [
            {
              tagName: "rect",
              selector: "portBody",
              className: "port-body",
            },
            {
              tagName: "circle",
              selector: "portNameLabel",
              className: "port-name-label",
            },
            // {
            //   tagName: 'line',
            //   selector: 'line',
            // },
            {
              tagName: "circle",
              selector: "portTypeLabel",
            },
          ],
          attrs: {
            portBody: {
              width: NODE_WIDTH * ratio,
              height: LINE_HEIGHT * ratio,
              // height: LINE_HEIGHT * ratio,
              strokeWidth: 1,
              // stroke: 'transparent',
              fill: "transparent",
              // magnet: true,
              zIndex: 0,
            },
            portNameLabel: {
              ref: "portBody",
              refX: 0,
              refY: (LINE_HEIGHT * ratio) / 2,
              fontSize: 10,
              stroke: "#3199FF",
              fill: "#fff",
              magnet: true,
              zIndex: 2,
              r: 5,
            },
            portTypeLabel: {
              ref: "portBody",
              refX: "100%",
              refY: (LINE_HEIGHT * ratio) / 2,
              fontSize: 10,
              stroke: "#3199FF",
              fill: "#fff",
              zIndex: 2,
              r: 5,
              magnet: true,
            },
          },
          position: "erPortPosition",
        },
      },
    },
  });

  Graph.registerNode(
    "er-rect",
    {
      inherit: "rect",
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
          tagName: "rect",
          selector: "button",
          attrs: {
            fill: "none",
            "pointer-events": "none",
          },
        },
        {
          tagName: "text",
          selector: "buttonLabel",
        },
      ],
      attrs: {
        rect: {
          magnet: true,
          strokeWidth: 1,
          stroke: "#5F95FF",
          fill: "#5F95FF",
        },
        label: {
          fontWeight: "bold",
          fill: "#ffffff",
          fontSize: 12,
        },
        buttonLabel: {
          ref: "button",
          text: "+",
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
        },
      },
      ports: {
        groups: {
          list: {
            markup: [
              {
                tagName: "rect",
                selector: "portBody",
              },
              {
                tagName: "text",
                selector: "portNameLabel",
              },
              {
                tagName: "text",
                selector: "portTypeLabel",
              },
            ],
            attrs: {
              portBody: {
                width: NODE_WIDTH,
                height: LINE_HEIGHT,
                strokeWidth: 1,
                stroke: "#5F95FF",
                fill: "#EFF4FF",
              },
              portNameLabel: {
                ref: "portBody",
                refX: 6,
                refY: 6,
                fontSize: 10,
                fill: "#EFF4FF",
                magnet: true,
              },
              portTypeLabel: {
                ref: "portBody",
                refX: 95,
                refY: 6,
                fontSize: 10,
                fill: "#EFF4FF",
                magnet: true,
              },
            },
            position: "erPortPosition",
          },
        },
      },
    },
    true
  );
};
