import { Graph, Node } from "@antv/x6";

export const registerNode = () => {
  // 注册x6节点
  registerCustomGroupNode();
};

// 注册组合节点
export const registerCustomGroupNode = () => {
  Graph.registerNode(
    "custom-group-node",
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
      "labelRect": {
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
  });

  const createGroup = (
    id: string,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    stroke: string
  ) => {
    const group = new Group({
      id,
      x,
      y,
      width,
      height,
      attrs: {
        body: {
          fill: fill || undefined,
          stroke,
          strokeWidth: 1,
        },
        label: {
          text: id,
        },
      },
    });
    graph.addNode(group);
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
      shape: "custom-group-node",
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
  graph.on("node:collapse", ({ node }: { node: Group }) => {
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
  return { Group, createGroup, createNode, createEdge };
};
