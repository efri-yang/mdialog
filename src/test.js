function dtFormat(timestamp, format, obj = {}) {
  const SECOND = 1 * 1000;
  const MINUTE = 1 * 60 * SECOND;
  const HOURS = 1 * 60 * MINUTE;
  const DAY = 1 * 24 * HOURS;
  let dateType = 'dd|d|hh|h|mm|m|ss|s';
  let formatArr = (format || 'hh:mm:ss').match(new RegExp(dateType + '|.', 'g')) || [];
  let dateTimeObj = {};
  let dateTimeStr = '';
  let day, hour, minute, second;
  if (/dd|d/.test(format)) {
    //存在天
    day = timestamp > DAY ? parseInt(timestamp / DAY) : 0;
    hour = (timestamp - day * DAY) >= HOURS ? parseInt((timestamp - day * DAY) / HOURS) : 0;
    minute = (timestamp - day * DAY - hour * HOURS) >= MINUTE ? parseInt((timestamp - day * DAY - hour *
      HOURS) / MINUTE) : 0;
    second = Math.round((timestamp - day * DAY - hour * HOURS - minute * MINUTE) / 1000);
  } else if (/hh|h/.test(format)) {
    hour = timestamp >= HOURS ? parseInt(timestamp / HOURS) : 0;
    minute = (timestamp - hour * HOURS) >= MINUTE ? parseInt((timestamp - hour * HOURS) / MINUTE) : 0;
    second = Math.round((timestamp - hour * HOURS - minute * MINUTE) / 1000);
  } else if (/mm|m/.test(format)) {
    minute = timestamp >= MINUTE ? parseInt(timestamp / MINUTE) : 0;
    second = Math.round((timestamp - minute * MINUTE) / 1000);
  } else if (/ss|s/.test(format)) {
    second = Math.round(timestamp / 1000);
  }
  formatArr.forEach((item, index) => {
    if (new RegExp(dateType).test(item)) {
      if (/dd|d/.test(item)) { //天
        dateTimeStr += item.length == 2 ? (day < 10 ? '0' + day : day) : day;
        dateTimeObj.day = day
      } else if (/hh|h/.test(item)) { //时
        dateTimeStr += item.length == 2 ? (hour < 10 ? '0' + hour : hour) : hour;
        dateTimeObj.hour = hour
      } else if (/mm|m/.test(item)) { //分
        dateTimeStr += item.length == 2 ? (minute < 10 ? '0' + minute : minute) : minute;
        dateTimeObj.minute = minute;
      } else if (/ss|s/.test(item)) { //秒
        dateTimeStr += item.length == 2 ? (second < 10 ? '0' + second : second) : second;
        dateTimeObj.second = second;
      }
    } else {
      dateTimeStr += item
    }
  })
  return obj.isReturnObj ? dateTimeObj : dateTimeStr;

}