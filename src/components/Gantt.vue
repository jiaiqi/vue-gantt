<template>
  <div class="gantt-header">
    <div>
      <!-- <el-select v-model="dateType" placeholder="Select" size="" style="width: 80px" @change="changeDateType">
        <el-option v-for="item in dateOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select> -->
      <el-button @click="changeToday" style="margin-left: 12px;">今日</el-button>
      <slot name="headerLeft"></slot>
    </div>
    <div style="text-align: center;">
      <div v-if="!currentDate">
        <el-button @click="changeMinWidth('+')" style="margin-left: 12px;">放大</el-button>
        <el-button @click="changeMinWidth('-')" style="margin-left: 12px;">缩小</el-button>
      </div>
      <slot name="headerCenter" v-else>
        {{ currentDate }}
      </slot>
    </div>
    <div>

      <slot name="headerRight">
      </slot>
    </div>
  </div>
  <div ref="ganttRef" id="gantt_here" class="gantt-main" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onUnmounted } from "vue";
import { gantt as dhtmlxgantt, gantt } from "dhtmlx-gantt";
import "dhtmlx-gantt/codebase/skins/dhtmlxgantt_material.css";
import dayjs from "dayjs";
import { useCloned } from "@vueuse/core";
import { setGanttConfig, setGanttLayout, setGanttTemplates, buildZoomConfig, currentDate } from '../common/utils/gantt'
const props = defineProps({
  data: {
    type: Array,
    default: [],
  },
  links: {
    type: Array,
    default: [],
  },
  borders: {
    type: String,
  },
  cellHeight: {
    type: Number,
  },
  columns: {
    type: Array,
  },
  dateLevel: {
    type: String,
    default: "default"
  },
  scales: {
    type: Array,
    default: () => [
      // { unit: "day", step: 1, format: "%m-%d" },
      // { unit: "month", step: 1, format: "%F, %Y" },
      // {
      //   unit: "week", step: 1, format: function (date) {
      //     return "Week #" + gantt.date.getWeek(date);
      //   }
      // },
      // {
      //   unit: "day", step: 1, format: "%D", css: function (date) {
      //     if (!gantt.isWorkTime({ date: date, unit: "day" })) {
      //       return "weekend"
      //     }
      //   }
      // }
    ],
  },
  durationUnit: {
    type: String,
    default: 'day'
  }
});

