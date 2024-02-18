<template>
  <div>
    <div style="height:calc(100vh - 60px);">
      <RelationGraph ref="graphRef" :options="graphOptions" :on-node-click="onNodeClick" :on-line-click="onLineClick" @node-drag-end="ondragend">

        <template #graph-plug>
          <!-- To facilitate understanding, the CSS style code is directly embedded here. -->
          <div
            style="z-index: 300;position: absolute;left:10px; top: calc(100% - 50px);font-size: 12px;background-color: #ffffff;border:#efefef solid 1px;border-radius: 10px;width:260px;height:40px;display: flex;align-items: center;justify-content: center;">
            图例：
            <div>
              多对一

              <div style="height:5px;width:80px;background-color: rgba(159,23,227,0.65);"></div>
            </div>
            <div style="margin-left:10px;">
              一对一
              <div style="height:5px;width:80px;background-color: rgba(29,169,245,0.76);"></div>
            </div>
          </div>
        </template>
        <template #canvas-plug>
          <!--- You can put some elements that are not allowed to be dragged here --->
          <div
            style="width:500px;height:800px;position:absolute;left:-800px;top:0px;background-color: rgba(15,71,255,0.18);" />
          <div
            style="width:500px;height:800px;position:absolute;left:-250px;top:0px;background-color: rgba(116,255,5,0.24);" />
          <div
            style="width:500px;height:800px;position:absolute;left:300px;top:0px;background-color: rgba(255,247,9,0.24);" />
        </template>
        <template #node="{ node }">
          <div style="width: 300px;background-color: #f39930"><!---------------- if node a ---------------->
            <div>{{ node.text }}
              <!-- - {{ node.data.columns.length }} -->
            </div>
            <table class="c-data-table">
              <tr>
                <th>Column Name</th>
                <th>Data Type</th>
              </tr>
              <template v-for="column of node.data.columns" :key="column.columnName">
                <tr>
                  <td>
                    <div :id="`${node.id}-${column.columnName}`">{{ column.columnName }}</div>
                  </td>
                  <td>{{ column.dataType }}</td>
                </tr>
              </template>
            </table>
          </div>
        </template>
      </RelationGraph>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineComponent, ref, onMounted } from 'vue';
import RelationGraph from 'relation-graph/vue3';
import type { RGOptions, RGNode, RGLine, RGLink, RGUserEvent, RGJsonData, RelationGraphComponent } from 'relation-graph/vue3';

const graphRef = ref<RelationGraphComponent | null>(null);
const graphOptions: RGOptions = {
  debug: false,
  allowSwitchLineShape: true,
  allowSwitchJunctionPoint: true,
  allowShowDownloadButton: false,
  defaultJunctionPoint: 'lr',
  placeOtherNodes: true,
  placeSingleNode: false,
  graphOffset_x: -200,
  graphOffset_y: 100,
  defaultLineMarker: {
    markerWidth: 20,
    markerHeight: 20,
    refX: 3,
    refY: 3,
    data: "M 0 0, V 6, L 4 3, Z"
  },
  layout: {
    layoutName: 'fixed'
  }
  // You can refer to the parameters in "Graph" for setting here

};

onMounted(() => {
  showGraph();
});

