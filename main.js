

// 샘플코드
var xhr = new XMLHttpRequest();
var url = 'http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19InfStateJson'; /*URL*/
var queryParams = '?' + encodeURIComponent('serviceKey') + '=' + 'HUnQteuijblByOxbDrbreMvrn8pamVlnm%2B80O2hb%2Fe1Yw0buKlVXfoZT9KMxXpEz7MsyrGyH%2Fy20jv7%2FAFBJPA%3D%3D'; /*Service Key*/
//queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /**/
//queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('10'); /**/
queryParams += '&' + encodeURIComponent('startCreateDt') + '=' + encodeURIComponent('20190301'); /**/
queryParams += '&' + encodeURIComponent('endCreateDt') + '=' + encodeURIComponent('20221031'); /**/
xhr.open('GET', url + queryParams);


var maintable = document.querySelector(".maintable");
var tbody = document.querySelector(".tbody");
var title = document.querySelector("h1");
maintable.appendChild(tbody);



const now = new Date();
const nowyear = now.getFullYear();
const nowmonth = now.getMonth() + 1;

const nextmonth = now.getMonth() + 2;


var dchart = document.querySelector(".chart");

//차트삭제
function removeChart() {
    while (dchart.lastElementChild) {
        dchart.removeChild(dchart.lastElementChild);
    }
}

//이전 달
function monthBefore() {
    currentMonth -= 1;
    if (!currentMonth) {
        currentMonth = 12;
        currentYear--;
    }
    title.innerHTML = currentYear + "년 " + currentMonth + "월 코로나 19 현황";
    drawTable();
}


//다음달
function monthAfter() {
    let currTime = new Date(currentYear, currentMonth);

    //미래의 달 disable
    if (currTime < now) {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;

        }
        
        drawTable();
    } else {
        alert("마지막 페이지입니다.");
        
    }
}



//표 생성
function createbox(createDt, decideCnt, deathCnt, updateDt) {
    var createtr = document.createElement("tr");
    var createtd1 = document.createElement("td");
    var createtd2 = document.createElement("td");
    var createtd3 = document.createElement("td");
    var createtd4 = document.createElement("td");
    tbody.appendChild(createtr);
    createtr.appendChild(createtd1);
    createtr.appendChild(createtd2);
    createtr.appendChild(createtd3);
    createtr.appendChild(createtd4);

    //decideCntAll += decideCnt;
    //deathCntAll += deathCnt;


    createtd1.innerHTML = createDt;
    createtd2.innerHTML = decideCnt;
    createtd3.innerHTML = deathCnt;
    createtd4.innerHTML = updateDt;


}

xhr.onreadystatechange = function () {
    if (this.readyState == 4) {
        //alert('Status: ' + this.status + 'nHeaders: ' + JSON.stringify(this.getAllResponseHeaders()) + 'nBody: ' + this.responseText);

        createcovid();


        drawTable();

    }



};

var currentYear = nowyear;
var currentMonth = nowmonth;

var YM = new Date(currentYear, currentMonth, 0).getDate();



let itemList=[];

//api 정보 받아오기
function createcovid() {


    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
    let items = xmlDoc.getElementsByTagName("item");

    //let itemList = [];
    for (let i = 0; i < items.length; i++) {


        let decideCnt = parseInt(items[i].getElementsByTagName("decideCnt")[0].innerHTML);
        let createDt = items[i].getElementsByTagName("createDt")[0].innerHTML;
        let deathCnt = parseInt(items[i].getElementsByTagName("deathCnt")[0].innerHTML);
        let seq = items[i].getElementsByTagName("seq")[0].innerHTML;
        let stateDt = items[i].getElementsByTagName("stateDt")[0].innerHTML;
        let updateDt;
        try {
            updateDt = items[i].getElementsByTagName("updateDt")[0].innerHTML;
        } catch (event) {
            updateDt = "";
        }


        let item = {
            decideCnt,
            createDt,
            deathCnt,
            seq,
            stateDt,
            updateDt
        }

        


        itemList.push(item);




    }
    //itemList.reverse();

}



//표 그리기
function drawTable() {

    var chartlist = [];

    if (tbody.lastElementChild) {
        removeAllChild();
    }

    if(dchart.lastElementChild) {
        removeChart();
    }


    for (var item of itemList) {

        var createDtsplit = item.createDt.split('-');
        if (createDtsplit[0] == currentYear && createDtsplit[1] == currentMonth) {
            createbox(item.createDt, item.decideCnt, item.deathCnt, item.updateDt);



            chart = [
                new Date(parseInt(createDtsplit[0]), parseInt(createDtsplit[1]) - 1,
                    parseInt(createDtsplit[2].substring(0, 2))),
                parseInt(item.decideCnt),
                parseInt(item.deathCnt)
            ]

            chartlist.push(chart);
        }
    }
    title.innerHTML = currentYear + "년 " + currentMonth + "월 코로나 19 현황";
    
    
    // 그래프 그리기
    if (chartlist.length) {
        google.charts.load('current', {
            'packages': ['line']
        });
        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {

            var data = new google.visualization.DataTable();
            data.addColumn('date', 'time');
            data.addColumn('number', '누적 확진자 수 ');
            data.addColumn('number', '누적 사망자 수 ');

            data.addRows(chartlist);

            var options = {
                chart: {
                    title: '코로나19 누적 확진자 및 사망자 수'
                },
                width: 900,
                height: 500
            };

            var chart = new google.charts.Line(document.getElementById("chart"));

            chart.draw(data, google.charts.Line.convertOptions(options));
        }
    }
}

//tbody 지움
function removeAllChild() {
    while (tbody.firstElementChild != tbody.lastElementChild) {
        tbody.removeChild(tbody.lastElementChild);
    }
}

xhr.send('');