const emit = defineEmits([
  "onTaskDblClick",
  "onTaskUpdate",
  "onTaskDelete",
  'onTaskAdd',
  "date-change",
  "progress-change",
  "onLinkChange",
  'onLinkAdd',
  'onLinkDelete',
  'move-change'
]);
//注册甘特图事件监听
const registerGanttEvent = (gantt, { ganttData, dateType }) => {
  gantt.attachEvent("onTaskClosed", (id, task) => {
    // ganttData.value.find((item) => item.id === id).open = false;
  });

  gantt.attachEvent("onTaskOpened", (id, task) => {
    console.log("onTaskOpened", id, task);
    // ganttData.value.find((item) => item.id === id).open = true;
  });
  gantt.attachEvent("onAfterLinkDelete", function (id, item) {
    // 删除节点之间的连接关系
    if (item.type === "0") {
      emit("onLinkDelete", item);
    }
  });
  gantt.attachEvent("onAfterLinkUpdate", function (id, item) {
    // 更新节点之间的连接关系
    console.log("onAfterLinkUpdate", id, item);
  });
  gantt.attachEvent("onAfterLinkAdd", function (id, item) {
    // 新增节点之间的连接关系
    const sourceItem = gantt?.getTask(item.source);
    const targetItem = gantt?.getTask(item.target);
    emit(
      "onLinkAdd",
      item,
      { id: sourceItem.id, text: sourceItem.text, type: "source" },
      { id: targetItem.id, text: targetItem.text, type: "target" }
    );
    //     item:{
    //     "source": "WBS2401040073",
    //     "target": "WBS2401040076",
    //     "type": "1", // 0：结束-开始；1：开始-开始；2：结束-结束；3：开始-结束；
    //     "id": 1705981833855
    // }
  });
  // 拖动过程中
  gantt.attachEvent("onTaskDrag", function (id, mode, task, originData) {
    currentDate.value = null; //清除之前的值
    if (mode === "resize") {
      const formatType = ["hour"].includes(dateType.value)
        ? "YYYY-MM-DD HH:mm:ss"
        : "YYYY-MM-DD";
      if (
        new Date(originData.end_date).getTime() !==
        new Date(task.end_date).getTime()
      ) {
        currentDate.value = dayjs(task.end_date).format(formatType);
      } else if (
        new Date(originData.start_date).getTime() !==
        new Date(task.start_date).getTime()
      ) {
        currentDate.value = dayjs(task.start_date).format(formatType);
      }
      if (currentDate.value) {
        const dateMap = ["天", "一", "二", "三", "四", "五", "六"];
        currentDate.value = `${currentDate.value}(周${dateMap[new Date(currentDate.value).getDay()]
          })`;
      }
    } else if (mode === "progress") {
      currentDate.value = `${Math.round(task.progress * 100)}%`;
    } else if (mode === "move") {
      const formatType = ["hour"].includes(dateType.value)
        ? "YYYY-MM-DD HH:mm:ss"
        : "YYYY-MM-DD";
      currentDate.value = `${dayjs(task.start_date).format(formatType)}~${dayjs(
        task.end_date
      ).format(formatType)}`;
    }
    return true;
  });
  gantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {
    currentDate.value = "";
    const task = ganttData.value.find((item) => item.id === id);
    const data = {
      id,
      start_date: dayjs(task.start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: dayjs(task.end_date).format("YYYY-MM-DD HH:mm:ss"),
      duration: task.duration,
      progress: Math.round(task.progress * 100),
    };
    console.log("onAfterTaskDrag", data, task);
    if (mode === "progress") {
      //拖动进度
      console.log("进度", Math.round(task.progress * 100));
      emit("progress-change", data);
    } else if (mode === "resize") {
      //拖动起止时间
      emit("date-change", data);
    } else if (mode === "move") {
      emit("move-change", data);
    }
  });

  gantt.attachEvent("onAfterTaskUpdate", (id, item) => {
    if (item.text !== item._init_data.text) {
      item._init_data.text = item.text;
      console.log(item.text, item._init_data.text);
      emit("onTaskUpdate", id, { ...item });
    }
  });
  // gantt.attachEvent("onLinkDblClick", function (id, e) {
  //   return false; //阻止默认双击事件
  // });
  gantt.attachEvent("onAfterTaskAdd", function (id, item) {
    console.log("onAfterTaskAdd", id, { ...item });
    const { duration, end_date, parent, progress, start_date, text } = item;
    emit("onTaskAdd", {
      duration,
      end_date,
      parent,
      progress,
      start_date,
      text,
    });
  });
  gantt.attachEvent("onAfterTaskDelete", function (id, item) {
    //删除节点
    console.log("删除节点", id, item);
    emit("onTaskDelete", id);
  });
  gantt.attachEvent("onTaskDblClick", function (id, e) {
    emit("onTaskDblClick", id);
    return false;
  });
  return gantt;
};

const dataStartDate = ref(null)
const dataEndDate = ref(null)

