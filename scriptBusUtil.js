

// Driver_Trip_Report_01_exp.js


const http = require('http');
const mysql = require('mysql');

const axios = require('axios');

var schedule = require('node-schedule');

let intrackMap = new Map();
let nimbusMap = new Map();

let unit_object = {}
let nimbus_unit_array = []

let intrack_unit_object = {}
let intrack_unit_array = []


var fromDateVal = '';
var toDateVal =   '';

let eid = ''


var title = 'V2 GUI-CLETEKG Driver Trips Report'
// var res = '2019-11-26' + ' '
// var res = '2019-12-07' + ' '
// var theDateForNimbus = '2019-12-07'

// var res = '2019-12-19' + ' ' // 13
// var theDateForNimbus = '2019-12-19' // 13
var res = '2020-01-05' + ' '
var theDateForNimbus = '2020-01-05'
var token = 'a5570630fd5da54dcfc932bdccf9be447CF35C6D2841C334F18C526696EF1DF1084CF3DE'
//var database = 'new_reports.bus_trip_revenue'
// var database = 'new_report_dec.bus_temp'
//var database = 'new_reports.bus_trip_revenue_13dec'

//var database = 'new_reports.bus_trip_revenue'
var database = 'new_reports.bus_trip_revenue_temp'
var nimbus_token = 'Token f45936c3606040ac96461150439b78bf'

var intervalBeginning = 15
var intervalEnd = 15

