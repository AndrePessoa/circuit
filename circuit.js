'use strict';

var createCircuit = function(settings){

    
    // requestanimation polyfill
    (function () {
        var lastTime = 0;
        var vendors = ['webkit', 'moz'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }

        if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            },
            timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }());

    // Math sing polyfill
    if (!Math.sign) {
        Math.sign = function(x) {
            return ((x > 0) - (x < 0)) || +x;
        };
    }

    // setup stuff.
    var canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        width = window.innerWidth,
        height = window.innerHeight,
        centerX = Math.round(( width / 2 ) / settings.step ) * settings.step,
        centerY = Math.round(( height / 2 ) / settings.step ) * settings.step
    

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    grid.create(width, height, settings.step);

    // init
    var traces = [],
        traceNum = settings.startTraces,
        reqAnimFrameInstance = null;

    function reinit(e) {
        cancelAnimationFrame(reqAnimFrameInstance);
        //settings.startTraces += 2;
        //InitCircle.radius += 2;
        grid.create(width, height, settings.step);
        traces = [];
        traceNum = settings.startTraces;
        ctx.clearRect(0, 0, width, height);

        traces = initter.init({
            traceNum: traceNum, 
            width: width, 
            height: height,
            centerX: Math.round(( e.clientX ) / settings.step ) * settings.step,
            centerY: Math.round(( e.clientY ) / settings.step ) * settings.step,
            step: settings.step
        });

        doTrace();
    };

    ctx.strokeStyle = "#698a8a";
    ctx.fillStyle = "#385050";
    ctx.lineWidth = 3;

    var initter = window[ "init" + settings.initForm ] || window.initCircle;
    traces = initter.init({
        traceNum: traceNum, 
        width: width, 
        height: height,
        centerX: centerX,
        centerY: centerY,
        step: settings.step
    });

    function doGrid() {
        ctx.save();
        ctx.strokeStyle = "#ffe99b";
        ctx.fillStyle = "#ccc";
        ctx.lineWidth = 1;

        for( var x = 0; x < width; x += settings.step ){
            for( var y = 0; y < height; y += settings.step ){
                var code = grid.getCell( x, y );
                if( isNaN( code ) ){
                    switch(code){
                        case "#":
                            ctx.strokeStyle = "#ffe99b";
                            ctx.fillStyle = "#ccc";
                        break;
                        case "!":                    
                            ctx.strokeStyle = "#ff0000";
                            ctx.fillStyle = "#ff0000";
                        break;
                        case "?":                    
                            ctx.strokeStyle = "#0000ff";
                            ctx.fillStyle = "#0000ff";
                        break;
                        case ";":                    
                            ctx.strokeStyle = "#ff00ff";
                            ctx.fillStyle = "#ff00ff";
                        break;
                        default:
                            ctx.strokeStyle = "#ffe99b";
                            ctx.fillStyle = "#ccc";
                    }
                    ctx.fillRect(x-.5,y-.5,1,1);
                }

            }
        }
        ctx.restore();
    }

    function doTrace() {
        ctx.clearRect(0, 0, width, height);
        initter.draw(ctx);
        doGrid();

        for (var b = 0; b < traces.length; b++) {
            traces[b].stroke = "#698a8a";
            traces[b].render(ctx);
        }

        for (b = 0; b < traces.length; b++) {
            if (traces[b].state !== "die") {
                traces[b].update();
            }
        }
        //debugger;

        reqAnimFrameInstance = requestAnimationFrame(doTrace);
    }

    canvas.addEventListener("click", function(e){ reinit(e) })

    doTrace();
};

createCircuit({
    background: "#0D4D2B",
    traceColor: "#233535",
    traceFill: "#233535",
    startTraces : 48,
    initForm: "Circle",
    step: 10,
    standard: {
        background: "#0D4D2B",
        traceColor: "#bcbec0",
        traceFill: "#385050"
    },
    green2: {
        background: "#0d4d2b",
        traceColor: "#bcbec0",
        traceFill: "#385050"
    },
    blackwhite: {
        background: "#fff",
        traceColor: "#bcbec0",
        traceFill: "#385050"
    },
    blue: {
        background: "#011880",
        traceColor: "#bcbec0",
        traceFill: "#385050"
    },
    colorScheme: 0
});
