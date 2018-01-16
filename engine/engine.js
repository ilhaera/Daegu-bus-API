const client = require('cheerio-httpcli')
const iconv = require('iconv-lite')
const dateformat = require('dateformat')

module.exports = {
  route : {
    search: (searchtext, callback) => {
      let str = ''
      const buf = iconv.encode(searchtext, 'EUC-KR')
      for (let i = 0; i < buf.length; i++) {
        str += '%' + buf[i].toString(16).toUpperCase()
      }
      const url = "http://businfo.daegu.go.kr/ba/route/route.do?act=findByNo&routeNo=" + str + "&nsbus=false"

      const call = (err, $, res, body) => {
        if (err) {
          console.log(err)
          return
        }

        const result = []
        let lastbus = ''
        $("td.body_col2").each(function(idx) {
          const onclick = $(this).attr("onclick")
          const text = $(this).text().trim()
          const id = onclick.slice(onclick.indexOf("'") + 1, onclick.lastIndexOf("'"))
          if (id.substr(0,4)=="node"){
            lastbus = text
          }
          else if (text.substr(0, 1) == '-') {
              result.push({
                name : lastbus,
                sub : text.substr(2),
                id : id
              })
          } else {
            result.push({
              name : text,
              sub : "default",
              id : id
            })
          }
        })

        callback(result)
      }

      client.fetch(url, 'EUC-KR', call)
    },
    route : (id, callback) => {
     const date = new Date()
     const url = "http://businfo.daegu.go.kr/ba/route/rtbspos.do?act=findByPos&routeId="+id+"&svcDt="+dateformat(date,'yyyymmdd')

     const call = (err, $, res, body) => {
       if (err) {
         console.log(err)
         return
       }

       const result = {
         forward : {
           route:[],
           bus:[]
         },
         backward : {
           route:[],
           bus:[]
         }
       }

       const selectorcall = function(idx) {
         let text = $(this).text().trim()
         console.log(text)
         if (text.length != 0){
           if (text.substr(-7)[0]=='('){ //station
             text = text.substr(0,text.length-7).trim()
             isforward.route.push(text)
             lasttext = text
             console.log('station : '+text)
           }
           else if (text.substr(-10)[0]=='('){ //bus
             text = text.substr(0,text.length-10).trim()
             if (text.length != 0){
               isforward.bus.push(lasttext)
               console.log('bus : '+lasttext)
               console.log('bus : '+text)
             }
           }
         }
       }

       let isforward = result.forward
       let lasttext = "start"
       $("#posForwardPanel tr>*").each(selectorcall)
       isforward = result.backward
       lasttext = "start"
       $("#posBackwardPanel tr>*").each(selectorcall)

       callback(result)
     }

     client.fetch(url, 'EUC-KR', call)
   }
  },
  station : {
    routes: (id, callback) => {
      const url = "http://businfo.daegu.go.kr/ba/route/rtbsarr.do?act=findByPath&x=&y=&bsId="+id

      const call = (err, $, res, body) => {
        if (err) {
          console.log(err)
          return
        }

        const result = []
        let lastbus = ''
        $("td.body_col2").each(function(idx) {
          const onclick = $(this).attr("onclick")
          const quo = []
          quo[0] = onclick.indexOf("'")
          for (var i = 1; i <= 9; i++) {
            quo[i] = onclick.indexOf("'",quo[i-1]+1)
          }
          const pick = (i=>onclick.substr(quo[2*i]+1,quo[2*i+1]-quo[2*i]-1))
          const stationid = pick(0)
          const routeid = pick(2)
          const forward = pick(4)
          let text = $(this).text().trim()
          if (stationid.substr(0,4)=="node"){
            lastbus = text
          }
          else if (text.substr(0, 1) == '-') {
              result.push({
                name : lastbus,
                sub : text.substr(2),
                stationid : stationid,
                routeid : routeid,
                forward : forward
              })
          } else {
            result.push({
              name : text,
              sub : "default",
              stationid : stationid,
              routeid : routeid,
              forward : forward
            })
          }
        })

        callback(result)
      }

      client.fetch(url, 'EUC-KR', call)
    },
    station: (id, callback) => {
      let routelength
      const result = []
      const buscallback=(data)=>{
        result.push(data)
        if (result.length==routelength){
          callback(result)
        }
      }
      const routecall=(data)=>{
        routelength = data.length
        for (let i = 0; i < data.length; i++) {
          module.exports.station.bus(data[i],buscallback)
        }
      }
      module.exports.station.routes(id,routecall)
    },
    bus: (data, callback) => {
      const stationid = data.stationid
      const routeid = data.routeid
      const forward = data.forward
      const url = "http://businfo.daegu.go.kr/ba/route/rtbsarr.do?act=findByArr&bsNm=&routeNo=&winc_id=02283&bsId="+stationid+"&routeId="+routeid+"&moveDir="+forward
      const call = (err, $, res, body) => {
        if (err) {
          console.log(err)
          return
        }

        const buslist=[]
        const result = {
          name: data.name,
          sub: data.sub,
          id: data.routeid,
          forward: data.forward,
        }
        //station, interval, wait
        $("table").each(function(){
          const col3 = []
          const col4 = []
          const res = {}
          $(this).find('td.body_col3').each(function(){
            col3.push($(this).text())
          })
          $(this).find('td.body_col4').each(function(){
            col4.push($(this).text())
          })
          for (let i = 0; i < col3.length; i++) {
            res[col3[i]]=col4[i]
          }
          if (Object.keys(res).length!=0)
          {buslist.push(res)}
        })

        result.bus = buslist
        callback(result)
      }

      client.fetch(url, 'EUC-KR', call)
    },
    search: (searchtext, callback) => {
      let str = ''
      const buf = iconv.encode(searchtext, 'EUC-KR')
      for (let i = 0; i < buf.length; i++) {
        str += '%' + buf[i].toString(16).toUpperCase()
      }
      const url = "http://businfo.daegu.go.kr/ba/route/rtbsarr.do?act=findByBS2&bsNm="+str

      const call = (err, $, res, body) => {
        if (err) {
          console.log(err)
          return
        }

        const result = []
        let lastbus = ''
        $("#arrResultBsPanel td.body_col1").each(function(idx) {
          const onclick = $(this).attr("onclick")
          const firstcom = onclick.indexOf("'")
          const lastcom = onclick.indexOf("'",firstcom+1)
          const id = onclick.substr(firstcom+1,lastcom-firstcom-1)
          let text = $(this).text().trim()
          text = text.substr(0,text.length-7).trim()
          result.push({
            name : text,
            id : id
          })

        })

        callback(result)
      }

      client.fetch(url, 'EUC-KR', call)
    },
  }
}
