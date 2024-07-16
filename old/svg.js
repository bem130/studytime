const fs = require("fs");

let data = "";
var colors = [ [0,255,0],[255,0,0],[0,70,255],[255,255,180],[176,255,255],[255,240,255],[255,230,245] ,[210,250,150],[200,250,210],[230,230,238],[250,229,200],[210,190,230],[176,230,217],[200,245,255],[213,220,210],[200,250,200],[220,195,235],[198,215,242],[230,223,350]]

async function getSSize() {
    data = fs.readFileSync(`bem130.studytime.csv`).toString();
    let gsizes = {"pc":[1920,1080,0.24],"a4":[594*2,420*2,0.18],"pc_":[1080,1920,0.4],"a4_":[420*2,594*2,0.26]}
    gsize = "pc"
    let data_g1 = getdata_g1();
    let data_g2 = getdata_g2(data_g1,30);
    
    showImage_g1(data_g1,data_g2,[...gsizes[gsize],gsizes[gsize][2]]);
}
getSSize();


function lsmline(d) {
    // 参考 https://ja.wikipedia.org/wiki/%E6%9C%80%E5%B0%8F%E4%BA%8C%E4%B9%97%E6%B3%95
    let n = d.length;
    let sk_xy = 0;let sk_x = 0;let sk_y = 0;let sk_x2 = 0;
    for (let k=0;k<n;k++) { sk_xy += d[k][0]*d[k][1];sk_x += d[k][0];sk_y += d[k][1];sk_x2 += d[k][0]**2; }
    let a = (n*sk_xy-sk_x*sk_y)/(n*sk_x2-sk_x**2); let b = (sk_x2*sk_y-sk_xy*sk_x)/(n*sk_x2-sk_x**2);
    return [a,b];
}
function lsmline(d) {// 参考 https://ja.wikipedia.org/wiki/%E6%9C%80%E5%B0%8F%E4%BA%8C%E4%B9%97%E6%B3%95
    const n=d.length;let xy=0;let x=0;let y=0;let x2=0;
    for(let k=0;k<n;k++){xy+=d[k][0]*d[k][1];x+=d[k][0];y+=d[k][1];x2+=d[k][0]**2;}
    const d_=n*x2-x**2;return [(n*xy-x*y)/d_,(x2*y-xy*x)/d_];
}

function getdata_g1() {
    let subjects = [];
    let res = [];
    let st = data.replace(/\r/g,"").split("\n");
    for (let a of st) {
        let sa = a.split(",");
        for (let i=1;i<sa.length;i++) {
            let subjectname = sa[i].slice(0,2);
            if (subjects.indexOf(subjectname)==-1) {
                subjects.push(subjectname);
            }
        }
    }
    //console.log(subjects)
    for (let a of st) {
        let sa = a.split(",");
        let value = 0;
        let det = Array(subjects.length).fill(0);
        for (let i=1;i<sa.length;i++) {
            let subjectname = sa[i].slice(0,2);
            let thisnum = Number(sa[i].slice(2).split(" ")[0]);
            value += thisnum;
            det[ subjects.indexOf(subjectname) ] += thisnum;
        }
        res.push([Date.parse(sa[0].replace(/\./g,"-").valueOf()),value,det]);
    }
    //console.log("day")
    //console.table(res)
    return [res,subjects];
}
function getdata_g2(data_g1,N=14) { // 単純移動平均
    //console.log(data_g1)
    let subjects = data_g1[1];
    let ddata = data_g1[0];
    let res = Array(ddata.length).fill(null).map(()=>{return [null,0,Array(subjects.length).fill(0)]});
    //console.log(res)
    for (let i=0;i<N;i++) {
        res[i][0] = ddata[i][0];
        for (let c=0;c<N;c++) {
            if (i-c<0) {break;}
            for (let s=0;s<subjects.length;s++) {
                res[i][2][s] += ddata[i-c][2][s];
            }
            res[i][1] += ddata[i-c][1];
        }
        for (let s=0;s<subjects.length;s++) {
            res[i][2][s] /= N;
        }
        res[i][1] /= N;
    }
    for (let i=N;i<ddata.length;i++) {
        res[i][0] = ddata[i][0];
        for (let c=0;c<N;c++) {
            for (let s=0;s<subjects.length;s++) {
                res[i][2][s] += ddata[i-c][2][s];
            }
            res[i][1] += ddata[i-c][1];
        }
        for (let s=0;s<subjects.length;s++) {
            res[i][2][s] /= N;
        }
        res[i][1] /= N;
    }
   // console.table(res)
    return [res,subjects]
}

function trunc(x,n=1) {
    return Math.floor(x*n)/n
}


