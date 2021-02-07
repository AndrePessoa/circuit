function Trace(settings, grid) {
    settings = settings || {};
    this.id = settings.id || "trace" + Math.floor( Math.random() * 10000 );
    this.x = settings.x || Math.ceil((Math.random() * settings.width) / 8) * 8;
    this.y = settings.y || Math.ceil((Math.random() * settings.height) / 8) * 8;

    this.grid = grid;
    this.trapCount = 0;
    this.live = true;
    this.state = "live";

    this.dieCount = 0;
    this.dieTime = 20;

    this.originalAngle = settings.angle != undefined ? settings.angle : (Math.random() * 360) * (Math.PI / 180);
    this.initAngle = this.degToIndexDeg(this.originalAngle);
    this.angle = this.degToIndexDeg(this.originalAngle);
    this.speed = settings.step;
    this.life = 0;
    this.lifeLimite = 100000;
    this.changeDelay = 0;

    this.points = [];
    this.addPoint({
        x: this.x,
        y: this.y,
        arc: 0,
        angle: this.angle
    });
    this.lastPoint = this.points[0];

};
Trace.getLivePerc = function(){
    return this.live / this.lifeLimite;
};
Trace.prototype.degToIndexDeg = function(deg){
   return Math.round(( deg ) / ( Math.PI / 4 ) ) * ( Math.PI / 4 );
}
Trace.prototype.toRad = function(deg){
    return deg * (Math.PI / 180)
}
Trace.prototype.toDeg = function(rad){
    return rad * (180 / Math.PI)
}
Trace.prototype.angleIndex = function(angle){
    return angle * 4 / Math.PI;
}
Trace.prototype.roundAngle = function(angle){
    var curAngle = angle || this.angle
    var deg = Math.round( curAngle * 180 / Math.PI ) % 360;
    deg = deg < 0 ? deg + 360 : deg ;
    return {
        deg: deg,
        rad: deg * (Math.PI / 180)
    }
}
Trace.prototype.checkNextPoint = function(ang){
    var angle = this.angle + ( ang || 0 ),
        velX = Math.sign( Math.round( Math.sin(angle) * 10 ) / 10 ) * this.speed,
        velY = Math.sign( Math.round( Math.cos(angle) * 10 ) / 10 ) * this.speed,
        checkPointNearX = this.x + velX,
        checkPointNearY = this.y + velY,
        checkPointFarX = this.x + velX * 2,
        checkPointFarY = this.y + velY * 2;

    // check if its in bounds.
    if (checkPointNearX > 0 && checkPointNearX < this.grid.width && checkPointNearY > 0 && checkPointNearY < this.grid.height) {
        var deg = this.roundAngle().deg;

        var cross = this.roundAngle( this.toRad( deg + 90 )).rad;
        var invertCross = this.roundAngle( this.toRad( deg + 270 ) ).rad;
        var crossIndex = this.angleIndex( cross );
        var invertCrossIndex = this.angleIndex( invertCross );

        var blockedAngs = [crossIndex, invertCrossIndex]
        if( this.grid.checkCell( checkPointNearX, checkPointNearY ) ){
            return false;
        }
        // check impact
        if( deg === 225 && ( this.grid.checkCell( this.x + velX, this.y, blockedAngs) || this.grid.checkCell( this.x, this.y + velY, blockedAngs ) ) ) return false;
        if( deg ===  45 && ( this.grid.checkCell( this.x + velX, this.y, blockedAngs) || this.grid.checkCell( this.x, this.y + velY, blockedAngs ) ) ) return false;
        if( deg === 135 && ( this.grid.checkCell( this.x + velX, this.y, blockedAngs) || this.grid.checkCell( this.x, this.y + velY, blockedAngs ) ) ) return false;
        if( deg === 315 && ( this.grid.checkCell( this.x + velX, this.y, blockedAngs) || this.grid.checkCell( this.x, this.y + velY, blockedAngs ) ) ) return false;

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
    if( this.state === "died" ) return;
    if( this.state === "dying" ){
        this.dieCount = this.dieCount < this.dieTime ? this.dieCount + 1 : this.dieTime;
        if( this.dieCount === this.dieTime ) this.state = "died";
    }

    var x = this.lastPoint.x,
        y = this.lastPoint.y,
        dx = this.x - x,
        dy = this.y - y;

    this.life += 1;

    //force curve
    var needReturnAngle = this.angle - this.initAngle;
    var needChangeAngle = Math.random() < 0.3;
    var shouldChangeAngle = this.changeDelay > 2 && (needReturnAngle !== 0 || needChangeAngle);
    if( shouldChangeAngle ){
        this.changeDelay = 0;            
        var direction =  needReturnAngle < 0 ? 1 : -1 ;
        this.angle += 45 * (Math.PI / 180) * direction; 
        //this.grid.setCell( this.x, this.y, ";" );
        this.life += 10;
    }
    var nextPoint = this.checkNextPoint();
    var initDeg = this.angle;

    if( !nextPoint ){
        this.life += 1;
        //grid.setCell( this.x, this.y, "?" );
        this.angle = initDeg + 45 * (Math.PI / 180);
        nextPoint = this.checkNextPoint()
        if( !nextPoint ){ 
            this.angle = initDeg - 45 * (Math.PI / 180);
            nextPoint = this.checkNextPoint()
        }
        if( !nextPoint ){ 
            this.angle = initDeg + 90 * (Math.PI / 180);
            nextPoint = this.checkNextPoint()
        }
        if( !nextPoint ){ 
            this.angle = initDeg - 90 * (Math.PI / 180);
            nextPoint = this.checkNextPoint()
        }
        if( !nextPoint ){ 
            this.angle = initDeg + 135 * (Math.PI / 180);
            nextPoint = this.checkNextPoint()
        }
        if( !nextPoint ){ 
            this.angle = initDeg - 135 * (Math.PI / 180);
            nextPoint = this.checkNextPoint()
        }
        if( !nextPoint ) {
            this.live = false;
        } else {
            this.life += 10;
        }
    }

    this.angle = this.roundAngle().rad;

    // no collision keep moving
    if (this.live && Math.random() > this.life / this.lifeLimite ) {
        this.changeDelay++;
        this.x = nextPoint.x;
        this.y = nextPoint.y;
        this.addPoint({
            x: this.x,
            y: this.y,
            angle: this.angle
        });
        //this.grid.setCell( this.x, this.y, "#" );
    }else if(this.state !== "died"){
        this.addPoint({
            x: this.x,
            y: this.y,
            angle: this.angle
        });
        this.lastPoint = this.points[this.points.length - 1];
        this.live = false;
        this.state = "dying";
    }

};
Trace.prototype.addPoint = function(point){
    var angIndex = point.angle * 4 / Math.PI;
    this.grid.setCell(point.x, point.y, angIndex);

    if( this.points.length < 2 ) this.points.push(point);

    var last = this.points.slice(-1)[0]
    var preLast = this.points.slice(-2)[0]
    if( last.angle === point.angle && preLast.angle === point.angle ){
        this.points[ this.points.length - 1 ] = point
    }else{
        this.points.push(point);
    }
};
Trace.prototype.render = function (ctx) {
    var strokeColor = this.stroke || "white";
    if(this.stroke) {
        ctx.save();
        ctx.strokeStyle = this.stroke;
    }

    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    ctx.arc(this.points[0].x, this.points[0].y, 2, 0, Math.PI * 2);

    if(this.state !== "died"){
        var glowRadius = 50 * ( 1 - this.dieCount / this.dieTime ) + 1;
        var grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        grd.addColorStop(0, "white");
        grd.addColorStop(1, strokeColor);
    }


    ctx.moveTo(this.points[0].x, this.points[0].y);

    for (var p = 1, plen = this.points.length; p < plen; p++) {
        ctx.lineTo(this.points[p].x, this.points[p].y);
    }
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = grd;

    if (this.state !== "live") {
        ctx.moveTo(this.points[plen - 1].x, this.points[plen - 1].y);
        ctx.arc(this.points[plen - 1].x, this.points[plen - 1].y, 2, 0, Math.PI * 2);
    }

    ctx.stroke();
    if(this.stroke) ctx.restore();
};