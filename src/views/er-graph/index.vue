<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Graph, Cell, Shape, Node } from "@antv/x6";
import { register, getTeleport } from "@antv/x6-vue-shape";
import erEntityNode from "./components/er-node/index.vue";
import { Transform } from "@antv/x6-plugin-transform";
import { Selection } from "@antv/x6-plugin-selection";
import {
  registerCustomGroupNode,
  addNodeCollapseListener,
  registerNode,
} from "./utils/x6util";
import { ErConfig } from "./common/type";
import { startDragToGraph } from "./utils/methods";
import { $http } from "@/common/http";
import { useRoute } from "vue-router";
// 注册组件
import leftDrawer from "./components/left-drawer/index.vue";
import rightDrawer from "./components/right-drawer/index.vue";
import { ElMessage } from "element-plus";

const route = useRoute();

const TeleportContainer = getTeleport();

// const _erConfig = computed<ErConfig>(() => {
//   return erConfig
// })

let container: HTMLElement | undefined;
let graph;

// 挂载完成后
onMounted(async () => {
  container = document.getElementById("container") as HTMLElement | undefined;
  registerNode();
  registerCustomGroupNode();
  // getData();
  // 创建画布
  createGraph();
  await initData();
});

const initData = async () => {
  if (cfgNo?.value) {
    // 查询配置
    await getErCfg(cfgNo?.value);
    // 查询表
    const tables = await getErEntityData();
    if (Array.isArray(tables) && tables.length > 0) {
      // 查询字段
      const columns = await getTableColumns(tables);
      const finalTables = tables.map((item) => {
        return {
          ...item,
          columns: columns.filter((col) => col._fk_obj_no === item._no),
        };
      });
      const nodes = finalTables.map((item, index) => {
        return {
          shape: "entity-node",
          x: ((index % 5) - 2.5) * 150,
          y: parseInt(index / 5) * 100,
          width: item._title?.length * 18 + 80,
          data: {
            title: item._title,
            colsList: item.columns,
            no: item._no
            // colsList: list,
          },
          ports: [
            {
              id: item._no,
              group: "right",
            },
            ...item.columns.map((col) => {
              return {
                group: "list",
                data: {
                  id: col._no,
                  name: col._title,
                  type: col._type,
                  // ...col,
                },
              };
            }),
          ],
        };
      });
      graph.addNodes(nodes);
    }
    // 查询分组容器数据
    await getErGroupData();
  }
};

const cfgNo = ref(route?.params?.cfgNo || route?.query?.cfgNo || route?.query?.cfg);

let erConfig: ErConfig;
const getErCfg = async (er_no) => {
  // 查询er图配置
  const req = {
    serviceName: "srvtools_er_model_cfg_select",
    colNames: ["*"],
    condition: [
      {
        colName: "er_no",
        ruleType: "eq",
        value: er_no,
      },
    ],
    page: { pageNo: 1, rownumber: 1 },
  };
  const url = `/config/select/srvtools_er_model_cfg_select`;
  const res = await $http.post(url, req);
  if (Array.isArray(res.data.data) && res.data.data.length > 0) {
    const data = res.data.data[0];
    erConfig = {
      items_add_srv: "srvoa_project_data_table_col_add", // 目前没有这个配置 暂时写死
      ...(data || {}),
    };
    return data;
  } else if (res?.data?.resultCode === "0011") {
    openLoginDialog();
  }
};

const erEntityData = ref(null);
const getErEntityData = async () => {
  // 查询er图实体数据
  const serviceName = erConfig?.obj_select_srv;
  const req = {
    serviceName: serviceName,
    colNames: ["*"],
    page: { pageNo: 1, rownumber: 10 },
  };
  const url = `/${erConfig.er_mapp}/select/${serviceName}`;
  const res = await $http.post(url, req);
  erEntityData.value = res.data.data.map((item) => {
    return {
      _origin_data: item,
      _no: item[erConfig.obj_col_no], //编号
      _title: item[erConfig.obj_col_title], //标题
      _fk_group_no: item[erConfig.obj_col_fk_group_no], //归属分组编号
    };
  });
  return erEntityData.value;
};

const tableColumns = ref([]);
const getTableColumns = async (tables = []) => {
  // 查询er图实体的字段
  const tableIds = tables.map((item) => item._no);
  const serviceName = erConfig.items_select_srv;
  const req = {
    serviceName: serviceName,
    colNames: ["*"],
    condition: [
      {
        colName: erConfig.items_col_fk_obj_no,
        ruleType: "in",
        value: tableIds.toString(),
      },
    ],
    page: { pageNo: 1, rownumber: 10 },
  };
  const url = `/${erConfig.er_mapp}/select/${serviceName}`;
  const res = await $http.post(url, req);
  console.log(res);

  tableColumns.value = res.data.data.map((item) => {
    return {
      _origin_data: item,
      _fk_obj_no: item[erConfig.items_col_fk_obj_no], //归属对象编号
      _title: item[erConfig.items_col_title], //字段标题
      _type: item[erConfig.items_col_type], //字段类型
      _no: item[erConfig.items_col_no], //字段编号
    };
  });
  return tableColumns.value;
};

