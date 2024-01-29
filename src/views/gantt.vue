<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
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
const ganttVue = ref(null);
const loading = ref(false);
const parentNos =
  route.query?.pIds ||
  route.query?.pids ||
  route.params.pIds ||
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
/**
 * 查找甘特图字段映射及增删改查接口配置
 */
const getGanttCfg = async () => {
  const cfgNo = route.query.cfgNo || route.params.cfgNo;
  const url = `/config/select/srvpage_cfg_com_gantt_cfg_select`;
  const req = {
    serviceName: "srvpage_cfg_com_gantt_cfg_select",
    colNames: ["*"],
    condition: [
      {
        colName: "gantt_cfg_no",
        ruleType: "eq",
        value: cfgNo,
      },
    ],
  };
  if (cfgNo) {
    const res = await $http.post(url, req);
    if (res.data.state === "SUCCESS" && res.data.data.length > 0) {
      const keys = [
        "srv_mapp",
        "srv_select",
        "srv_add",
        "srv_update",
        "srv_delete",
        "col_title",
        "col_start_time",
        "col_end_time",
        "col_duration", //预估时间
        "col_duration_unit", //默认为天
        "col_progress",
        "col_status",
        "col_no",
        "col_parent_no",
        "col_fold",
      ];
      keys.forEach((key) => {
        if (res.data.data[0][key]) {
          config[key] = res.data.data[0][key];
        }
      });
      // config = reactive({
      //   ...res.data.data[0],
      //   ...config,
      // });
    }
  }
  return config;
};
/**
 * 初始化图表数据
 * @param {*} data 请求回来的数据
 * @param {*} config 甘特图字段映射配置
 */
const initGanttData = (data = [], config = {}) => {
  return data.map((item) => {
    const obj = {
      _data: {
        ...item,
      },
    };
    obj.id = item[config.col_no];
    obj.text = item[config.col_title];
    obj.open = item[config.col_fold] === "否" || true;
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
    columns.push({
      name: "start_date",
      label: "开始时间点",
      align: "center",
      width: 200,
    });
  }
  if (config.col_end_time) {
    columns.push({
      name: "end_date",
      label: "完成时间点",
      align: "center",
      width: 200,
    });
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
const dateChange = (newVal) => {
  console.log("datechange", newVal);
  const start = dayjs(newVal.start_date).format("YYYY-MM-DD")
  const end = dayjs(newVal.end_date).format("YYYY-MM-DD")
  ElMessageBox.confirm(
    `确定将起止日期修改为${start}至${end}?`,
    "Warning",
    {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      updateData('date',newVal).then(res => {
        if (res) {
          ElMessage({
            type: "success",
            message: "修改成功",
          });
        } else {
          ElMessage({
            type: "error",
            message: "修改失败",
          });
        }
        fetchData()
      })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消修改",
      });
      ganttVue.value?.reload();
    });
};
const progressChange = (newVal) => {
  console.log("progressChange", newVal);
  ElMessageBox.confirm(`确定将进度修改为${newVal?.progress}%?`, "Warning", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      updateData('progress',newVal).then(res => {
        if (res) {
          ElMessage({
            type: "success",
            message: "修改成功",
          });
        } else {
          ElMessage({
            type: "error",
            message: "修改失败",
          });
        }
        fetchData()
      })
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消修改",
      });
      ganttVue.value?.reload();
    });
};
const onTaskUpdate = (id, mode, newVal) => {
  console.log("onTaskUpdate", id, mode, newVal);
};

const updateData = async (mode, data) => {
  if (!config.srv_update) {
    ElMessage.error('未配置编辑服务')
    return
  }
  const url = `/${config.srv_mapp}/update/${config.srv_update}`;
  const reqData = {}
  if (mode === 'progress') {
    reqData[config.col_progress] = data.progress
  } else if (mode === 'date') {
    if (config.col_start_time) {
      reqData[config.col_start_time] = dayjs(data.start_date).format("YYYY-MM-DD HH:mm:ss")
    }
    if (config.col_end_time) {
      reqData[config.col_end_time] = dayjs(data.end_date).format("YYYY-MM-DD HH:mm:ss")
    }
    if (config.col_duration && config.col_duration_unit && data.duration) {
      switch (config.col_duration_unit) {
        case '日':
          reqData[config.col_duration] = data.duration
          break;
        case '小时':
          reqData[config.col_duration] = data.duration * 8
          break;
      }
    }
  }
  const req = [
    {
      serviceName: config.srv_update,
      condition: [{ colName: config.col_no, ruleType: "eq", value: data.id }],
      data: [reqData],
    },
  ];
  const res = await $http.post(url, req);
  if (res.data.state === "SUCCESS") {
    return true
  }
  return false
};

onMounted(async () => {
  loading.value = true;
  await getGanttCfg();
  await fetchData();
  loading.value = false;
});
onUnmounted(() => {
  gantt.destructor();
});
</script>

<template>
  <div class="page-wrap" v-loading="loading">
    <gantt-vue :data="ganttData" :columns="ganttColumns" @onTaskUpdate="onTaskUpdate" @onTaskDblClick="onTaskDblClick"
      @date-change="dateChange" @progress-change="progressChange" ref="ganttVue">
      <!-- <template #headerRight>
        <el-button size="" type="primary">保存</el-button>
      </template> -->
    </gantt-vue>
  </div>
</template>

<style lang="scss">
.page-wrap {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;

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