function showImage_g1(sdata,sdata2,prop) {
    let svgelm = `<svg width="${prop[0]}" height="${prop[1]}" xmlns="http://www.w3.org/2000/svg">`;

    let data = sdata[0];
    let subjects = sdata[1];
    let data2 = sdata2[0];
    let minvalue = 0;
    let tspan = data[data.length-1][0]-data[0][0]+3600*24*60*10;
    let scale = prop[2];
    let ddata = Array(data.length).map(()=>{return [0,0]})
    for (let i=0;i<data.length;i++) {
        ddata[i] = [(data[i][0]-data[0][0])*prop[0]/tspan,prop[1]-((data[i][1]-minvalue)*10*scale)];
    }
    //
    for (let i=1;i<data.length;i++) {
        let date = new Date(data[i-1][0])
        {
            let rect = `<rect fill="rgb(${((date.getDay()+0)%7)*10},${((date.getMonth())%2)*30},${((date.getMonth()+1)%2)*30})" x="${(data[i-1][0]-data[0][0]+3600*24*1000)*prop[0]/tspan}" y="20" width="${(data[i][0]-data[i-1][0])*prop[0]/tspan}" height="${prop[1]-20}"></rect>`;
            svgelm += rect;
        }
        {
            let rect = `<rect fill="rgb(${(date.getFullYear()%3)*100+50},${(date.getFullYear()%4)*50+50},${(date.getFullYear()%2)*200+50})" x="${(data[i-1][0]-data[0][0]+3600*24*1000)*prop[0]/tspan}" y="0" width="${(data[i][0]-data[i-1][0])*prop[0]/tspan}" height="${10}"></rect>`;
            svgelm += rect;
        }
    }
    // 最小二乗法
    let lsm = lsmline(ddata)
    {
        let patht = `M 0 ${lsm[0]+lsm[1]} L ${prop[0]} ${lsm[0]*prop[0]+lsm[1]}`;
        let path = `<path d="${patht}" fill="none" stroke="rgb(200,50,100)" stroke-width="2"></path>`;
        svgelm += path;
    }

    // 掛線の描画
    let line_span = 2;
    for (let i=0;(i*line_span)*10*scale<prop[1];i+=1) {
        let patht = `M 0 ${prop[1]-((i*line_span)*10*scale)} L ${prop[0]} ${prop[1]-((i*line_span)*10*scale)}`;
        let path = `<path d="${patht}" fill="none" stroke="rgb(70,80,80)" stroke-width="${(i*line_span%10)==0 ? ( ((i*line_span%60)==0 ? 5 : 2) ) : 1}"></path>`;
        svgelm += path;
    }
    // データ2の描画
    for (let i=0;i<data.length-1;i++) {
        let bf = [0,0];
        for (let s=0;s<subjects.length;s++) {
            let patht = `M ${(data[i+1][0]-data[0][0]+3600*24*1000)*prop[0]/tspan} ${prop[1]-((bf[1]-minvalue)*10*scale)}`;
            patht += `L ${(data[i][0]-data[0][0]+3600*24*1000)*prop[0]/tspan} ${prop[1]-((bf[0]-minvalue)*10*scale)}`;
            bf[0] += data2[i][2][s];
            bf[1] += data2[i+1][2][s];
            patht += `L ${(data[i][0]-data[0][0]+3600*24*1000)*prop[0]/tspan} ${prop[1]-((bf[0]-minvalue)*10*scale)}`
            patht += `L ${(data[i+1][0]-data[0][0]+3600*24*1000)*prop[0]/tspan} ${prop[1]-((bf[1]-minvalue)*10*scale)}`

            let path = `<path d="${patht}" fill="rgb(${colors[s][0]*0.4},${colors[s][1]*0.4},${colors[s][2]*0.4})" stroke="none" stroke-width="2"></path>`;
            svgelm += path;
        }
        {
            let patht = `M ${(data[i][0]-data[0][0]+3600*24*1000)*prop[0]/tspan} ${prop[1]-((bf[0]-minvalue)*10*scale)} L ${(data[i+1][0]-data[0][0]+3600*24*1000)*prop[0]/tspan} ${prop[1]-((bf[1]-minvalue)*10*scale)}`;
            let path = `<path d="${patht}" fill="none" stroke="rgb(255,255,255)" stroke-width="2"></path>`;
            svgelm += path;
        }
    }
    // データ1の描画
    for (let i=0;i<data.length-1;i++) {
        let bf = [0,0];
        for (let s=0;s<subjects.length;s++) {
            let patht = `M ${(data[i][0]-data[0][0])*prop[0]/tspan} ${prop[1]-((bf[0]-minvalue)*10*scale)}`;
            patht += `L ${(data[i+1][0]-data[0][0])*prop[0]/tspan} ${prop[1]-((bf[0]-minvalue)*10*scale)}`;
            bf[0] += data[i][2][s];
            patht += `L ${(data[i+1][0]-data[0][0])*prop[0]/tspan} ${prop[1]-((bf[0]-minvalue)*10*scale)}`
            patht += `L ${(data[i][0]-data[0][0])*prop[0]/tspan} ${prop[1]-((bf[0]-minvalue)*10*scale)}`
            
            let path = `<path d="${patht}" fill="rgb(${colors[s][0]},${colors[s][1]},${colors[s][2]})" stroke="none" stroke-width="2"></path>`;
            svgelm += path;
        }
        {
            let patht = `M ${(data[i][0]-data[0][0])*prop[0]/tspan} ${prop[1]-((data[i][1]-minvalue)*10*scale)} L ${(data[i+1][0]-data[0][0])*prop[0]/tspan} ${prop[1]-((data[i][1]-minvalue)*10*scale)}`;
            let path = `<path d="${patht}" fill="none" stroke="rgb(255,255,255)" stroke-width="1"></path>`;
            svgelm += path;
        }
    }

    // 目盛
    
    for (let i=10;(i*line_span)*10*scale<prop[1];i+=10) {
        let path = `<text x="5" y="${prop[1]-((i*line_span)*10*scale) +10}" font-size="20" fill="rgb(255,255,255)">${i*2}m</text>`;
        svgelm += path;
    }
    // for (let i=12;i<data.length;i+=10) {
    //     let date = new Date(data[i][0])
    //     let label = document.createElementNS("http://www.w3.org/2000/svg","text");
    //     label.setAttributeNS(null,"x",(data[i][0]-data[0][0])*prop[0]/tspan);
    //     label.setAttributeNS(null,"y",40);
    //     label.setAttributeNS(null,"fill",`rgb(255,255,255)`);
    //     label.setAttributeNS(null,"font-size",20);
    //     label.innerHTML = `${date.getMonth()+1}/${date.getDate()}`
    //     svgelm.appendChild(label);
    // }

    svgelm += `</svg>`;
    console.log(svgelm)
}