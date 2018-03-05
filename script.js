// Copyright (c) JeasonStudio MIT
// 在最下面配置你的新版教务系统的账号密码和学期

(function ({
  username, password, semestre, wtfTheFirstDayOfaWeek
}) {
  const getXWeekMonday = x => {
    const weeks = {
      '1': [2018, 03, 05],
      '2': [2018, 03, 12],
      '3': [2018, 03, 19],
      '4': [2018, 03, 26],
      '5': [2018, 04, 02],
      '6': [2018, 04, 09],
      '7': [2018, 04, 16],
      '8': [2018, 04, 23],
      '9': [2018, 04, 30],
      '10': [2018, 05, 07],
      '11': [2018, 05, 14],
      '12': [2018, 05, 21],
      '13': [2018, 05, 28],
      '14': [2018, 06, 04],
      '15': [2018, 06, 11],
      '16': [2018, 06, 18],
    }
    return weeks[x]
  }

  const getClassTime = x => {
    const time = {
      '1': ['08:00:00', '09:35:00'],
      '2': ['09:55:00', '11:30:00'],
      '3': ['13:30:00', '15:05:00'],
      '4': ['15:20:00', '16:55:00'],
      '5': ['17:10:00', '18:45:00'],
      '6': ['19:30:00', '21:05:00'],
    }
    return time[x]
  }
  const changeAreaToArray = str => {
    if (str.indexOf('-') >= 0) {
      const [s, e] = str.split('-').map(i => Number(i))
      const res = []
      for (let index = s; index <= e; index++) {
        res.push(index)
      }
      return res
    }
    return [Number(str)]
  }

  const filterWeeks = arr => {
    let res = []
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index]
      res = [...res, ...changeAreaToArray(element)]
    }
    return res
  }

  const filterYmd = arr => {
    let [y, m, d] = arr
    if (String(m).length === 1) m = '0' + String(m)
    if (String(d).length === 1) m = '0' + String(d)

    return [y, m, d].map(i => String(i))
  }
  const sc = fetch(`http://123.206.14.30:8080/v1/course.ustbsu?username=${username}&password=${password}&semestre=${semestre}`)
    .then(res => res.json())
    .then(({ selectedCourses }) => {
      // console.log(selectedCourses)
      // document.getElementById('hh').innerHTML = JSON.stringify(selectedCourses)
      const OneLesson = []
      selectedCourses.map(sc => {
        const className = sc.DYKCM
        const teacherName = Array.isArray(sc.JSM) && sc.JSM.length > 0 ? sc.JSM[0].JSM : '未填写'
        const des = sc.KCLBM

        const noKh = str => str.replace(/\)|\(/g, '')
        const replaceHan = str => str ? str.replace(/[\u4e00-\u9fa5]/g, '') : ''

        const info = sc.SKSJDDSTR.split(') (').filter(i => !!i).map(i => {
          const [other, location] = noKh(i).split(' ').filter(t => !!t)
          const [dayInWeek, classInDay, ...weeks] = other.split(',').map(i => replaceHan(i))
          return {
            dayInWeek, classInDay, weeks: filterWeeks(weeks), location
          }
        })

        const filterInfo = info.map(i => {
          i.weeks.forEach(w => {
            let [y, m, d] = getXWeekMonday(w)
            let [fy, fm, fd] = [y, m, d].map(i => String(i)).map(j => j.length === 1 ? `0${j}` : j)

            const thisWeekStart = moment(`${fy}${fm}${fd}`)
            // 如果是周日为一周开始, 则减一 tmd
            // d -= wtfTheFirstDayOfaWeek
            // d += Number(i.dayInWeek)
            const classAddDayToWeek = thisWeekStart.add(Number(i.dayInWeek), 'days')
            const classTimeList = getClassTime(i.classInDay)
            const classStartTime = classTimeList[0], classEndTime = classTimeList[1]
            const date = classAddDayToWeek.format('YYYYMMDD')
            const startTimeMillis = classAddDayToWeek.format('YYYY-MM-DD') + ' ' + classStartTime
            const endTimeMillis = classAddDayToWeek.format('YYYY-MM-DD') + ' ' + classEndTime

            // console.log(moment(startTimeMillis).format('YYYY-MM-DD'))

            // console.log(classStartTime, classEndTime)
            // console.log(startTimeMillis, endTimeMillis)

            // console.log(className, `${y}年${m}月${d}日`, `第${w}周`, `周${i.dayInWeek}`, `第${i.classInDay}节课`)

            OneLesson.push({
              date,
              title: className,
              location: i.location,
              description: teacherName + ' - ' + des,
              startTimeMillis: new Date(startTimeMillis).getTime(),
              endTimeMillis: new Date(endTimeMillis).getTime(),
              name: `${className} ${classAddDayToWeek.format('YYYY年MM月DD日')} 第${w}教学周 周${i.dayInWeek} 第${i.classInDay}节课`,
              date
            })
          })
        })
      })
      // console.log(OneLesson)
      // Promise.all(
      //   OneLesson.filter(({ date }) => Number(date) > 20171200)
      //   .map(t => fetch(
      //     `http://calendar.miui.com/event/insert?title=${t.title}&allDay=0&date=${t.date}&startTimeMillis=${t.startTimeMillis}&endTimeMillis=${t.endTimeMillis}&description=${t.description}&location=${t.location}`
      //   ))
      // )
      const links = OneLesson// .filter(({ startTimeMillis }) => startTimeMillis > 1512057600000)
      .map(t => {
        const hr = `http://calendar.miui.com/event/insert?title=${t.title}&allDay=0&startTimeMillis=${t.startTimeMillis}&endTimeMillis=${t.endTimeMillis}&description=${t.description}&location=${t.location}`
        return `<a href="${hr}">${t.name}</a>`
      }).join('<br />')

      document.getElementById('wtf').innerHTML = links
    })
})({
  username: '41524122',
  password: '********', // 新版的密码
  semestre: '2017-2018-2',
  // wtfTheFirstDayOfaWeek: 0, // 一周的第一天是周几(周一 or 周日), 这取决于你手机的语言与时区, 如果是周一则为 0, 周日则为 1
})
