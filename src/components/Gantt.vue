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
      <!-- <el-button @click="changeMinWidth('++')" style="margin-left: 12px;">放大*2</el-button> -->
      <el-button @click="changeMinWidth('+')" style="margin-left: 12px;">放大</el-button>
      <el-button @click="changeMinWidth()" style="margin-left: 12px;" :disabled="minColumnWidth < 1">缩小</el-button>
      <!-- <el-button @click="changeMinWidth('--')" style="margin-left: 12px;"
        :disabled="minColumnWidth < 10">缩小*2</el-button> -->
      <slot name="headerCenter">
        {{ currentDate }}
      </slot>
    </div>
    <div>

      <slot name="headerRight">
        <!-- <el-button @click="exportTo('png')">导出png</el-button> -->
        <!-- <el-button @click="exportTo('pdf')">导出pdf</el-button> -->
        <!-- <el-button @click="exportTo('excel')">导出excel</el-button> -->
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
import { next } from "lodash-es";
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

const minColumnWidth = ref(0)
const changeMinWidth = (type) => {
  if (type == '+') {
    minColumnWidth.value = minColumnWidth.value + 20
  } else if (type == '++') {
    minColumnWidth.value = minColumnWidth.value + 40
  } else if (type == '--') {
    minColumnWidth.value = minColumnWidth.value - 40
  } else {
    minColumnWidth.value = minColumnWidth.value - 20
  }
  if (minColumnWidth.value < 0) {
    minColumnWidth.value = 0
  }
  // reload()
  dhtmlxgantt.ext.zoom.init(buildZoomConfig()); //配置初始化扩展
  changeDateType()
}
const exportTo = (type) => {
  switch (type) {
    case 'png':
      dhtmlxgantt.exportToPNG()
      break;

    case 'pdf':
      dhtmlxgantt.exportToPDF()
      break;
    case 'excel':
      dhtmlxgantt.exportToExcel()
      break;
  }
}
const ganttRef = ref(null);
const dateType = ref(props.dateLevel);
const dateOptions = [
  {
    label: "默认",
    value: "default",
  },
  // {
  //   label: "年",
  //   value: "year",
  // },
  // {
  //   label: "季",
  //   value: "quarter",
  // },
  // {
  //   label: "月",
  //   value: "month",
  // },

  // {
  //   label: "周",
  //   value: "week",
  // },
  {
    label: "日",
    value: "day",
  },
  {
    label: "时",
    value: "hour",
  },
];
const changeDateType = (type) => {
  const dateDiff = dayjs(dhtmlxgantt.config.end_date).diff(dayjs(dhtmlxgantt.config.start_date), 'day');
  let dateScaleUnit = 'day'
  if (dateDiff > 365) {
    dateScaleUnit = 'year'
  } else if (dateDiff > 120) {
    dateScaleUnit = 'month'
  } else if (dateDiff > 30) {
    dateScaleUnit = 'month'
  } else if (dateDiff > 7) {
    dateScaleUnit = 'week'
  }
  dateType.value = type;
  if (!dateType.value) {
    dateType.value = props.dateLevel;
  }
  if (dateType.value === 'default') {
    dateType.value = dateScaleUnit
  }
  if (minColumnWidth.value > 80) {
    dateType.value = '月周日时分'
  } else if (minColumnWidth.value > 40) {
    dateType.value = '月周日时'
  }

  gantt.ext.zoom.setLevel(dateType.value);
};

