<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { uniqBy, uniqueId } from 'lodash-es'
import { $http } from "../common/http";
import { addTabByUrl } from "../common/utils/index";
import dayjs from "dayjs";
import GanttVue from "@/components/Gantt.vue";
import loginDialog from "@/components/LoginDialog.vue";
import { useBroadcastChannel } from '../common/utils/broadcastChannel'

defineOptions({
  inheritAttrs: false,
  customOptions: {
    name: "GanttView"
  }
})
const loginRef = ref(null)
const page = reactive({ pageNo: 1, rownumber: 500, total: 0 });
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
  // col_no_pre: 'wbs_no_pre',
  // col_no_next: 'wbs_no_next',
  // day_to_hour
  // month_to_day
});
const iframeSrc = ref('https://www.baidu.com/')
const route = useRoute();
const ganttVue = ref(null);
const links = ref([]);
const loading = ref(false);
const parentNos = route.query?.pIds || route.query?.pids || route.params.pIds
const fetchData = async () => {
  if (!config.srv_mapp || !config.srv_select) {
    return
  }
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
  loading.value = true;
  const res = await $http.post(url, req);
  loading.value = false;

  if (res?.data?.resultCode === '0011') {
    openLoginDialog()
    return
  }
  if (res.data?.page?.total) {
    page.total = res.data.page.total;
  }
  originData.value = res.data.data;
  ganttData.value = initGanttData(res.data.data, config);
  if (config.col_no_next || config.col_no_pre) {
    links.value = buildLinks(res.data.data)
  }
  ganttColumns.value = initColumns(config);
};


