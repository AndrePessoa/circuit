'use strict';

var createCircuit = function(){

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
        width = 600,
        height = 600,
        settings = {
            background: "#0D4D2B",
            traceColor: "#bcbec0",
            traceFill: "#385050",
            startTraces : 20,
            redraw: function () {
                reinit();
            },
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
        };

    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);

    var grid = {
        cells: [],
        _scale: 0,
        _width: 0,
        create: function(width, height, scale){
            this._width = (width/scale) - 1;
            this.scale = scale;
            this.cells = new Array( height/scale * width/scale );
        },
        toScale( value ){
            return Math.floor( value / this.scale );
        },
        getCell: function(x, y, mark){
            var cellIndex = this.toScale(x) + this.toScale(y) * this._width;
            if( mark !== undefined && this.cells[ cellIndex ] ) this.cells[ cellIndex ] = "!";
            return this.cells[ cellIndex ];
        },
        setCell: function(x, y, value){
            var cellIndex = this.toScale(x) + this.toScale(y) * this._width;
            this.cells[ cellIndex ] = value;
            return this.cells[ cellIndex ];
        },
        checkVector: function( startX, startY, endX, endY ){
            startX = startX / this.scale;
            startY = startY / this.scale;
            endX = endX / this.scale;
            endY = endY / this.scale;

            var topPoint = Math.max( startX, endX );
            var bottomPoint = Math.min( startX, endX );
            var leftPoint = Math.max( startY, endY );
            var rightPoint = Math.min( startY, endY );

            var verticalDist = topPoint - bottomPoint;
            var horizontalDist = leftPoint - rightPoint;

            for (let i = 0; i <= verticalDist; i++) {
                var y = bottomPoint + i;
                for (let j = 0; j <= verticalDist; j++) {
                    var x = leftPoint + j;
                    var cellIndex = x + y * this._width;
                    if( this.cells[ cellIndex ] !== undefined ) return true; 
                }                
            }

            return false;
        },
        console: function(){
            for (let l = 0; l < this.cells.length; ( l += this._width )) {
                var y = l / this._width;
                var line = "";
                for (let x = 0; x < this._width; x++) {
                    line += this.getCell( x*this.scale, y*this.scale ) == "#" ? "[]" : "..";                    
                }
                console.log(line);
            }
        }
    };
    grid.create(width, height, 8);
    window.grid = grid;

    function Trace(settings) {
        console.log( settings );
        settings = settings || {};
        this.id = settings.id || "trace" + Math.floor( Math.random() * 10000 );
        this.x = settings.x || Math.ceil((Math.random() * width) / 8) * 8;
        this.y = settings.y || Math.ceil((Math.random() * height) / 8) * 8;

        this.points = [];
        this.addPoint({
            x: this.x,
            y: this.y,
            arc: 0
        });

        this.trapCount = 0;
        this.live = true;

        this.lastPoint = this.points[0];

        this.angle = settings.angle != undefined ? settings.angle : (Math.ceil((Math.random() * 360) / 45) * 45) * (Math.PI / 180);
        this.speed = 8;
        this.life = 0;
        this.changeDelay = 0;
    };
    Trace.prototype.checkNextPoint = function(){
        var velX = Math.sign( Math.round( Math.sin(this.angle) * 10 ) / 10 ) * this.speed,
            velY = Math.sign( Math.round( Math.cos(this.angle) * 10 ) / 10 ) * this.speed,
            checkPointNearX = this.x + velX,
            checkPointNearY = this.y + velY,
            checkPointFarX = this.x + velX * 2,
            checkPointFarY = this.y + velY * 2;

        // check if its in bounds.
        if (checkPointFarX > 0 && checkPointFarX < width && checkPointFarY > 0 && checkPointFarY < height) {
            var deg = ( this.angle * 180 / Math.PI );
            if( deg == 225 && ( grid.getCell( this.x - velX, this.y, true ) || grid.getCell( this.x, this.y - velY, true ) ) ) return false;
            if( deg ==  45 && ( grid.getCell( this.x + velX, this.y, true ) || grid.getCell( this.x, this.y + velY, true ) ) ) return false;
            if( deg == 135 && ( grid.getCell( this.x + velX, this.y, true ) || grid.getCell( this.x, this.y - velY, true ) ) ) return false;
            if( deg == 315 && ( grid.getCell( this.x - velX, this.y, true ) || grid.getCell( this.x, this.y + velY, true ) ) ) return false;
            if( grid.getCell( checkPointNearX, checkPointNearY, true ) !== undefined ){
                return false;
            }
        } else {
            return false;
        }
        return {
            x: checkPointNearX,
            y: checkPointNearY,
            ang: this.angle
        };
    };
    Trace.prototype.update = function () {
        if( !this.live ) return;

        var x = this.lastPoint.x,
            y = this.lastPoint.y,
            dx = this.x - x,
            dy = this.y - y;

        this.life += 1;

        // if its greater than .01 keep moving

        var collision = false,
            forced = false;
        this.changeDelay++;

        //force curve
        if( this.changeDelay > 2 && Math.random() < 0.1 ){               
            this.angle += 45 * (Math.PI / 180);
        }

        var trap = -1;
        var nextPoint;
        while( ( nextPoint = this.checkNextPoint() ) == false && trap < 8 ){
            this.angle += 45 * (Math.PI / 180);
            trap++;
        };
        this.live = trap < 7;


        // no collision keep moving
        if (this.live && Math.random() > this.life / 500 ) {
            this.changeDelay++;
            this.x = nextPoint.x;
            this.y = nextPoint.y;
            this.addPoint({
                x: this.x,
                y: this.y
            });
            grid.setCell( this.x, this.y, "#" );
        }else{
            this.addPoint({
                x: this.x,
                y: this.y
            });
            this.lastPoint = this.points[this.points.length - 1];
            this.live = false;
        }

    };
    Trace.prototype.addPoint = function(point){
        grid.setCell(point.x, point.y, "#");
        this.points.push(point);
    };
    Trace.prototype.render = function () {
        if(this.stroke) {
            ctx.save();
            ctx.strokeStyle = this.stroke;
        }

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        for (var p = 1, plen = this.points.length; p < plen; p++) {
            ctx.lineTo(this.points[p].x, this.points[p].y);
        }
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.points[0].x, this.points[0].y, 4, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (!this.live) {
            ctx.beginPath();
            ctx.arc(this.points[plen - 1].x, this.points[plen - 1].y, 4, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
        if(this.stroke) ctx.restore();
    };

    // init
    var traces = [],
        traceNum = settings.startTraces,
        reqAnimFrameInstance = null;

    function reinit() {
        cancelAnimationFrame(reqAnimFrameInstance);
        traces = [];
        traceNum = settings.startTraces;
        ctx.clearRect(0, 0, width, height);

        for (var b = 0; b < traceNum; b++) {
            traces.push(new Trace({
                cX: 0,
                cY: 0
            }));
        }
        doTrace();
    };

    ctx.strokeStyle = "#bcbec0";
    ctx.fillStyle = "#385050";
    ctx.lineWidth = 2;

    var InitCircle = {
        x: 0,
        y: 0,
        radius: 40,
        step: 8,
        init: function(){
            this.x = Math.round(( width / 2 ) / 8 ) * 8;
            this.y = Math.round(( height / 2 ) / 8 ) * 8;

            var outterRadius = this.radius + 10;
            var incAng = 360 * (Math.PI / 180) / traceNum;
            for (var b = 0; b < traceNum; b++) {
                var bolinhaAng = incAng * b;
                var vectorAng = Math.round(( bolinhaAng ) / ( Math.PI / 4 ) ) * ( Math.PI / 4 );

                traces.push(new Trace({
                    x: Math.round( ( this.x + ( Math.sin( bolinhaAng ) * outterRadius ) ) / 8 ) * 8,
                    y: Math.round( ( this.y + ( Math.cos( bolinhaAng ) * outterRadius ) ) / 8 ) * 8,
                    angle: ( vectorAng )
                }));
            }
            this.addToGrid();
        },
        addToGrid: function(){
            var radius = this.radius + this.step * 2;
            var bX = this.x - radius;
            var bY = this.y - radius;
            for (var i = 0; i < radius * 2; ( i += this.step )) {
                for (var j = 0; j < radius * 2; ( j += this.step )) {
                    var vert = i - radius;
                    var horz = j - radius;
                    var dist = Math.sqrt( vert * vert + horz * horz );
                    if( dist < radius ) grid.setCell( bX + j, bY + i, "#" );                    
                }
            }
        },
        draw: function(){
        /* ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();*/
        }
    }
    InitCircle.init();

    function doGrid() {
        ctx.save();
        ctx.strokeStyle = "#ffe99b";
        ctx.fillStyle = "#ccc";
        ctx.lineWidth = 1;

        for( var x = 0; x < width; x += 8 ){
            for( var y = 0; y < height; y += 8 ){
                switch( grid.getCell( x, y ) ){
                    case "#":
                        ctx.strokeStyle = "#ffe99b";
                        ctx.fillStyle = "#ccc";
                    break;
                    case "!":                    
                        ctx.strokeStyle = "#ff0000";
                        ctx.fillStyle = "#ff0000";
                    break;
                    default:
                        ctx.strokeStyle = "#ffe99b";
                        ctx.fillStyle = "#ccc";
                }
                ctx.fillRect(x,y,2,2);

            }
        }
        ctx.restore();
    }

    function doTrace() {
        ctx.clearRect(0, 0, width, height);
        InitCircle.draw();

        for (var b = 0; b < traces.length; b++) {
            traces[b].render();
        }

        for (b = 0; b < traces.length; b++) {
            if (traces[b].live) {
                traces[b].update();
            }
        }
        //debugger;
        doGrid();

        reqAnimFrameInstance = requestAnimationFrame(doTrace);
    }

    doTrace();
};

createCircuit();
