<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router';
import { $http } from "../common/http";
import { addTabByUrl } from '../common/utils/index'
import dayjs from 'dayjs'
import GanttVue from "@/components/Gantt.vue";
const service = ref("srvoa_project_wbs_select");
const app = ref('oa')
const page = reactive({ pageNo: 1, rownumber: 500, total: 0 });
// {id: 1, text: "Project #2", start_date: "2023-04-01", duration: 18, progress: 0.4, open: true }
const originData = ref([])
const ganttData = ref([])
const ganttColumns = ref([])
const config = reactive({
  app: 'oa',
  service: 'srvoa_project_wbs_select',
  nameCol: 'wbs_name',
  // startCol:'start_date',
  endCol: 'deadline',
  durationCol: 'plan_workload',
  durationUnit: 'hour',//默认为天
  progressCol: 'wbs_progress',
  statusCol: "wbs_status",
  idCol: 'wbs_no',
  parentCol: 'parent_no',
  // openCol:'open'
})
const route = useRoute()
const loading = ref(false)
const parentNos = route.query?.pIds || 'WBS2312250001,WBS2310140007,WBS2310140001,WBS2310300034'
const fetchData = async () => {
  const url = `/${app.value}/select/${service.value}`
  const paths = parentNos.split(',').map(item => {
    return {
      colName: 'path',
      ruleType: 'like]',
      value: `/${item}/`
    }
  })
  const req = {
    serviceName: service.value,
    colNames: ["*"],
    condition: [],
    page: { pageNo: page.pageNo, rownumber: page.rownumber },
    order: [],
    use_type: "treelist",
    relation_condition: {
      relation: 'OR',
      data: [
        ...paths
        // {
        //   colName: config.parentCol,
        //   ruleType: 'in',
        //   value: parentNos
        // },
        // {
        //   colName: config.idCol,
        //   ruleType: 'in',
        //   value: parentNos
        // },
        // ...paths
      ]
    }
  };
  const res = await $http.post(url, req);
  if (res.data?.page?.total) {
    page.total = res.data.page.total
  }
  originData.value = res.data.data
  ganttData.value = initGanttData(res.data.data, config)
  ganttColumns.value = initColumns(config)
};
const initGanttData = (data = [], config = {}) => {
  return data.map(item => {
    const obj = {
      _data: {
        ...item
      }
    }
    obj.id = item[config.idCol]
    obj.text = item[config.nameCol]
    obj.open = !!item[config.openCol] || !item[config.parentCol] || false
    obj.parent = item[config.parentCol]
    obj.progress = item[config.progressCol] / 100
    obj.end_date = item[config.endCol]
    if (config.durationUnit === 'hour') {
      obj.duration = item[config.durationCol] / 8
    } else {
      obj.duration = item[config.durationCol]
    }
    if (!config?.startCol && config.endCol && config.durationCol) {
      obj.start_date = dayjs(obj.end_date).subtract(obj.duration, 'day').format('YYYY-MM-DD')
    } else {
      obj.start_date = item[config.startCol]
    }
    obj.status = item[config.statusCol]
    return obj
  })
}
const initColumns = (config = {}) => {
  const columns = [
    {
      name: "text", label: "标题", tree: true, width: '*', template: function (obj) {
        return `<span style="cursor:pointer" title="${obj.text}">${obj.text}</span>`
      }
    },
    { name: "end_date", label: "完成时间点", align: "center" },
    {
      name: "status", label: '状态', align: 'center',
      template: function (obj) {
        let result = ''
        const statusMp = {
          '待安排': '1',
          '已安排': '2',
          '进行中': '3',
          '待验收': '4',
          '已完成': '5',
          '挂起': '6',
          '关闭': '7'
        }
        result = `<div class="progress status-${statusMp[obj.status]}"><div class="text">${obj.status}</div></div>`
        return result
      }
    },
    {
      name: "progress", label: "进度", align: "center",
      template: function (obj) {
        if (obj.progress) {
          return `<div class="progress">${parseInt(obj.progress * 100)}%</div>`
        } else {
          return '0'
        }
      }
    },
    // { name: "add", label: "" }
  ]
  return columns
}
const onTaskDblClick = (id) => {
  console.log('onTaskDblClick', id)
  const data = ganttData.value.find(item => item._data[config.idCol] === id)
  if (data?._data?.id) {
    const url = `/vpages/#/detail/${config.service}/${data._data.id}`
    addTabByUrl(url, data.text)
  }
}
onMounted(async () => {
  loading.value = true
  await fetchData()
  loading.value = false
})
onUnmounted(() => {
  gantt.destructor();
})
</script>

<template>
  <div class="page-wrap">
    <GanttVue :data="ganttData" :columns="ganttColumns" v-loading="loading" @onTaskDblClick="onTaskDblClick" />
  </div>
</template>

<style lang="scss">
.page-wrap {
  width: 100vw;
  height: 100vh;

  .gantt_tree_content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .progress {
    display: flex;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;

    .text {
      display: inline-block;
      border-radius: 20px;
      height: 24px;
      line-height: 24px;
      padding: 0 10px;
      background-color: #eee;
    }
  }

  .status-2 .text {
    color: #fff;
    background-color: #409eff;
  }

  .status-3 .text {
    color: #fff;
    background-color: #18df64;
  }
}
</style>