const buildLinks = (datas) => {
  const links = [];
  if (Array.isArray(datas) && datas.length) {
    datas.forEach(item => {
      if (item[config.col_no_pre]) {
        // 当前节点的前置节点
        if (typeof item[config.col_no_pre] === 'string') {
          try {
            const arr = JSON.parse(item[config.col_no_pre])
            if (Array.isArray(arr) && arr.length) {
              arr.forEach(data => {
                links.push({
                  id: uniqueId('link_'),
                  source: data[config.col_no],
                  target: item[config.col_no],
                  type: '0' // 0：结束-开始；1：开始-开始；2：结束-结束；3：开始-结束；
                })
              })
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
      if (item[config.col_no_next]) {
        // 当前节点的后置节点
        if (typeof item[config.col_no_next] === 'string') {
          try {
            const arr = JSON.parse(item[config.col_no_next])
            if (Array.isArray(arr) && arr.length) {
              arr.forEach(data => {
                links.push({
                  id: uniqueId('link_'),
                  source: item[config.col_no],
                  target: data[config.col_no],
                  type: '0' // 0：结束-开始；1：开始-开始；2：结束-结束；3：开始-结束；
                })
              })
            }
          } catch (error) {
            console.error(error);
          }
        }
      }
    })
  }
  return links
}
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
    if (res?.data?.resultCode === '0011') {
      openLoginDialog()
      return
    }
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
        "col_fold",//是否折叠
        "col_no_pre",//前置节点字段 值可以为数组
        "col_no_next",//后置节点字段 值可以为数组
        'table_cols',//左侧表格显示字段
        "day_to_hour",//每天几小时
        "month_to_day",//每月几天
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
  // 默认一天工作时长为8小时
  const workHours = config["day_to_hour"] || 8;
  return data.map((item) => {
    const obj = {
      id: item[config.col_no],
      text: item[config.col_title],
      open: item[config.col_fold] === "否" || true,
      parent: item[config.col_parent_no],
      progress: item[config.col_progress] / 100,
      start_date: item[config.col_start_time],
      end_date: item[config.col_end_time],
      duration: item[config.col_duration],
      status: item[config.col_status],
    };

    // obj.id = item[config.col_no];
    // obj.text = item[config.col_title];
    // obj.open = item[config.col_fold] === "否" || true;
    // obj.parent = item[config.col_parent_no];
    // obj.progress = item[config.col_progress] / 100;
    // obj.start_date = item[config.col_start_time];
    // obj.end_date = item[config.col_end_time];
    // 默认单位为天
    if (['时', '小时'].includes(config.col_duration_unit)) {
      obj.duration = item[config.col_duration] / workHours;
    } else {
      obj.duration = item[config.col_duration];
    }

    if (!obj.start_date && obj.duration && obj.end_date) {
      // 没有开始时间 有结束时间跟时长 计算开始时间
      obj.start_date = dayjs(obj.end_date).subtract(obj.duration, "day").format("YYYY-MM-DD");
    } else if (obj.duration && obj.start_date && !obj.end_date) {
      // 只有开始时间和时长 计算结束时间
      obj.end_date = dayjs(obj.end_date).add(obj.duration, "day").format("YYYY-MM-DD");
    } else if (!obj.duration && obj.start_date && obj.end_date) {
      // 只有开始时间和结束时间 计算时长
      obj.duration = dayjs(obj.end_date).diff(obj.start_date, "day");
    } else if (!obj.start_date && !obj.end_date && item[config.col_duration]) {
      // 没有开始时间和结束时间 有时长 默认当前时间为开始时间 计算开始时间跟结束时间
      obj.start_date = dayjs().format("YYYY-MM-DD HH:mm:ss");
      if (['时', '小时'].includes(config.col_duration_unit)) {
        // 单位为小时 转换为天 按一天八小时
        obj.end_date = dayjs().add(item[config.col_duration] / workHours, "day").format("YYYY-MM-DD HH:mm:ss");
      } else {
        // 单位为天
        obj.end_date = dayjs().add(item[config.col_duration], "day").format("YYYY-MM-DD");
      }
    } else if (!obj.start_date && !obj.end_date && !item[config.col_duration]) {
      // 没有开始时间和结束时间 没有时长 默认当天为开始时间 时长为1天(8h) 计算结束时间
      obj.start_date = dayjs().format("YYYY-MM-DD");
      obj.duration = 1;
      obj.end_date = dayjs().add(1, "day").format("YYYY-MM-DD");
    }
    // obj.status = item[config.col_status];
    return {
      ...obj,
      _init_data: { ...obj },
      _origin_data: { ...item },
    };
  });
};

const initColumns = (config = {}) => {
  let columns = [
    {
      name: "text",
      label: "标题",
      tree: true,
    },
    {
      name: "progress",
      label: "进度",
      width: 80,
      align: "center",
      template: function (obj) {
        if (obj.progress) {
          return `<div class="progress">${parseInt(obj.progress * 100)}%</div>`;
        } else {
          return "0";
        }
      },
    },
  ];
  if (config.col_start_time) {
    columns.push({
      name: "start_date",
      label: "开始时间",
      align: "center",
      width: 100,
    });
  } else if (config.col_end_time) {
    columns.push({
      name: "end_date",
      label: "完成时间",
      align: "center",
      width: 100,
    });
  }
  columns.push(
    { name: "add", label: "-", width: 50 },
    // {
    //   name: "del", label: "删除", width: 50, template: function (obj) {
    //     return `<span style="color:red;cursor:pointer">-</span>`;
    //   },
    // },
  )
  if (config.table_cols) {
    const cols = config.table_cols.split(',')
    columns = []
    var textEditor = { type: "text", map_to: "text" };
    // var dateEditor = {
    //   type: "date", map_to: "start_date", min: new Date(1950, 0, 1),
    //   max: new Date(2100, 0, 1)
    // };
    // var durationEditor = { type: "number", map_to: "duration", min: 0 };
    const colsMap = {
      '名称': { name: "text", label: "标题", tree: true, editor: textEditor },
      '编号': { name: "id", label: "编号" },
      '预估时长': {
        name: "duration", label: "预估时长", width: 65, align: 'center', template: (obj) => {
          if (obj.duration) {
            return `<span>${obj.duration}${config.col_duration_unit}</span>`
          } else {
            return '-'
          }
        }
      },
      '进度': {
        name: "progress", label: "进度", align: 'center', width: 65, template: function (obj) {
          if (obj.progress) {
            return `<div class="progress">${parseInt(obj.progress * 100)}%</div>`;
          } else {
            return "-";
          }
        },
      },
      '开始时间': { name: "start_date", label: "开始时间", align: 'center' },
      '结束时间': { name: "end_date", label: "结束时间", align: 'center' },
      '添加按钮': { name: "add", label: "", width: 50, align: 'center' },
    }
    cols.forEach(col => {
      columns.push(colsMap[col])
    })
  }
  return columns;
};
const onTaskDblClick = (id) => {
  const data = ganttData.value.find((item) => item._origin_data[config.col_no] === id);
  if (data?._origin_data?.id) {
    let url = `/vpages/#/detail/${config.srv_select}/${data._origin_data.id}?srvApp=${config.srv_mapp}&broadCastName=${broadCastName.value}`;
    if (['localhost', '127.0.0.1', '0.0.0.0'].includes(location.hostname)) {
      url = `https://login.100xsys.cn${url}`
    }
    addTabByUrl(url, data.text);
  }
};


const dateChange = (newVal) => {
  console.log("datechange", newVal);
  // const start = dayjs(newVal.start_date).format("YYYY-MM-DD")
  // const end = dayjs(newVal.end_date).format("YYYY-MM-DD")
  // ElMessageBox.confirm(
  //   `确定将起止日期修改为${start}至${end}?`,
  //   "提示",
  //   {
  //     confirmButtonText: "确认",
  //     cancelButtonText: "取消",
  //     type: "warning",
  //   }
  // )
  //   .then(() => {
  operateData(newVal).then(res => {
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
  // })
  // .catch(() => {
  //   ElMessage({
  //     type: "info",
  //     message: "取消修改",
  //   });
  //   ganttVue.value?.reload();
  // });
};
const progressChange = (newVal) => {
  console.log("progressChange", newVal);
  // ElMessageBox.confirm(`确定将进度修改为${newVal?.progress}%?`, "提示", {
  //   confirmButtonText: "确认",
  //   cancelButtonText: "取消",
  //   type: "warning",
  // })
  //   .then(() => {
  operateData(newVal).then(res => {
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
  // })
  // .catch(() => {
  //   ElMessage({
  //     type: "info",
  //     message: "取消修改",
  //   });
  //   ganttVue.value?.reload();
  // });
};
const onTaskUpdate = (id, data,) => {
  console.log("onTaskUpdate", id, data);
  operateData({ id, text: data.text }, 'update').then(res => {
    if (res) {
      ElMessage({
        type: "success",
        message: "修改成功",
      })
    }
    fetchData()
  })
};
const onTaskDelete = (id) => {
  ElMessageBox.confirm(`确定删除任务?`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    operateData({ id }, 'delete')
  }).catch(() => {
    ElMessage.info('取消操作')
    ganttVue.value?.reload();
  })
}
const onTaskAdd = (data) => {
  console.log("onTaskAdd", data);
  ElMessageBox.confirm(`确定添加任务${data.text}?`, "提示", {
    confirmButtonText: "确认",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    operateData(data, 'add').then(res => {
      if (res) {
        ElMessage({
          type: "success",
          message: "添加成功",
        })
      }
      fetchData()
    })
  }).catch(() => {
    ElMessage.info('取消操作')
    ganttVue.value?.reload();
  })
}
/**
 * 删除关联关系
 * @param {*} data 
 */
const onLinkDelete = (data) => {
  const sourceItem = ganttData.value.find(item => item.id === data.source)?._origin_data
  const reqData = {
    id: data.source
  }
  if (sourceItem && sourceItem[config.col_no_next]) {
    try {
      let sourceData = JSON.parse(sourceItem[config.col_no_next])
      if (Array.isArray(sourceData) && sourceData.length) {
        sourceData = sourceData.filter(item => item[config.col_no] !== data.target)
        reqData[config.col_no_next] = JSON.stringify(sourceData)
      }
    } catch (error) {

    }
  }
  operateData(reqData, 'update').then(res => {
    if (res) {
      ElMessage({
        type: "success",
        message: "关联删除成功",
      })
    } else {
      ElMessage.error('关联删除失败')
    }
    fetchData()
  })
}
/**
 * 新增关联关系
 * @param {*} data 
 * @param {*} source 来源节点
 * @param {*} target 目标节点
 */
const onLinkAdd = (data, source, target) => {
  console.log('onLinkAdd', data, source, target);
  if (data.type !== '0') {
    ElMessage.error('只支持从一个节点结束连接到另一个节点的开始')
    ganttVue.value?.reload();
    return
  }
  if (config.col_no_next) {
    const sourceItem = ganttData.value.find(item => item._origin_data[config.col_no] === source.id)?._origin_data
    if (sourceItem) {
      let nextData = [{
        [config.col_title]: target.text,
        [config.col_no]: target.id
      }]
      if (sourceItem[config.col_no_next]) {
        if (typeof sourceItem[config.col_no_next] === 'string') {
          try {
            const _nextData = JSON.parse(sourceItem[config.col_no_next])
            nextData.unshift(..._nextData)
          } catch (error) {

          }
        } else if (Array.isArray(sourceItem[config.col_no_next]) && sourceItem[config.col_no_next].length) {
          nextData.unshift(...sourceItem[config.col_no_next])
        }
      }
      nextData = uniqBy(nextData, config.col_no)
      const newData = {
        id: source.id,
        [config.col_no_next]: JSON.stringify(nextData)
      }
      operateData(newData, 'update').then(res => {
        if (res) {
          ElMessage({
            type: "success",
            message: "关联成功",
          });
        } else {
          ElMessage({
            type: "error",
            message: "操作失败",
          });
        }
        fetchData()
      })
    }

  }

}


/**
 * 新增/修改/删除 数据
 * @param {*} data 
 * @param {*} type -add|update|delete 操作类型 
 * @returns {boolean}
 */
const operateData = async (data, type = 'update') => {
  const typeNameMap = {
    'update': '编辑',
    'add': '新增',
    'delete': '删除'
  }
  if (type && typeNameMap[type] && !config[`srv_${type}`]) {
    ElMessage.error(`未配置${type}服务`)
    return
  }
  const url = `/${config.srv_mapp}/${type}/${config['srv_' + type]}`;
  const reqData = {}
  if (data.progress) {
    reqData[config.col_progress] = data.progress
  }
  if (config.col_parent_no && data.parent && data.parent !== 0) {
    reqData[config.col_parent_no] = data.parent
  }
  if (config.col_no_next && data[config.col_no_next]) {
    // next节点 数组JSON字符串
    reqData[config.col_no_next] = data[config.col_no_next]
  }
  if (config.col_no_pre && data[config.col_no_pre]) {
    // pre节点 数组JSON字符串
    reqData[config.col_no_pre] = data[config.col_no_pre]
  }
  if (config.col_title && data.text) {
    reqData[config.col_title] = data.text
  }
  if (config.col_start_time && data.start_date) {
    reqData[config.col_start_time] = dayjs(data.start_date).format("YYYY-MM-DD HH:mm:ss")
  }
  if (config.col_end_time && data.end_date) {
    reqData[config.col_end_time] = dayjs(data.end_date).format("YYYY-MM-DD HH:mm:ss")
  }
  const workHours = config['day_to_hour'] || 8 //默认一天八小时工作时长
  if (config.col_duration && config.col_duration_unit && data.duration) {

    switch (config.col_duration_unit) {
      case '日':
      case '天':
        reqData[config.col_duration] = data.duration
        break;
      case '小时':
      case '时':
        // 日转为小时 一天8小时
        reqData[config.col_duration] = data.duration * workHours
        break;
    }
  }

  const req = [
    {
      serviceName: config[`srv_${type}`],
      condition: [],
      data: [reqData],
    },
  ];
  if (type === 'update' || type === 'delete') {
    if (data.id) {
      const id = ganttData.value.find(item => item[config.col_no] === data.id)
      if (id) {
        req[0].condition.push({ colName: id, ruleType: "eq", value: id })
      } else {
        req[0].condition.push({ colName: config.col_no, ruleType: "eq", value: data.id })
      }
    } else {
      ElMessage.error('数据有误！no字段没有值')
      return
    }
    if (type === 'delete') {
      req[0].data = []
    }
  }
  const res = await $http.post(url, req);
  if (res?.data?.resultCode === '0011') {
    openLoginDialog()
    return
  }
  if (res.data.state === "SUCCESS") {
    return true
  }
  return false
};

const initPage = async () => {
  loading.value = true;
  await getGanttCfg();
  await fetchData();
  loading.value = false;
}

const openLoginDialog = () => {
  loginRef.value?.open?.(() => {
    initPage()
  })
}

// const channel = ref(null)
const broadCastName = ref(uniqueId("broadCastName_"))
const { data: cData } = useBroadcastChannel({ name: broadCastName.value })
watch(cData, () => {
  console.log('从新tab接收到消息：', cData.value);
  if (cData.value && cData.value.includes('{')) {
    try {
      const data = JSON.parse(cData.value)
      if (data?.event === 'submit') {
        // ElMessageBox.confirm('检测到数据发生变化,是否刷新页面？', '提示', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning'
        // }).then(() => {
        // 刷新页面
        ElMessage.success('检测到数据发生变化,即将刷新页面')
        console.log('检测到数据发生变化,即将刷新页面', cData.value);
        fetchData()
        cData.value = ''
        // })
      }
    } catch (error) {
      console.log(error);
    }
  }
})
onMounted(() => {
  initPage()
  // channel.value = new BroadcastChannel('myChannel');
  // channel.value.onmessage = function (event) {
  //   console.log('从新tab接收到消息：', event.data);
  //   // 处理接收到的消息
  //   try {
  //     const data = JSON.parse(event.data)
  //     if (data?.event === 'submit' && data.broadCastName === broadCastName.value) {
  //       ElMessageBox.confirm('检测到数据发生变化,是否刷新页面？', '提示', {
  //         confirmButtonText: '确定',
  //         cancelButtonText: '取消',
  //         type: 'warning'
  //       }).then(() => {
  //         // 刷新页面
  //         initPage()
  //       })
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
});

</script>

<template>
  <div class="page-wrap" v-loading="loading">
    <gantt-vue :data="ganttData" :links="links" :columns="ganttColumns" @onTaskUpdate="onTaskUpdate"
      @onTaskAdd="onTaskAdd" @onTaskDelete="onTaskDelete" @onTaskDblClick="onTaskDblClick" @date-change="dateChange"
      @progress-change="progressChange" @on-link-add="onLinkAdd" @on-link-delete="onLinkDelete" ref="ganttVue">
      <template #headerRight>
        <el-button @click="initPage">刷新</el-button>
      </template>
    </gantt-vue>
  </div>
  <div v-if="iframeSrc" class="iframe-box">
    <iframe :src="iframeSrc" frameborder="0" style="width: 100%;height: 100%;"></iframe>
  </div>
  <login-dialog ref="loginRef"></login-dialog>
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

.iframe-box {
  width: 350px;
  height: 100vh;
}
</style>
