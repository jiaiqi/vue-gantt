<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { $http } from "../common/http";
import { addTabByUrl } from "../common/utils/index";
import dayjs from "dayjs";
import GanttVue from "@/components/Gantt.vue";

const page = reactive({ pageNo: 1, rownumber: 500, total: 0 });
// {id: 1, text: "Project #2", start_date: "2023-04-01", duration: 18, progress: 0.4, open: true }
const originData = ref([]);
const ganttData = ref([]);
const ganttColumns = ref([]);
const config = reactive({
  // srv_mapp: "oa",
  // srv_select: "srvoa_project_wbs_select",
  // srv_add: "srvoa_project_wbs_add",
  // srv_update: "srvoa_project_wbs_update",
  // srv_delete: "srvoa_project_wbs_delete",
  // col_title: "wbs_name",
  // col_start_time:'',
  // col_end_time: "deadline",
  // col_duration: "plan_workload", //预估时间
  // col_duration_unit: "hour", //默认为天
  // col_progress: "wbs_progress",
  // col_status: "wbs_status",
  // col_no: "wbs_no",
  // col_parent_no: "parent_no",
  // col_foldl:'open'
});
const route = useRoute();
const loading = ref(false);
const parentNos =
  route.query?.pIds ||
  route.query?.pids ||route.params.pIds||
  "WBS2312250001,WBS2310140007,WBS2310140001,WBS2310300034";
const fetchData = async () => {
  const url = `/${config.srv_mapp}/select/${config.srv_select}`;
  const paths = parentNos.split(",").map((item) => {
    return {
      colName: "path",
      ruleType: "like]",
      value: `/${item}/`,
    };
  });
  const req = {
    serviceName: config.srv_select,
    colNames: ["*"],
    condition: [],
    page: { pageNo: page.pageNo, rownumber: page.rownumber },
    order: [],
    use_type: "treelist",
    relation_condition: {
      relation: "OR",
      data: paths,
    },
  };
  const res = await $http.post(url, req);
  if (res.data?.page?.total) {
    page.total = res.data.page.total;
  }
  originData.value = res.data.data;
  ganttData.value = initGanttData(res.data.data, config);
  ganttColumns.value = initColumns(config);
};
const getGanttCfg = async () => {
  const cfgNo = route.query.cfgNo || route.params.cfgNo;
  const url = `/config/select/srvpage_cfg_com_gantt_cfg_select`;
  const req = {
    serviceName: "srvpage_cfg_com_gantt_cfg_select",
    colNames: ["*"],
    condition: [{
      colName: 'gantt_cfg_no',
      ruleType: 'eq',
      value: cfgNo
    }],
  };
  if (cfgNo) {
    const res = await $http.post(url, req);
    if (res.data.state === "SUCCESS" && res.data.data.length > 0) {
      const keys = ['srv_mapp',
        'srv_select',
        'srv_add',
        'srv_update',
        'srv_delete',
        'col_title',
        'col_start_t',
        'col_end_time',
        'col_duration', //预估时间
        'col_duration_unit', //默认为天
        'col_progress',
        'col_status',
        'col_no',
        'col_parent_no',
        'col_fold']
      keys.forEach(key => {
        if (res.data.data[0][key]) {
          config[key] = res.data.data[0][key]
        }
      })
      // config = reactive({
      //   ...res.data.data[0],
      //   ...config,
      // });
    }
  }
  return config
};
const initGanttData = (data = [], config = {}) => {
  return data.map((item) => {
    const obj = {
      _data: {
        ...item,
      },
    };
    obj.id = item[config.col_no];
    obj.text = item[config.col_title];
    obj.open = item[config.col_fold] === '否' || false;
    obj.parent = item[config.col_parent_no];
    obj.progress = item[config.col_progress] / 100;
    obj.end_date = item[config.col_end_time];
    if (config.col_duration_unit === "hour") {
      obj.duration = item[config.col_progress] / 8;
    } else {
      obj.duration = item[config.col_progress];
    }
    if (!config?.col_start_time && config.col_end_time && config.col_progress) {
      obj.start_date = dayjs(obj.end_date)
        .subtract(obj.duration, "day")
        .format("YYYY-MM-DD");
    } else {
      obj.start_date = item[config.col_start_time];
    }
    obj.status = item[config.statusCol];
    return obj;
  });
};
const initColumns = (config = {}) => {
  const columns = [
    {
      name: "text",
      label: "标题",
      tree: true,
      width: 200,
      template: function (obj) {
        return `<span style="cursor:pointer" title="${obj.text}">${obj.text}</span>`;
      },
    },
    // {
    //   name: "status",
    //   label: "状态",
    //   align: "center",
    //   template: function (obj) {
    //     let result = "";
    //     const statusMp = {
    //       待安排: "1",
    //       已安排: "2",
    //       进行中: "3",
    //       待验收: "4",
    //       已完成: "5",
    //       挂起: "6",
    //       关闭: "7",
    //     };
    //     result = `<div class="progress status-${statusMp[obj.status]
    //       }"><div class="text">${obj.status}</div></div>`;
    //     return result;
    //   },
    // },
    {
      name: "progress",
      label: "进度",
      width: 200,
      align: "center",
      template: function (obj) {
        if (obj.progress) {
          return `<div class="progress">${parseInt(obj.progress * 100)}%</div>`;
        } else {
          return "0";
        }
      },
    },
    // { name: "add", label: "" }
  ];
  if (config.col_start_time) {
    columns.push({ name: "start_date", label: "开始时间点", align: "center", width: 200 })
  }
  if (config.col_end_time) {
    columns.push({ name: "end_date", label: "完成时间点", align: "center", width: 200 })
  }
  return columns;
};
const onTaskDblClick = (id) => {
  console.log("onTaskDblClick", id);
  const data = ganttData.value.find((item) => item._data[config.idCol] === id);
  if (data?._data?.id) {
    const url = `/vpages/#/detail/${config.service}/${data._data.id}`;
    addTabByUrl(url, data.text);
  }
};
onMounted(async () => {
  loading.value = true;
  await getGanttCfg()
  await fetchData();
  loading.value = false;
});
onUnmounted(() => {
  gantt.destructor();
});
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