const showGraph = async () => {
  const tables = [
    { tableName: '用户表', tableComents: '用户', x: 500, y: -300 },
    { tableName: '部门表', tableComents: '部门', x: 0, y: -300 },
    { tableName: '权限表', tableComents: '权限', x: 0, y: 0 },
    { tableName: '用户权限表', tableComents: '用户权限', x: 500, y: 0 },
    { tableName: '资源表', tableComents: '资源', x: 0, y: 300 },
    { tableName: '资源权限表', tableComents: '权限_资源', x: 500, y: 300 }
  ];
  const tableCols = [
    { tableName: '用户表', columnName: '唯一索引', dataType: 'varchar(36)' },
    { tableName: '用户表', columnName: '用户名', dataType: 'varchar(50)' },
    { tableName: '用户表', columnName: '部门_唯一索引', dataType: 'varchar(36)' },
    { tableName: '用户表', columnName: '创建时间', dataType: 'TIMESTAMP' },
    { tableName: '用户表', columnName: '状态', dataType: 'varchar(1)' },
    { tableName: '部门表', columnName: '唯一索引', dataType: 'varchar(36)' },
    { tableName: '部门表', columnName: '部门', dataType: 'varchar(50)' },
    { tableName: '部门表', columnName: '父部门_唯一索引', dataType: 'varchar(50)' },
    { tableName: '部门表', columnName: '创建时间', dataType: 'TIMESTAMP' },
    { tableName: '部门表', columnName: '状态', dataType: 'varchar(50)' },
    { tableName: '权限表', columnName: '唯一索引', dataType: 'varchar(36)' },
    { tableName: '权限表', columnName: '权限', dataType: 'varchar(36)' },
    { tableName: '权限表', columnName: '创建时间', dataType: 'TIMESTAMP' },
    { tableName: '用户权限表', columnName: '唯一索引', dataType: 'varchar(36)' },
    { tableName: '用户权限表', columnName: '用户_唯一索引', dataType: 'varchar(36)' },
    { tableName: '用户权限表', columnName: '权限_唯一索引', dataType: 'varchar(36)' },
    { tableName: '用户权限表', columnName: '创建时间', dataType: 'TIMESTAMP' },
    { tableName: '用户权限表', columnName: '状态', dataType: 'varchar(36)' },
    { tableName: '资源表', columnName: '唯一索引', dataType: 'varchar(36)' },
    { tableName: '资源表', columnName: '资源名称', dataType: 'varchar(36)' },
    { tableName: '资源表', columnName: '创建时间', dataType: 'TIMESTAMP' },
    { tableName: '资源权限表', columnName: '唯一索引', dataType: 'varchar(36)' },
    { tableName: '资源权限表', columnName: '权限_唯一索引', dataType: 'varchar(36)' },
    { tableName: '资源权限表', columnName: '资源_唯一索引', dataType: 'varchar(36)' },
    { tableName: '资源权限表', columnName: '状态', dataType: 'varchar(1)' },
  ];
  const columnRelations = [
    { sourceTableName: '用户表', sourceColumnName: '部门_唯一索引', type: 'MORE_TO_ONE', targetTableName: '部门表', targetColumnName: '唯一索引' },
    { sourceTableName: '部门表', sourceColumnName: '父部门_唯一索引', type: 'ONE_TO_ONE', targetTableName: '部门表', targetColumnName: '唯一索引' },
    { sourceTableName: '用户权限表', sourceColumnName: '用户_唯一索引', type: 'MORE_TO_ONE', targetTableName: '用户表', targetColumnName: '唯一索引' },
    { sourceTableName: '用户权限表', sourceColumnName: '权限_唯一索引', type: 'MORE_TO_ONE', targetTableName: '权限表', targetColumnName: '唯一索引' },
    { sourceTableName: '资源权限表', sourceColumnName: '权限_唯一索引', type: 'MORE_TO_ONE', targetTableName: '权限表', targetColumnName: '唯一索引' },
    { sourceTableName: '资源权限表', sourceColumnName: '资源_唯一索引', type: 'MORE_TO_ONE', targetTableName: '资源表', targetColumnName: '唯一索引' },
  ]
  const graphNodes = tables.map(table => {
    const { tableName, tableComents, x, y } = table;
    return {
      id: tableName,
      text: tableComents,
      x,
      y,
      nodeShape: 1,
      data: { // Costomer key have to in data

        columns: tableCols.filter(col => col.tableName === table.tableName)
      }
    }
  });
  const graphLines = columnRelations.map(relation => {
    return {
      from: relation.sourceTableName + '-' + relation.sourceColumnName, // HtmlElement id

      to: relation.targetTableName + '-' + relation.targetColumnName, // HtmlElement id

      color: relation.type === 'ONE_TO_ONE' ? 'rgba(29,169,245,0.76)' : 'rgba(159,23,227,0.65)',
      text: '',
      fromJunctionPoint: 'left',
      toJunctionPoint: 'lr',
      lineWidth: 3,
      lineShape: 4,

    }
  });
  const graphJsonData: RGJsonData = {
    nodes: graphNodes,
    lines: [
    ],
    elementLines: graphLines

  };
  const graphInstance = graphRef.value?.getInstance();
  if (graphInstance) {
    console.log(graphInstance);
    
    await graphInstance.setJsonData(graphJsonData);
    await graphInstance.moveToCenter();
    await graphInstance.zoomToFit();
  }
};

const onNodeClick = (nodeObject: RGNode, $event: RGUserEvent) => {
  console.log('onNodeClick:', nodeObject);
};

const onLineClick = (lineObject: RGLine, linkObject: RGLink, $event: RGUserEvent) => {
  console.log('onLineClick:', lineObject);
};
const ondragend = (nodeObject: RGNode, $event: RGUserEvent) => {
console.log('ondragend:', nodeObject);
}
</script>

<style lang="scss" scoped>
::v-deep(.relation-graph) {
  .rel-node-shape-1 {
    overflow: hidden;
  }
}

.c-data-table {
  background-color: #ffffff;
  border-collapse: collapse;
  width: 100%;
}

.c-data-table td,
.c-data-table th {
  border: 1px solid #f39930;
  color: #333333;
  padding: 5px;
  padding-left: 20px;
  padding-right: 20px;
}

.c-data-table td div,
.c-data-table th div {
  background-color: #1da9f5;
  color: #ffffff;
  border-radius: 5px;
}</style>