const getErGroupData = async () => {
  // 查询er图容器数据
  const serviceName = erConfig.group_select_srv;
  const req = {
    serviceName: serviceName,
    colNames: ["*"],
    page: { pageNo: 1, rownumber: 10 },
  };
  const url = `/${erConfig.er_mapp}/select/${serviceName}`;
  const res = await $http.post(url, req);
  return res.data.data;
};
const updateGroupTitle = async (title) => {
  console.log('updateGroupTitle',title);
  
}
const updateObjTitle = async (item) => {
  const serviceName = erConfig.obj_update_srv;
  const req = [
    {
      serviceName: serviceName,
      condition: [
        {
          colName: erConfig.obj_col_no,
          ruleType: "eq",
          value: item.no,
        },
      ],
      data: [
        {
          colName: erConfig.obj_col_title,
          value: item.title,
        },
      ],
    }
  ]
  const url = `/${erConfig.er_mapp}/update/${serviceName}`
  const res = await $http.post(url, req);
  if (res.data.state === 'SUCCESS') {
    ElMessage.success('修改成功')
    const resData = res.data.response?.[0]?.response?.effect_data?.[0]
    console.log('updateObjTitleResData', resData);
    return resData
  }
}

const updateItem = async (item) => {
  const serviceName = erConfig.items_update_srv;
  const data = {}
  if (item._type !== item._origin_data[erConfig.items_col_type]) {
    data[erConfig.items_col_type] = item._type
  }

  if (item._title !== item._origin_data[erConfig.items_col_title]) {
    data[erConfig.items_col_title] = item._title
  }
  const req = [
    {
      serviceName: serviceName,
      condition: [
        {
          colName: erConfig.items_col_no,
          ruleType: "eq",
          value: item._no,
        },
      ],
      data: [data],
    }
  ]


  const url = `/${erConfig.er_mapp}/update/${serviceName}`
  const res = await $http.post(url, req);
  if (res.data.state === 'SUCCESS') {
    ElMessage.success('修改成功')
    const resData = res.data.response?.[0]?.response?.effect_data?.[0]
    console.log('updateItemResData', resData);
    return resData
  }
}

const addItem = async (item) => {
  const url = `/${erConfig.er_mapp}/add/${erConfig?.items_add_srv}`
  const req = [
    {
      serviceName: erConfig?.items_add_srv,
      condition: [],
      data: [
        {
          col_name: item._title,
          // col_en: item.value,
          col_type: item._type,
          col_no: item._id,
          tbl_no: item._fk_obj_no,
          parent_no: "/",
          path: `/${item._id}/`,
        },
      ],
    },
  ];
  const res = await $http.post(url, req);
  if (res.data.state === 'SUCCESS') {
    ElMessage.success('添加成功')
  }
};

const operateData = (data, type) => {

}