const db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'workingwithmysql',
    database : 'forsalik'
});

  // Connect
  db.connect((err) => {
    if(err){
        throw err;
    }
    console.log('MySql Connected...');
});


  var vehicleData = [];
  var vehicleDataReverse = [];

  const server = http.createServer((req, res) => {});

  let runOnStart = async () => {

      console.log(res)

      var fromDate = new Date(res);
      fromDate.setHours('00');
      fromDate.setMinutes('00');
      fromDate.setSeconds('00');
      fromDateVal = fromDate.getTime()/1000;


      var toDate = new Date(res);
      toDate.setHours('23');
      toDate.setMinutes('59');
      toDate.setSeconds('59');
      toDateVal = toDate.getTime()/1000;


      getAllUnitsData()

      await getAllDataFromNimbus()

      // await savingNimbusDataResponse()

      await processIntrackData()

      console.log(' ... process completed ...')

}


  let processIntrackData = async () => {

    await getURLOneData()

    await getAllVehicles()

    await getURLTwoData()

    await getURLThreeData()

    await getURLFourData()

    await getURLFiveData()

  }




  // ======================= others =======================



    let processforURL5 = async (response) => {
      try {
        let grouping = ''
        let driver_name = ''

        if(response.data !== undefined) {
          let coreData = response.data;

          // console.log(response)

          let vehicle = '';

          // saving intrack data
          for(let ii=0; ii<coreData.length; ii++) {

              // console.log(' ++++++++ ')

            let resp01 = coreData[ii].r

            // console.log(resp01)

            // console.log(resp01.length)
            let grouping= ''
            for(let jj=0; jj<resp01.length; jj++) {
              let resp02 = resp01[jj]

              // console.log(resp02)

              let resp03 = resp02.c

              grouping = resp03[1]
              let bus_utilization = resp03[2]
              let beginning = resp03[3].t
              let initial_location = resp03[4].t

              let end = resp03[5].t
              let final_location = resp03[6].t
              let driving_hours = resp03[7]
              let engine_hours = resp03[8]

              let mileage = resp03[9]
              let initial_mileage = resp03[10]
              let final_mileage = resp03[11]
              let driver = resp03[12]


              let obj_intrack = {}

              obj_intrack.grouping = grouping
              obj_intrack.bus_utilization = bus_utilization
              obj_intrack.beginning = beginning
              obj_intrack.initial_location = initial_location
              obj_intrack.end = end
              obj_intrack.final_location = final_location
              obj_intrack.driving_hours = driving_hours
              obj_intrack.engine_hours = engine_hours
              obj_intrack.mileage = mileage
              obj_intrack.initial_mileage = initial_mileage
              obj_intrack.final_mileage = final_mileage
              obj_intrack.driver = driver

              intrack_unit_array.push(obj_intrack)

              // intrackMap.set(grouping, obj_intrack)

            }

            // console.log(intrack_unit_array.length)
            intrackMap.set(grouping, intrack_unit_array)
            intrack_unit_array = []
          }


          // console.log(intrackMap.size)
          // console.log(intrackMap)

          //         // so far so good
          //         // got datas from intrack and nimbus
          //         // now trying to match and map the data from both sets

          // console.log(nimbus_unit_array.length)


            for(let [key, ent] of intrackMap.entries()) {

              // console.log(key)
              // console.log(ent)

                for(let hh=0; hh<ent.length; hh++) {
                  let intUnit = ent[hh].unit

                // let intUnit = key


                    for(let gg=0; gg<nimbus_unit_array.length; gg++) {
                      let nimUnit = nimbus_unit_array[gg].unit



                      if(key == nimUnit) {
                        // console.log(key + '  ' + nimUnit)

                        // console.log(gg + ' nimUnit: '+nimUnit)
                        // console.log(key)
                        // console.log(ent)
                        // console.log(ent[key])

                        let groupings =  ent[hh].grouping            // ent[hh].grouping
                        let bus_utilization = ent[hh].bus_utilization   //ent[hh].bus_utilization
                        let beginning = ent[hh].beginning
                        let initial_location = ent[hh].initial_location
                        let end = ent[hh].end
                        let final_location = ent[hh].final_location
                        let driving_hours = ent[hh].driving_hours
                        let engine_hours = ent[hh].engine_hours
                        let mileage = ent[hh].mileage
                        let initial_mileage = ent[hh].initial_mileage
                        let final_mileage = ent[hh].final_mileage
                        let driver = ent[hh].driver


// console.log(key + '  -- ' + ent[hh].grouping)

                    // 17.11.2019 14:40
                    let nimBegDate = nimbus_unit_array[gg].beginning

                    // 17.11.2019 14:40
                    let nimEndDate = nimbus_unit_array[gg].end



                    nimBegDate = new Date(nimBegDate)
                    nimEndDate = new Date(nimEndDate)

                    // intBeg = new Date(intBeg)
                    // intEnd = new Date(intEnd)
                    intBeg = new Date(beginning)
                    intEnd = new Date(end)


                    // nimBegDate.setHours(nimBegDate.getHours() + 4)
                    // nimEndDate.setHours(nimEndDate.getHours() + 4)

                    intBeg.setHours(intBeg.getHours() + 4)
                    intEnd.setHours(intEnd.getHours() + 4)

                    beginning = beginning.split(' ')[0] + ' ' + intBeg.getHours() + ':' + intBeg.getMinutes() + ':' + intBeg.getSeconds()
                    end = end.split(' ')[0] + ' ' + intEnd.getHours() + ':' + intEnd.getMinutes() + ':' + intEnd.getSeconds()


                    // console.log(nimBegDate + ' -- ' +nimBegDate)


                    // nimBegDate.setMinutes(nimBegDate.getMinutes() + 45)
                    // nimEndDate.setMinutes(nimEndDate.getMinutes() - 55)

                    // nimBegDate.setMinutes(nimBegDate.getMinutes() + 10)
                    // nimEndDate.setMinutes(nimEndDate.getMinutes() - 10)
                    // nimBegDate.setMinutes(nimBegDate.getMinutes() - 10)
                    // nimEndDate.setMinutes(nimEndDate.getMinutes() + 10)
                    nimBegDate.setMinutes(nimBegDate.getMinutes() - intervalBeginning)
                    nimEndDate.setMinutes(nimEndDate.getMinutes() + intervalEnd)

                    // console.log()
                    // console.log(intBeg + '  ' + nimBegDate)
                    // console.log(nimEndDate + '  ' + intEnd);
                    // console.log()

                     // if((intBeg <= nimBegDate) && (nimEndDate <= intEnd)) {
                     if((nimBegDate <= intBeg) && (intEnd <= nimEndDate)) {

                       // console.log(intBeg + ' ** ' + intEnd)
                       // console.log(nimBegDate + ' ** ' + nimEndDate + '\n')

                       let route_id = nimbus_unit_array[gg].route_id
                       let route_name = nimbus_unit_array[gg].route_name
                       let routetype = nimbus_unit_array[gg].routetype
                       let route_time = nimbus_unit_array[gg].routetime
                       let route_group = nimbus_unit_array[gg].routegroup

                       route_name = route_name.replace(/\'/g, "\'\'");
                       initial_location = initial_location.replace(/\'/g, "\'\'");
                       final_location = final_location.replace(/\'/g, "\'\'");
                       driver = driver.replace(/\'/g, "\'\'");


                       let post = {
                         groupings: groupings,
                         beginning: beginning,
                         initial_location: initial_location,
                         end: end,
                         final_location: final_location,

                         bus_utilization: bus_utilization,
                         driving_hours: driving_hours,
                         engine_hours: engine_hours,
                         mileage: mileage,
                         initial_mileage: initial_mileage,
                         final_mileage: final_mileage,
                         driver: driver,
                          routeid: route_id,
                          routename: route_name,
                          routetype: routetype,
                          routetime: route_time,
                          routegroup: route_group
                       }

                       let sql = 'insert into '+database+' set ?';

                       // console.log(sql)

                       let query = db.query(sql, post, (err, result) => {
                           if(err) {
                               console.log('erro while inserting the record. '+err);
                           }
                       });





                    } // (intBeg <= nimBegDate) && (nimEndDate <= intEnd)

                  }


                    } // gg


                } // hh

              // } // if(key == 'W31445') {
            } // intrackMap.entries()


        }
      } catch(err) {
          console.log(' ++++++++++ err ++++++++    '+err);
      }
    }






  let getURLOneData = async () => {
    let url = 'https://hst-api.wialon.com/wialon/ajax.html?svc=token/login&params={"token":"'+token+'"}';

    let response = ''

    try{
        response = await axios.get(url);
    } catch(err) {
        console.log(err)
    }

    console.log(eid)

    eid = response.data.eid;
    return response
  }

  let getAllVehicles = async () => {
    let url6 = 'https://hst-api.wialon.com/wialon/ajax.html?params= {'+
            '"spec": {'+
                '"itemsType": "avl_unit",'+
                '"propName": "sys_name",'+
                '"propValueMask": "*",'+
                '"sortType": "sys_name"'+
            '},'+
            '"force": 1,'+
            '"flags": 1,'+
            '"from": 0,'+
            '"to": 4294967295'+
            '}&svc=core/search_items&sid='+eid;

     let resp = ''

     try {
       resp = await axios.get(url6);
     } catch(ex) {
       console.log(ex)
     }

     const data6 = resp.data.items;


     for(let j=0; j<data6.length; j++) {
         vehicleData[data6[j].nm] = data6[j].id;  // vehicleData[F21826] = 19099024
         vehicleDataReverse[data6[j].id] = data6[j].nm; // vehicleData[19099024] = F21826
     }
  }

  let getURLTwoData = async () => {
    let url = 'https://hst-api.wialon.com/wialon/ajax.html?svc=token/login&params={"token":"'+token+'"}';
    var eid = '';

    let resp = ''
    try {
      resp = await axios.get(url)
      eid = resp.data.eid;
    } catch(ex) {
      console.log(ex)
    }
  }

  let getURLThreeData = async () => {
    let urlThree_old = 'https://hst-api.wialon.com/wialon/ajax.html?svc=core/search_items&params={"spec": {' +
                    '"itemsType": "avl_resource",' +
                    '"propName": "sys_name",' +
                    '"propValueMask": "*",' +
                    '"sortType": "sys_name"' +
                '},' +
                '"force": 1,' +
            '"flags": "8193",' +
                '"from": 0,' +
                '"to": 0' +
        '}&sid='+eid;



        let urlThree = 'https://hst-api.wialon.com/wialon/ajax.html?params={"spec":{' +
        '"itemsType":"avl_resource"' + ',' + '"propName":"sys_name"' +',' +
        '"propValueMask":"*"' +','+
       '"sortType":"sys_name"' +'},'+ '"force":1' +','+ '"flags":40961'+','+
        // '"sortType":"sys_name"' +'},'+ '"force":1' +','+ '"flags":8193'+','+
        '"from":0'+','+ '"to":4294967295}&' +
        'svc=core/search_items&sid='+eid

        let response = ''

        try {
          response = await axios.get(urlThree)
        } catch(ex) {
          console.log(ex)
        }

        let ii = '42'; //
        let resourceID = '';
        let reourceName = '';
        let id = '';
        let name = '';
        let ct = '';
        let c = '';

        try {
            resourceID = response.data.items[0].id;
            reourceName = response.data.items[0].nm;
            id = response.data.items[0].rep[ii].id;
            name = response.data.items[0].rep[ii].n;
            ct = response.data.items[0].rep[ii].ct;
            c = response.data.items[0].rep[ii].c;

            // console.log(resourceID+'\n'+reourceName+'\n'+name+'\n'+ct+'\n'+c);
        } catch(err) {
            console.log('err ----------'+err);
            // throw new Error(err);
        }

        // TODO

  }

  let getURLFourData = async () => {
    let url4_old = 'https://hst-api.wialon.com/wialon/ajax.html?svc=report/exec_report&params={' +
                '"reportResourceId":'+16278637+','+
                '"reportTemplateId":'+42+','+ // 42 --  V2 GUI-CLETEKG Buses Utilization Report
                '"reportObjectId":19194735,'+
                '"reportObjectSecId":0,'+
                '"interval":{'+
                    '"from":'+fromDateVal+','+
                    '"to":'+toDateVal+','+
                    '"flags":0'+
                    '}}&sid='+eid;

                    let url4_old_2 =
                    'https://hst-api.wialon.com/wialon/ajax.html?params={' +
                      '"reportResourceId":"16278637",'+'"reportTemplateId":"42",' +
                      '"reportTemplate":null,' +'"reportObjectId":"16278637",' +
                      '"reportObjectSecId":"1",'+'"interval":{' +
                      '"flags":16777216,"from":'+fromDateVal+',"to":'+toDateVal+'},'+
                      '"remoteExec":0,"reportObjectIdList":[]}&svc=report/exec_report&sid='+eid

                      let url4 = 'https://hst-api.wialon.com/wialon/ajax.html?svc=report/exec_report&params={' +
                          	'"reportResourceId":16278637,' +
                            '"reportTemplateId":42,' +
                            '"reportObjectId":19194735,' +
                            '"reportObjectSecId":0,' +
                                '"interval":{' +
                                '"from":'+fromDateVal+',' +
                                '"to":'+toDateVal+',' +
                                '"flags":0' +
                                '}}&sid='+eid

      let response = ''

    try {
      response = await axios.get(url4, {
        headers: {
            Authorization: nimbus_token
        }
      })

      // console.log(response)
    } catch(ex) {
      console.log(ex)
    }
  }

  let getURLFiveData = async () => {
    let url5 = 'https://hst-api.wialon.com/wialon/ajax.html?svc=report/select_result_rows&params={' +
    '"tableIndex":0,' + // tableIndex: 0 -- Revenue Trips
    '"config":{' +
    '"type":"range",' +
    '"data":{"from":0,"to":1000,"level":7}' +
    '}}&sid='+eid;

    let response = ''
    try {
      response = await axios.get(url5, {
        headers: {
            Authorization: nimbus_token
        }
      })

      // console.log(response)

      processforURL5(response)

    } catch(ex) {
      console.log('in getURLFiveData() method')
      console.log(ex)
    }

  }







  let getAllUnitsData = async () => {

    let url = 'https://hst-api.wialon.com/wialon/ajax.html?svc=token/login&params={"token":"'+token+'"}';

    const responseOne = await getURLOneData(url);
    eid = responseOne.data.eid;


    let url6 = 'https://hst-api.wialon.com/wialon/ajax.html?params= {'+
        '"spec": {'+
            '"itemsType": "avl_unit",'+
            '"propName": "sys_name",'+
            '"propValueMask": "*",'+
            '"sortType": "sys_name"'+
        '},'+
        '"force": 1,'+
        '"flags": 1,'+
        '"from": 0,'+
        '"to": 4294967295'+
        '}&svc=core/search_items&sid='+eid;
       const data6 = await getAllVehicles(url6);

    }



  let getAllDataFromNimbus = async () => {

    let nimbusAPIOneURL = 'https://nimbus.wialon.com/api/depots';

    //const resp =  callNimbusDepotAPI(nimbusAPIOneURL);
    callNimbusDepotAPI(nimbusAPIOneURL);

    // let unit_equivalent = vehicleData[unitId]

    // let theDateForNimbus = '2019-11-26'

    // let sample = 'https://nimbus.wialon.com/api/depot/2097/report/avl_unit/'+unitId+'?flags=1&df='+theDateForNimbus+'&dt='+theDateForNimbus+'&sort=timetable';
    // let sample = 'https://nimbus.wialon.com/api/depot/2097/report/avl_unit_group/19194735?df='+res+'&dt='+res+'&sort=timetable'
    let sample = 'https://nimbus.wialon.com/api/depot/2097/report/avl_unit_group/19194735?df='+theDateForNimbus+'&dt='+theDateForNimbus+'&sort=timetable'

    // console.log(sample)

    setTimeout( () => {}, 2000)
    let resp01 =  '';

    try{
        resp01 = await callNimbusAPI(sample);
    } catch(err) {
        console.log('** err' + err)
    }

    // console.log('...1...')

    try {
        if(resp01 != undefined) {
            // let response = resp01;
            let resp02 = resp01.data.report_data;


            let resp03 = resp02.rows

            for(let jj=0; jj<resp03.length; jj++) {

              let resp04_col = resp03[jj].cols

              let unit = resp04_col[1].t
              let date = resp04_col[0].v

              let resp04_rows = resp03[jj].rows



              for(let kk=0; kk<resp04_rows.length; kk++) {
                let unit_trip_dat = []

                let resp05 = resp04_rows[kk];

                let obj = {}

                let route_id = resp05[2].t

                route_id = route_id.split(' ')[0]
                let route_name = resp05[2].t
                let routetype =  ''
  // console.log(route_name)
                route_name = route_name.split(' ')
  // console.log(' -- 1 --')
  //
                let temp = ''
                for(let i=1; i<route_name.length; i++) {

                  temp += route_name[i] + ' '

                }

                route_name = temp //
  // console.log(temp)


  // console.log(' -- 2 --')
                // let text = route_name[route_name-1]
                route_name = route_name.split(' ').slice(1).join(' ');

                let text = route_name.match(/\(([^)]*)\)[^(]*$/)[1];

                  text    =   text.toLowerCase();

                if ( /in|inbound|in bound/.test( text )) {
                    routetype = 'inbound';
                }
                else if ( /out|outbound|out bound/.test( text )) {
                    routetype = 'outbound';
                }



                let schedule = resp05[4].t

                let route_group = route_id.substring(0, 2) // GD, GK, GE


                // intrack data
                // obj.beginning = ''
                // obj.end = ''
                // obj.initial_location = ''
                // obj.final_location = ''
                // obj.driver_name = ''
                // obj.duration = ''
                // obj.mileage = ''

                // nim data
                obj.unit = unit
                obj.route_id = route_id
                obj.route_name = route_name
                obj.routetype = routetype
                obj.routetime = schedule
                obj.routegroup = route_group

                let beg = schedule.split('-')[0]
                let end = schedule.split('-')[1]

                beg = date + ' ' + beg
                end = date + ' ' + end

                obj.beginning = beg
                obj.end = end

                // TODO
                nimbus_unit_array.push(obj)
                // console.log(unit + ' pushed... ')
              }

            }

        }
        else {
          console.log(' esponse.data.report_data.rows === undefined ----- >>>  Undefined');
        }


        // console.log(nimbusMap.get('W31445'))

    } catch(err) {
        console.log('......>>>............  ' + err+'\n');
    }
  }


  let callNimbusDepotAPI = async (url) => {
      // console.log('*****  '+url+'  ********')
      try {
          let response = await axios.get(url, {
              headers: {
                  Authorization: nimbus_token
              }
          });

          return response;
      } catch(err) {
          console.log('callNimbusDepotAPI .... ..... ........'+err);
      }
  }


  let callNimbusAPI = async (url) => {

          let response = '';
          // setTimeout(async () => {
              try {
                  response = await axios.get(url, {
                      headers: {
                          Authorization: nimbus_token
                      }
                  });

                  return response;
              } catch(err) {
                  console.log('callNimbusAPI ... >>>'+err)
              }
          // }, 1000);

  }



  server.listen(3331, () => {
    // console.log('server running ...');
    runOnStart();

  })