const minColumnWidth = ref(0)
const changeMinWidth = (type) => {
  // 改变列的最小宽度
  if (type == '+') {
    minColumnWidth.value = minColumnWidth.value + 20
  } else if (type == '++') {
    minColumnWidth.value = minColumnWidth.value + 40
  } else if (type == '--') {
    minColumnWidth.value = minColumnWidth.value - 40
  } else {
    minColumnWidth.value = minColumnWidth.value - 20
  }
  // 以周为单位扩大起止日期范围
  const dateUnit = 'week'
  if (minColumnWidth.value < 0 && type === '-') {
    dhtmlxgantt.config.start_date = dayjs(dhtmlxgantt.config.start_date).subtract(1, dateUnit).format('YYYY-MM-DD')
    dhtmlxgantt.config.end_date = dayjs(dhtmlxgantt.config.end_date).add(1, dateUnit).format('YYYY-MM-DD')
  } else if (minColumnWidth.value < 0 && type === '+') {
    dhtmlxgantt.config.start_date = dayjs(dhtmlxgantt.config.start_date).add(1, dateUnit).format('YYYY-MM-DD')
    dhtmlxgantt.config.end_date = dayjs(dhtmlxgantt.config.end_date).subtract(1, dateUnit).format('YYYY-MM-DD')
    // }
  } else if (minColumnWidth.value === 0 && dataStartDate.value && dataEndDate.value) {
    // 恢复默认的开始日期结束日期
    dhtmlxgantt.config.start_date = dayjs(dataStartDate.value).subtract(3, 'day').format('YYYY-MM-DD')
    dhtmlxgantt.config.end_date = dayjs(dataEndDate.value).add(3, 'day').format('YYYY-MM-DD')
  }
  // reload()
  dhtmlxgantt.ext.zoom.init(buildZoomConfig(dhtmlxgantt, minColumnWidth.value)); //配置初始化扩展
  changeDateType()
}

const ganttRef = ref(null);
const dateType = ref(props.dateLevel);
// const dateOptions = [
//   {
//     label: "年",
//     value: "year",
//   },
//   {
//     label: "季",
//     value: "quarter",
//   },
//   {
//     label: "月",
//     value: "month",
//   },

//   {
//     label: "周",
//     value: "week",
//   },
//   {
//     label: "日",
//     value: "day",
//   },
//   {
//     label: "时",
//     value: "hour",
//   },
// ];
const changeDateType = (type) => {
  // 计算起止日期天数差
  const dateDiff = dayjs(dhtmlxgantt.config.end_date).diff(dayjs(dhtmlxgantt.config.start_date), 'day');

  let dateScaleUnit = 'day'
  if (dateDiff > 365) {
    // 起止日期天数差大于365天，则按年显示
    dateScaleUnit = 'year'
  } else if (dateDiff > 30) {
    // 起止日期天数差大于30天，则按月显示
    dateScaleUnit = 'month'
  } else if (dateDiff > 7) {
    // 起止日期天数差大于7天，则按周显示
    dateScaleUnit = 'week'
  }
  dateType.value = type;
  if (!dateType.value) {
    dateType.value = props.dateLevel;
  }
  if (dateType.value === 'default') {
    dateType.value = dateScaleUnit
  }
  if (minColumnWidth.value > 100) {
    dateType.value = '月周日时分'
  } else if (minColumnWidth.value > 50) {
    dateType.value = '月周日时'
  }
  gantt.ext.zoom.setLevel(dateType.value);
};


// const currentDate = ref(null)

//初始化甘特图
const initGantt = () => {
  // 注册插件
  dhtmlxgantt.plugins({
    quick_info: false,
    // export_api: true,
    marker: true,
    tooltip: true, //鼠标划过任务是否显示明细
    // auto_scheduling: true,//根据任务之间的关系自动安排任务
    // multiselect: true, //为任务激活多任务选择
  });
  setGanttConfig(dhtmlxgantt, props.durationUnit)
  setGanttLayout(dhtmlxgantt)
  setGanttTemplates(dhtmlxgantt)
  dhtmlxgantt.ext.zoom.init(buildZoomConfig(dhtmlxgantt, minColumnWidth.value)); //切换到指定的缩放级别
  dhtmlxgantt.i18n.setLocale("cn"); //设置语言
  dhtmlxgantt.init('gantt_here');
  // 注册事件监听
  registerGanttEvent(dhtmlxgantt, { dateType, ganttData })
  setTimeout(() => {
    createTodayLine()
  }, 1000);
};