const buildZoomConfig = () => {
  const zoomConfig = {
    levels: [
      {
        name: '月周日时分',
        scale_height: 80,
        min_column_width: minColumnWidth.value < 80 ? minColumnWidth.value : minColumnWidth.value - 80,
        scales: [
          { unit: "month", format: "%Y年%M" },
          {
            unit: "week",
            step: 1,
            format: function (date) {
              let dateToStr = gantt.date.date_to_str("%Y-%m-%d");
              let endDate = gantt.date.add(date, 6, "day");
              // let endDate = gantt.date.add(date, -6, 'day')
              let weekNum = gantt.date.date_to_str("%W")(date); //第几周
              // return dateToStr(endDate) + ' 至 ' + dateToStr(date) + `(第${weekNum}周)`
              return (
                `${Number(weekNum)}周~${dayjs(endDate).format("M\.D")}`
                // dateToStr(date) + "~" + dateToStr(endDate) + `(第${weekNum}周)`
              );
            },
          },
          {
            unit: "day",
            step: 1,
            format: "%Y-%m-%d",
            css: function (date) {
              if (date.getDay() == 0 || date.getDay() == 6) {
                return "day-item weekend weekend-border-bottom";
              } else {
                return "day-item";
              }
            },
          },
          { unit: "hour", step: 1, format: "%G点" },
          { unit: "minute", step: 10, format: "%i" },
        ],
      },
      {
        name: '月周日时',
        scale_height: 70,
        min_column_width: minColumnWidth.value < 40 ? minColumnWidth.value : minColumnWidth.value - 40,
        scales: [
          { unit: "month", format: "%Y年%M" },
          {
            unit: "week",
            step: 1,
            format: function (date) {
              let dateToStr = gantt.date.date_to_str("%Y-%m-%d");
              let endDate = gantt.date.add(date, 6, "day");
              // let endDate = gantt.date.add(date, -6, 'day')
              let weekNum = gantt.date.date_to_str("%W")(date); //第几周
              // return dateToStr(endDate) + ' 至 ' + dateToStr(date) + `(第${weekNum}周)`
              return (
                `${Number(weekNum)}周~${dayjs(endDate).format("M\.D")}`
                // dateToStr(date) + "~" + dateToStr(endDate) + `(第${weekNum}周)`
              );
            },
          },
          {
            unit: "day",
            step: 1,
            format: "%Y-%m-%d",
            css: function (date) {
              if (date.getDay() == 0 || date.getDay() == 6) {
                return "day-item weekend weekend-border-bottom";
              } else {
                return "day-item";
              }
            },
          },
          { unit: "hour", step: 1, format: "%G" },
        ],
      },
      {
        name: "hour",
        scale_height: 60,
        min_column_width: 40,
        scales: [
          { unit: "day", step: 1, format: "%Y年%m月%d日" },
          { unit: "hour", step: 1, format: "%H点" },
          { unit: "minute", step: 10, format: "%i分" },
        ],
      },
      {
        name: "day",
        scale_height: 60,
        min_column_width: 30,
        scales: [
          { unit: "day", step: 1, format: "%Y年%m月%d日" },
          { unit: "hour", step: 1, format: "%H" },
        ],
      },
      {
        name: "week",
        scale_height: 60,
        min_column_width: 35,
        scales: [
          {
            unit: "week",
            step: 1,
            width: 150,
            format: function (date) {
              let dateToStr = gantt.date.date_to_str("%Y-%m-%d");
              let endDate = gantt.date.add(date, 6, "day");
              // let endDate = gantt.date.add(date, -6, 'day')
              let weekNum = gantt.date.date_to_str("%W")(date); //第几周
              // return dateToStr(endDate) + ' 至 ' + dateToStr(date) + `(第${weekNum}周)`
              return (
                dateToStr(date) + " 至 " + dateToStr(endDate) + `(第${weekNum}周)`
              );
            },
          },
          {
            unit: "day",
            step: 1,
            format: "%d", // + "周%D"
            css: function (date) {
              if (date.getDay() == 0 || date.getDay() == 6) {
                return "day-item weekend weekend-border-bottom";
              } else {
                return "day-item";
              }
            },
          },
        ],
      },
      {
        name: "month",
        scale_height: 60,
        min_column_width: minColumnWidth.value < 50 ? minColumnWidth.value : 30,
        scales: [
          { unit: "month", format: "%Y年%M" },
          {
            unit: "week",
            step: 1,
            width: 150,
            format: function (date) {
              let dateToStr = gantt.date.date_to_str("%Y-%m-%d");
              let endDate = gantt.date.add(date, 6, "day");
              // let endDate = gantt.date.add(date, -6, 'day')
              let weekNum = gantt.date.date_to_str("%W")(date); //第几周
              // return dateToStr(endDate) + ' 至 ' + dateToStr(date) + `(第${weekNum}周)`
              return (
                `${Number(weekNum)}周~${dayjs(endDate).format("M\.D")}`
                // dateToStr(date) + "~" + dateToStr(endDate) + `(第${weekNum}周)`
              );
            },
          },
          {
            unit: "day",
            step: 1,
            format: "%j",
            element: (el) => {
              debugger
            },
            css: function (date) {
              if (date.getDay() == 0 || date.getDay() == 6) {
                return "day-item weekend weekend-border-bottom";
              } else {
                return "day-item";
              }
            },
          },
        ],
      },
      {
        name: "quarter", //季度
        height: 60,
        min_column_width: minColumnWidth.value < 50 ? minColumnWidth.value : 30,
        scales: [
          {
            unit: "quarter",
            step: 1,
            format: function (date) {
              let yearStr = new Date(date).getFullYear() + "年";
              let dateToStr = gantt.date.date_to_str("%M");
              let endDate = gantt.date.add(
                gantt.date.add(date, 3, "month"),
                -1,
                "day"
              );
              return yearStr + dateToStr(date) + " - " + dateToStr(endDate);
            },
          },
          {
            unit: "week",
            step: 1,
            format: function (date) {
              let dateToStr = gantt.date.date_to_str("%m-%d");
              let endDate = gantt.date.add(date, 6, "day");
              let weekNum = gantt.date.date_to_str("%W")(date);
              return dateToStr(date) + " 至 " + dateToStr(endDate);
            },
          }, {
            unit: "day",
            step: 1,
            format: "%d",
            css: function (date) {
              if (date.getDay() == 0 || date.getDay() == 6) {
                return "day-item weekend weekend-border-bottom";
              } else {
                return "day-item";
              }
            },
          },

        ],
      },
      {
        name: "year",
        scale_height: 50,
        min_column_width: minColumnWidth.value < 50 ? minColumnWidth.value : 30,
        scales: [
          { unit: "year", step: 1, format: "%Y年" },
          { unit: "month", format: "%M" },
        ],
      },
    ],
  };
  return zoomConfig
}