const selectedCell = ref(null);
// 创建画布
const createGraph = () => {
  graph = new Graph({
    container: container,
    // height: 1080,
    background: { color: "#fff" }, // 创建画布时初始化背景相关配置对象
    grid: { size: 10, visible: true, type: "mesh" }, //创建画布时，通过配置对象来设置背景网格
    panning: true, // 画布是否可以拖动
    mousewheel: true, // 画布是否可以鼠标滚轮缩放
    connecting: {
      router: {
        name: "er",
        args: {
          offset: 25,
          direction: "H",
        },
      },
      createEdge() {
        return new Shape.Edge({
          attrs: {
            line: {
              stroke: "#A2B1C3",
              strokeWidth: 1,
            },
          },
        });
      },
    },
    embedding: {
      enabled: true,
      findParent({ node }) {
        const bbox = node.getBBox();
        return this.getNodes().filter((node) => {
          const data = node.getData();
          if (data && data.parent) {
            const targetBBox = node.getBBox();
            return bbox.isIntersectWithRect(targetBBox);
          }
          return false;
        });
      },
    },
  });

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
        minWidth: 20, // 最小宽度
      },
      rotating: {
        enabled(node) {
          // 判断节点是否可旋转角度
          return node.isNode() && node.data?.rotatable === true;
        },
      },
    })
  );
  graph.use(
    new Selection({
      enabled: true,
      showNodeSelectionBox: true,
      showEdgeSelectionBox: false,
      pointerEvents: "none",
      className: "on-selection",
      // rubberband:true
    })
  );

  // 注册节点展开收起监听事件
  addNodeCollapseListener(graph);

  graph.on("node:change:data", (e) => {
    // 监听节点父级变化事件
    const { current } = e
    if (current?.handler?.type) {
      console.log("node:change:data:", e);
    }
    if (current?.handler?.type) {
      const { type } = current.handler
      switch (type) {
        // er图标题更改
        case 'ernode:title:update':
          updateObjTitle({
            title: current.handler.item,
            no: current.no
          })
          break;
        // er图子项目更改
        case 'ernode:item:update':
          updateItem(current.handler.item)
          break;
        // er图子项目新增
        case 'ernode:item:add':
          addItem(current.handler.item)
          break;
        // 容器标题更改
        case 'group:title:update':
          updateGroupTitle(current.handler.title)
          break;
        default:
          break;
      }
    }
  });

  graph.on("node:change:parent", ({ node }) => {
    // 监听节点父级变化事件
    console.log("node:change:parent:", node);
  });

  graph.on("node:added", ({ node }) => {
    // 监听节点添加事件
    if (node?.data?.zIndex !== undefined) {
      node.setZIndex(node.data.zIndex);
    }
  });

  graph.on("cell:selected", ({ cell }) => {
    // 监听节点/边选中事件
    console.log(cell, ":::cell:selected");
    selectedCell.value = cell;
    cell.setData({
      selected: true,
    });
  });
  graph.on("cell:unselected", ({ cell }) => {
    // 监听节点/边取消选中事件
    console.log(cell, ":::cell:unselected");
    selectedCell.value = null;
    cell.setData({
      selected: false,
    });
  });

  graph.on("edge:connected", ({ edge, options }) => {
    // console.log(edge, options, 'edge:connected');
    console.log(graph.toJSON());
  });

  graph.on("edge:mouseup", ({ edge, options }) => {
    // console.log(edge, options, 'edge:mouseup');
    if (
      edge?.target?.cell === edge?.id ||
      edge?.target?.cell === edge?._parent?.id
    ) {
      edge.remove();
    }
    if (!edge?.target?.cell) {
      edge.remove();
    }
  });

  function showPorts(ports, show) {
    for (let i = 0, len = ports.length; i < len; i = i + 1) {
      ports[i].style.opacity = show ? "1" : "0";
      // ports[i].style.visibility = show ? 'visible' : 'hidden'
    }
  }

  graph.on("node:mouseenter", ({ node }) => {
    const ports = container.querySelectorAll(
      `.x6-node[data-cell-id="${node.id}"] .x6-port-body`
    );
    showPorts(ports, true);
  });

  graph.on("node:mouseleave", ({ node }) => {
    const ports = container.querySelectorAll(
      `.x6-node[data-cell-id="${node.id}"] .x6-port-body`
    );
    showPorts(ports, false);
  });

  graph.zoomToFit({ padding: 10, maxScale: 1 });
  graph.drawBackground({ color: "#fff" }); // 创建画布后也可调用方法重绘背景
  graph.drawGrid({ type: "mesh" }); // 创建画布后也可调用方法重绘画布网格
  graph.zoom(0.5); // 画布和图形整体的缩放
  graph.translate(200, 40); // 图形相对画布的相对位置，平移
  graph.centerContent(); // 将画布内容中心与视口中心对齐
};

// 拖拽生成元素
const startDrag = (type, e) => {
  console.log(type, e);
  startDragToGraph(graph, type, e);
};

// 登录过期重新登录
const loginRef = ref(null);
const openLoginDialog = () => {
  loginRef.value?.open?.(() => {
    initData();
  });
};
</script>

<template>
  <header class="header">
    <span v-if="erConfig">
      {{ erConfig.er_name }}
    </span>
  </header>
  <main class="container_warp">
    <left-drawer @start-drag="startDrag"></left-drawer>
    <div id="container" class="container"></div>
    <right-drawer :currentCell="selectedCell"></right-drawer>
    <TeleportContainer />
  </main>
  <login-dialog ref="loginRef"></login-dialog>
</template>

<style lang="scss">
@import "@/assets/iconfont.css";

.header {
  height: 50px;
  text-align: center;
  line-height: 50px;
  // background-color:  #e8eaec;
}

.container_warp {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;

  .container {
    flex: 1;
  }

  .x6-node .x6-port-body {
    opacity: 0;
  }

  .x6-node-selected .port-body {
    display: none;
  }

  .x6-edge-selected path:nth-child(2) {
    stroke: #239edd;
    stroke-width: 1.5px;
  }
}
</style>