// 创建今日线
const todayMarker = ref('')
const createTodayLine = () => {
  var dateToStr = dhtmlxgantt.date.date_to_str("%Y年%M%d日");
  todayMarker.value = gantt.addMarker({
    id: 'markerLine',
    start_date: new Date(),
    css: "today",
    text: "现在",
    title: dateToStr(new Date())
  });
  dhtmlxgantt.updateMarker(todayMarker.value);
}
//定位到今日线
const changeToday = () => {
  createTodayLine()
  nextTick(() => {
    let ganTT = document.getElementsByClassName('gantt_marker today')
    if (!ganTT.length) {
      createTodayLine()
      nextTick(() => {
        dhtmlxgantt.scrollTo(ganTT[0].offsetLeft - 300, null);
      })
    } else {
      dhtmlxgantt.scrollTo(ganTT[0].offsetLeft - 300, null);
    }
  })
}

const deleteLink = (id) => {
  nextTick(() => {
    dhtmlxgantt.deleteLink(id);
  })
}

const ganttData = ref([]);
const links = ref([]);

const reload = () => {
  console.log('reload::::');
  ganttData.value = useCloned(props.data || []).cloned.value;
  links.value = useCloned(props.links || []).cloned.value;

  // 计算开始日期、结束日期
  let dates = ganttData.value.reduce((acc, cur) => {
    if (cur.leaf === true) {
      acc.push(cur.start_date, cur.end_date);
    }
    return acc;
  }, [])
  dates = dates.reduce((acc, cur) => {
    if (acc.startDate === '' || acc.startDate > cur) {
      acc.startDate = cur;
    }
    if (acc.endDate === '' || acc.endDate < cur) {
      acc.endDate = cur;
    }
    return acc;
  }, { startDate: '', endDate: '' })
  dataStartDate.value = dates.startDate;
  dataEndDate.value = dates.endDate;
  // 更新开始日期、结束日期
  dhtmlxgantt.config.start_date = dayjs(dates.startDate).subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss')
  dhtmlxgantt.config.end_date = dayjs(dates.endDate).add(3, 'day').format('YYYY-MM-DD HH:mm:ss')

  initGantt(dhtmlxgantt.config.start_date, dhtmlxgantt.config.end_date)


  changeDateType();
  dhtmlxgantt.config.auto_scale = true;
  dhtmlxgantt.clearAll(); // 从甘特图中删除所有任务和其他元素（包括标记）
  dhtmlxgantt.parse({
    data: ganttData.value,
    links: links.value,
  }); // 数据解析
  // 11
  // dhtmlxgantt.render(); // 呈现整个甘特图
};

const updateGanttData = (data) => {
  dhtmlxgantt.clearAll(); // 从甘特图中删除所有任务和其他元素（包括标记）
  dhtmlxgantt.parse({
    data: ganttData.value,
    links: links.value,
  })
}

watch(
  () => props.columns,
  (newVal) => {
    if (newVal?.length) {
      dhtmlxgantt.config.columns = props.columns; //设置列
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

onMounted(() => {
  reload();
});
onUnmounted(() => {
  // dhtmlxgantt.destructor();
});
defineExpose({
  reload, deleteLink
})
</script>

<style lang="scss">
.gantt-main {
  width: 100%;
  height: 100%;
  overflow: auto;

  :deep(.gantt_scale_cell.weekend) {
    color: #d43900;
  }
}

body .gantt_cal_larea {
  .gantt_time_selects {
    display: flex;
    flex-direction: row-reverse;
    gap: 5px;
  }

  .gantt_duration {

    .gantt_duration_inc,
    .gantt_duration_dec {
      cursor: pointer;
    }

    span {
      // display: none;
    }
  }
}

.gantt-header {
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
</style>