const currentDate = ref(null)

//初始化甘特图
const initGantt = () => {
  dhtmlxgantt.plugins({
    quick_info: false,
    export_api: true,
    marker: true,
    tooltip: true, //鼠标划过任务是否显示明细
    // auto_scheduling: true,//根据任务之间的关系自动安排任务
    // multiselect: true, //为任务激活多任务选择
  });
  dhtmlxgantt.config.duration_unit = props.durationUnit;
  dhtmlxgantt.config.keyboard_navigation_cells = true; //激活表格相关快捷键
  dhtmlxgantt.config.lightbox.sections = [
    { name: "description", height: 58, map_to: "text", type: "textarea", focus: true, 'default_value': '新任务' },
    { name: "time", type: "duration", map_to: "auto" }
  ];

  // gantt.templates.quick_info_date = function (start, end, task) {
  //   var dateToStr = gantt.date.date_to_str("%Y-%m-%d %H:%i");
  //   var startDate = dateToStr(start);
  //   var endDate = dateToStr(end);
  //   return `${startDate} 至 ${endDate}`
  // };

  dhtmlxgantt.templates.lightbox_header = function (start_date, end_date, task) {
    var dateToStr = gantt.date.date_to_str("%Y-%m-%d");

    return dateToStr(start_date) + ' 至 ' + dateToStr(end_date)
  };
  dhtmlxgantt.templates.task_date = function (date) {
    return `截止日期：${gantt.date.date_to_str(gantt.config.task_date)(date)}`;
  };

  dhtmlxgantt.config.quickinfo_buttons = ["icon_delete"];
  // gantt.config.quickinfo_buttons = ["icon_delete", "icon_edit", "advanced_details_button"];
  // gantt.locale.labels["advanced_details_button"] = "hahaha";
  // gantt.$click.buttons.advanced_details_button = function (id) {
  //   gantt.message("These are advanced details");
  //   return false; //blocks the default behavior
  // };
  dhtmlxgantt.config.grid_width = 350;
  dhtmlxgantt.config.add_column = false; //添加符号

  //时间轴图表中，如果不设置，只有行边框，区分上下的任务，设置之后带有列的边框，整个时间轴变成格子状。
  dhtmlxgantt.config.autofit = false;
  dhtmlxgantt.config.autoscroll = false;
  dhtmlxgantt.config.bar_height = 20;
  dhtmlxgantt.config.row_height = 30;
  // dhtmlxgantt.config.autosize = 'y'
  dhtmlxgantt.config.fit_tasks = true //自动延长时间刻度，以适应所有显示的任务
  dhtmlxgantt.config.auto_types = true; //将包含子任务的任务转换为项目，将没有子任务的项目转换回任务
  dhtmlxgantt.config.date_format = "%Y-%m-%d %H:%i"; //甘特图时间格式
  gantt.config.task_date = '%Y-%m-%d'
  dhtmlxgantt.config.readonly = false; //是否只读
  dhtmlxgantt.i18n.setLocale("cn"); //设置语言
  dhtmlxgantt.config.start_on_monday = true; //是否从周一显示起始时间---右侧条形图
  // if (props.scales?.length) {
  //   dhtmlxgantt.config.scales = props.scales //设置时间刻度
  // }
  dhtmlxgantt.ext.zoom.init(buildZoomConfig()); //配置初始化扩展
  // dhtmlxgantt.ext.zoom.setLevel(props.dateLevel); //切换到指定的缩放级别

  dhtmlxgantt.config.grid_resize = true;
  dhtmlxgantt.config.drag_move = true;
  dhtmlxgantt.config.resize_rows = true;
  // dhtmlxgantt.config.scale_height = 24;
  dhtmlxgantt.config.layout = {
    css: "gantt_container",
    rows: [
      {
        cols: [
          {
            width: 450,
            rows: [
              {
                // the default grid view
                view: "grid",
                scrollX: "scrollHor",
                scrollY: "scrollVer",
              },
            ],
          },
          { resizer: true, width: 1 },
          {
            rows: [
              {
                view: "timeline",
                scrollX: "scrollHor",
                scrollY: "scrollVer",
              },
              {
                view: "scrollbar",
                id: "scrollHor",
              },
            ],
          },
          {
            view: "scrollbar",
            id: "scrollVer",
          },
        ],
      },
    ],
  };
  dhtmlxgantt.templates.tooltip_text = function (start, end, task) {
    let startDate = dayjs(start).format("YYYY-MM-DD HH:mm:ss");
    if (startDate?.includes('00:00:00')) {
      startDate = dayjs(start).format("YYYY-MM-DD");
    }
    let endDate = dayjs(end).format("YYYY-MM-DD HH:mm:ss");
    if (endDate?.includes('00:00:00')) {
      endDate = dayjs(end).format("YYYY-MM-DD");
    }
    return (
      "<b>标题:</b> " +
      task.text +
      "<br/><span>开始:</span> " +
      startDate +
      // dhtmlxgantt.templates.tooltip_date_format(start) +
      "<br/><span>结束:</span> " +
      endDate +
      // dhtmlxgantt.templates.tooltip_date_format(end) +
      "<br/><span>进度:</span> " +
      Math.round(task.progress * 100) +
      "%"
    );
  };
  // dhtmlxgantt.config.drag_move = true;
  //changes the working time of working days from ["8:00-17:00"] to ["9:00-19:00"]
  dhtmlxgantt.config.work_time = true;
  // dhtmlxgantt.config.skip_off_time = true; //从时间刻度上隐藏非工作时间 专业版可用
  // dhtmlxgantt.setWorkTime({ days:[1,1,1,1,1,0,0] });
  dhtmlxgantt.setWorkTime({ hours: ["9:00-12:00", "14:00-19:00"] });
  // dhtmlxgantt.setWorkTime({ hours: ["14:00-19:00"] });
  // dhtmlxgantt.config.redo = true;
  // dhtmlxgantt.config.undo = true;


  dhtmlxgantt.init(ganttRef.value);

  dhtmlxgantt.attachEvent('onTaskClosed', (id, task) => {
    console.log('onTaskClosed', id, task);
    ganttData.value.find(item => item.id === id).open = false
    // dhtmlxgantt.getTask(id).open = false
  })

  dhtmlxgantt.attachEvent('onTaskOpened', (id, task) => {
    console.log('onTaskOpened', id, task);
    ganttData.value.find(item => item.id === id).open = true

  })
  dhtmlxgantt.attachEvent("onAfterLinkDelete", function (id, item) {
    // 删除节点之间的连接关系
    if (item.type === '0') {
      emit('onLinkDelete', item)
    }
  });
  dhtmlxgantt.attachEvent("onAfterLinkUpdate", function (id, item) {
    // 更新节点之间的连接关系
    console.log("onAfterLinkUpdate", id, item);
  });
  dhtmlxgantt.attachEvent("onAfterLinkAdd", function (id, item) {
    // 新增节点之间的连接关系
    const sourceItem = dhtmlxgantt?.getTask(item.source)
    const targetItem = dhtmlxgantt?.getTask(item.target)
    emit('onLinkAdd', item, { id: sourceItem.id, text: sourceItem.text, type: 'source' }, { id: targetItem.id, text: targetItem.text, type: 'target' })
    //     item:{
    //     "source": "WBS2401040073",
    //     "target": "WBS2401040076",
    //     "type": "1", // 0：结束-开始；1：开始-开始；2：结束-结束；3：开始-结束；
    //     "id": 1705981833855
    // }
  });
  // 拖动过程中
  dhtmlxgantt.attachEvent("onTaskDrag", function (id, mode, task, originData) {
    currentDate.value = null //清除之前的值
    if (mode === 'resize') {
      const formatType = ['hour'].includes(dateType.value) ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
      if (new Date(originData.end_date).getTime() !== new Date(task.end_date).getTime()) {
        currentDate.value = dayjs(task.end_date).format(formatType);
      } else if (new Date(originData.start_date).getTime() !== new Date(task.start_date).getTime()) {
        currentDate.value = dayjs(task.start_date).format(formatType);
      }
      if (currentDate.value) {
        const dateMap = ['天', '一', '二', '三', '四', '五', '六']
        currentDate.value = `${currentDate.value}(周${dateMap[new Date(currentDate.value).getDay()]})`
      }
    } else if (mode === 'progress') {
      currentDate.value = `${Math.round(task.progress * 100)}%`;
    } else if (mode === 'move') {
      const formatType = ['hour'].includes(dateType.value) ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'
      currentDate.value = `${dayjs(task.start_date).format(formatType)}~${dayjs(task.end_date).format(formatType)}`
    }
    return true;
  });
  dhtmlxgantt.attachEvent("onAfterTaskDrag", (id, mode, e) => {
    currentDate.value = "";
    const task = ganttData.value.find((item) => item.id === id);
    // console.log("onAfterTaskDrag", id, mode, e, task);
    const data = {
      id,
      start_date: dayjs(task.start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: dayjs(task.end_date).format("YYYY-MM-DD HH:mm:ss"),
      duration: task.duration,
      progress: Math.round(task.progress * 100),
    }
    console.log('onAfterTaskDrag', data, task);
    if (mode === "progress") {
      //拖动进度
      console.log("进度", Math.round(task.progress * 100));
      emit("progress-change", data);
    } else if (mode === "resize") {
      //拖动起止时间
      emit("date-change", data);
    } else if (mode === 'move') {
      emit("move-change", data);
    }
  });

  dhtmlxgantt.attachEvent("onAfterTaskUpdate", (id, item) => {
    // console.log('onAfterTaskUpdate', id, { ...item });
    if (item.text !== item._init_data.text) {
      item._init_data.text = item.text
      console.log(item.text, item._init_data.text);
      emit('onTaskUpdate', id, { ...item })
    }
    // if (Object.keys(item._init_data).some((key) => !['start_date', 'end_date'].includes(item.key) && item.key==='text' && item[key] !== item._init_data[key])) {
    //   emit('onTaskUpdate', id, { ...item })
    // }
  });
  // dhtmlxgantt.attachEvent("onLinkDblClick", function (id, e) {
  //   return false; //阻止默认双击事件
  // });
  dhtmlxgantt.attachEvent("onAfterTaskAdd", function (id, item) {
    console.log('onAfterTaskAdd', id, { ...item });
    const { duration, end_date, parent, progress, start_date, text } = item;
    emit('onTaskAdd', {
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
    emit('onTaskDelete', id)
  });
  dhtmlxgantt.attachEvent("onTaskDblClick", function (id, e) {
    emit("onTaskDblClick", id);
    return false;
  });

  setTimeout(() => {
    createTodayLine()
  }, 500);
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
    // ganTT = dhtmlxgantt.getMarker(todayMarker.value)

  })
}

const deleteLink = (id) => {
  nextTick(() => {
    dhtmlxgantt.deleteLink(id);
  })
}

const reload = () => {
  console.log('reload::::');
  //destroying a gantt instance
  // dhtmlxgantt?.destructor();
  const oldData = useCloned(ganttData.value || []).cloned.value;
  ganttData.value = useCloned(props.data || []).cloned.value;
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
  // 更新开始日期、结束日期
  dhtmlxgantt.config.start_date = dayjs(dates.startDate).subtract(3, 'day').format('YYYY-MM-DD HH:mm:ss')
  dhtmlxgantt.config.end_date = dayjs(dates.endDate).add(3, 'day').format('YYYY-MM-DD HH:mm:ss')
  // 更新节点展开状态
  if (ganttData.value.length && oldData?.length) {
    ganttData.value.forEach(item => {
      oldData.forEach(old => {
        if (item.id === old.id && old.open) {
          item.open = old.open;
        } else {
          // item.open = false;
        }
      })
    })
  }
  initGantt(dhtmlxgantt.config.start_date, dhtmlxgantt.config.end_date)

  changeDateType();
  dhtmlxgantt.config.auto_scale = true;
  dhtmlxgantt.clearAll(); // 从甘特图中删除所有任务和其他元素（包括标记）
  dhtmlxgantt.parse({
    data: ganttData.value,
    links: links.value,
  }); // 数据解析
  dhtmlxgantt.render(); // 呈现整个甘特图
};

const ganttData = ref([]);
const links = ref([]);

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
watch(() => props.links, (newVal) => {
  links.value = newVal;
  // reload();
  // updateGanttData({ data: ganttData.value, links: newVal });
})
watch(
  () => props.data,
  (newVal, oldVal) => {
    if (newVal?.length) {
      ganttData.value = useCloned(newVal).cloned.value;
    } else {
      ganttData.value = [];
    }
    updateGanttData({ data: newVal, links: links.value });
  },
  {
    deep: true,
  }
);
onMounted(() => {
  reload();
});
onUnmounted(() => {
  dhtmlxgantt.destructor();
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
