import dayjs from "dayjs";
import { ref } from "vue";

export const currentDate = ref(null);
export const setGanttConfig = (gantt, durationUnit) => {
  gantt.config.duration_unit = durationUnit;
  gantt.config.keyboard_navigation_cells = true; //激活表格相关快捷键
  gantt.config.lightbox.sections = [
    {
      name: "description",
      height: 58,
      map_to: "text",
      type: "textarea",
      focus: true,
      default_value: "新任务",
    },
    { name: "time", type: "duration", map_to: "auto" },
  ];
  gantt.config.grid_width = 350;
  gantt.config.add_column = false; //添加符号
  gantt.config.autofit = false;
  gantt.config.autoscroll = false;
  gantt.config.bar_height = 20;
  gantt.config.row_height = 30;
  // gantt.config.autosize = 'y'
  gantt.config.fit_tasks = true; //自动延长时间刻度，以适应所有显示的任务
  gantt.config.auto_types = true; //将包含子任务的任务转换为项目，将没有子任务的项目转换回任务
  gantt.config.date_format = "%Y-%m-%d %H:%i"; //甘特图时间格式
  gantt.config.task_date = "%Y-%m-%d";
  gantt.config.readonly = false; //是否只读
  gantt.config.start_on_monday = true; //是否从周一显示起始时间---右侧条形图
  gantt.config.grid_resize = true;
  gantt.config.drag_move = true; //允许拖动
  gantt.config.drag_project = true //允许拖动项目
  gantt.config.resize_rows = true;
  gantt.config.work_time = true;
  // gantt.config.skip_off_time = true; //从时间刻度上隐藏非工作时间 专业版可用
  // gantt.setWorkTime({ days:[1,1,1,1,1,0,0] });
  gantt.setWorkTime({ hours: ["9:00-12:00", "14:00-19:00"] });
  return gantt;
};

export const setGanttLayout = (gantt) => {
  gantt.config.layout = {
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
  return gantt;
};

export const setGanttTemplates = (gantt) => {
  gantt.templates.lightbox_header = function (start_date, end_date, task) {
    var dateToStr = gantt.date.date_to_str("%Y-%m-%d");
    return dateToStr(start_date) + " 至 " + dateToStr(end_date);
  };
  gantt.templates.task_date = function (date) {
    return `截止日期：${gantt.date.date_to_str(gantt.config.task_date)(date)}`;
  };
  gantt.templates.tooltip_text = function (start, end, task) {
    let startDate = dayjs(start).format("YYYY-MM-DD HH:mm:ss");
    if (startDate?.includes("00:00:00")) {
      startDate = dayjs(start).format("YYYY-MM-DD");
    }
    let endDate = dayjs(end).format("YYYY-MM-DD HH:mm:ss");
    if (endDate?.includes("00:00:00")) {
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
  return gantt;
};

export const buildZoomConfig = (gantt, minColumnWidth) => {
  const zoomConfig = {
    levels: [
      {
        name: "月周日时分",
        scale_height: 80,
        min_column_width:
          minColumnWidth < 100 ? minColumnWidth : minColumnWidth - 100,
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
              return `${Number(weekNum)}周~${dayjs(endDate).format("M.D")}`;
              // dateToStr(date) + "~" + dateToStr(endDate) + `(第${weekNum}周)`
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
        name: "月周日时",
        scale_height: 70,
        min_column_width:
          minColumnWidth < 50 ? minColumnWidth : minColumnWidth - 50,
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
              return `${Number(weekNum)}周~${dayjs(endDate).format("M.D")}`;
              // dateToStr(date) + "~" + dateToStr(endDate) + `(第${weekNum}周)`
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
                dateToStr(date) +
                " 至 " +
                dateToStr(endDate) +
                `(第${weekNum}周)`
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
        min_column_width: minColumnWidth < 50 ? minColumnWidth : 30,
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
              return `${Number(weekNum)}周~${dayjs(endDate).format("M.D")}`;
              // dateToStr(date) + "~" + dateToStr(endDate) + `(第${weekNum}周)`
            },
          },
          {
            unit: "day",
            step: 1,
            format: "%j",
            element: (el) => {
              debugger;
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
        min_column_width: minColumnWidth < 50 ? minColumnWidth : 30,
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
          },
          {
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
        min_column_width: minColumnWidth < 50 ? minColumnWidth : 30,
        scales: [
          { unit: "year", step: 1, format: "%Y年" },
          { unit: "month", format: "%M" },
        ],
      },
    ],
  };
  return zoomConfig;
};
