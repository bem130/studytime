function dct(x) {
    let N = x.length;
    let ret = Array(N*3).fill(0);

    let pin = Math.PI/N;
    for (let k = 0; 1.002**k < N*3; k++) {
        let pink = pin*(1.002**k+0.5);
        for (let n = 0; n < N; n++) {
            ret[k] += Math.cos( (n+0.5)*pink )*x[n];
        }
    }
    return ret;
}

function dct4(x) {
    let N = x.length;
    let ret = Array(N).fill(0);
    for (let k = 0; k < N; k+=1) {
        for (let n = 0; n < N; n++) {
            ret[k] += Math.cos( (Math.PI/N)*(n+0.5)*(k+0.5) )*x[n];
        }
    }
    return ret;
}

function getDatas(data,dlen,ol,start,end) {
    for (let i=Math.floor(start/ol);i<end/ol;i+=1) {
        //console.log(samplet_end,samplet,i)
        //progress(samplet_end,i)
        show(dct4(data.slice(i*ol*dlen,(i*ol+1)*dlen).map((x)=>{return x*0.5;})),Math.floor(i));
    }
    this.self.close()
}




function show(data,i) {
    postMessage({'name':"show",'data':data,'t':i});
}
function progress(max,now) {
    postMessage({'name':"progress","max":max,"now":now});
}


onmessage = function(e) {
    // console.log(e.data)
    postMessage("hello")
    switch (e.data.name) {
        case "getDatas":
            getDatas(e.data.data,e.data.dlen,e.data.ol,e.data.start,e.data.end);
        break;
    }
}