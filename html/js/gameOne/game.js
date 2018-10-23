(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());
$(window).load(function() {
	game.init();
});
// Declare all the commonly used objects as variables for convenience  将常用对象声明为变量
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

var game={
    init:function(){
        levels.init();
        loader.init();
        mouse.init();

        $('.gamelayer').hide();
        $('#gamestartscreen').show();
        
        //Get handler for game canvas and context
        game.canvas = $('#gamecanvas')[0];
        game.context = game.canvas.getContext('2d');

    },
    showLevelScreen:function(){
		$('.gamelayer').hide();
        $('#levelselectscreen').show('slow');
    },
    // Game Mode
	mode:"intro", 
    // X & Y Coordinates of the slingshot
	slingshotX:140,
    slingshotY:280,
    start:function(){
        $('.gamelayer').hide();
        // Display the game canvas and score 
        $('#gamecanvas').show();
        $('#scorescreen').show();

        game.mode = "intro";    
        game.offsetLeft = 0;
		game.ended = false;
		game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
    },
    // 画面最大平移速度，单位为像素每帧
    maxSpeed:3,
	// 画面最大最小平移范围
    minOffset:0,
    maxOffset:300,
	// 当前画面平移位置
	offsetLeft:0,
	// The game score
    score:0,

    //画面中心移动到newCenter
    panTo:function(newCenter){
        if (Math.abs(newCenter-game.offsetLeft-game.canvas.width/4)>0 
            && game.offsetLeft <= game.maxOffset && game.offsetLeft >= game.minOffset){
        
            var deltaX = Math.round((newCenter-game.offsetLeft-game.canvas.width/4)/2);
            if (deltaX && Math.abs(deltaX)>game.maxSpeed){
                deltaX = game.maxSpeed*Math.abs(deltaX)/(deltaX);
            }
            game.offsetLeft += deltaX; 
        } else {
            
            return true;
        }
        if (game.offsetLeft <game.minOffset){
            game.offsetLeft = game.minOffset;
            return true;
        } else if (game.offsetLeft > game.maxOffset){
            game.offsetLeft = game.maxOffset;
            return true;
        }        
        return false;
    },
    handlePanning:function(){
        if(game.mode=="intro"){        
            if(game.panTo(700)){
                game.mode = "load-next-hero";
            }             
        }       

        if(game.mode=="wait-for-firing"){  
            if (mouse.dragging){
				game.panTo(mouse.x + game.offsetLeft)
            } else {
                game.panTo(game.slingshotX);
            }
        }
		
		if (game.mode=="load-next-hero"){
			// 待完成: 
			// 检查是否有坏蛋还活着，如果没有关卡结束（通过
			// 检查是否有可装填英雄，如果没有关卡结束（失败
			// 装填英雄设置状态wait-for-firing
			game.mode="wait-for-firing";			
		}
		
		if(game.mode == "firing"){  
            game.panTo(game.slingshotX);
        }
        
		if (game.mode == "fired"){
			// 待完成: 
			// 视野移到英雄当前位置
		}
    },
    animate:function(){
        // 移动背景
       game.handlePanning();
       
       // 使角色移动
     	
        
        //  使用视差滚动绘制背景
        game.context.drawImage(game.currentLevel.backgroundImage,game.offsetLeft/4,0,640,480,0,0,640,480);
        game.context.drawImage(game.currentLevel.foregroundImage,game.offsetLeft,0,640,480,0,0,640,480);
        

        //绘制弹弓
        game.context.drawImage(game.slingshotImage,game.slingshotX-game.offsetLeft,game.slingshotY);

        // Draw all the bodies  绘制所有的物体
        game.drawAllBodies();
        //再次绘制弹弓的外侧支架
		game.context.drawImage(game.slingshotFrontImage,game.slingshotX-game.offsetLeft,game.slingshotY);

      	if (!game.ended){
			game.animationFrame = window.requestAnimationFrame(game.animate,game.canvas);
		}	
    },
    drawAllBodies:function(){  
		box2d.world.DrawDebugData();	

		//Iterate through all the bodies and draw them on the game canvas	 遍历所有物体在canvas中绘制		  
		for (var body = box2d.world.GetBodyList(); body; body = body.GetNext()) {
			var entity = body.GetUserData();
  
			if(entity){
				entities.draw(entity,body.GetPosition(),body.GetAngle())
			}
		}
	},

}

var levels ={
    data:[
	    {   // First level 
	        foreground:'desert-foreground',
	        background:'clouds-background',
			entities:[
                {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
                {type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},

                {type:"block", name:"wood", x:520,y:380,angle:90,width:100,height:25},
                {type:"block", name:"glass", x:520,y:280,angle:90,width:100,height:25},								
                {type:"villain", name:"burger",x:520,y:205,calories:590},

                {type:"block", name:"wood", x:620,y:380,angle:90,width:100,height:25},
                {type:"block", name:"glass", x:620,y:280,angle:90,width:100,height:25},								
                {type:"villain", name:"fries", x:620,y:205,calories:420},				

                {type:"hero", name:"orange",x:80,y:405},
                {type:"hero", name:"apple",x:140,y:405},
            ]
	    },
        {   // Second level 
            foreground:'desert-foreground',
            background:'clouds-background',
			entities:[
                {type:"ground", name:"dirt", x:500,y:440,width:1000,height:20,isStatic:true},
				{type:"ground", name:"wood", x:185,y:390,width:30,height:80,isStatic:true},
	
				{type:"block", name:"wood", x:820,y:380,angle:90,width:100,height:25},
				{type:"block", name:"wood", x:720,y:380,angle:90,width:100,height:25},
				{type:"block", name:"wood", x:620,y:380,angle:90,width:100,height:25},
				{type:"block", name:"glass", x:670,y:317.5,width:100,height:25},
				{type:"block", name:"glass", x:770,y:317.5,width:100,height:25},				

				{type:"block", name:"glass", x:670,y:255,angle:90,width:100,height:25},
				{type:"block", name:"glass", x:770,y:255,angle:90,width:100,height:25},
				{type:"block", name:"wood", x:720,y:192.5,width:100,height:25},	

				{type:"villain", name:"burger",x:715,y:155,calories:590},
				{type:"villain", name:"fries",x:670,y:405,calories:420},
				{type:"villain", name:"sodacan",x:765,y:400,calories:150},

				{type:"hero", name:"strawberry",x:30,y:415},
				{type:"hero", name:"orange",x:80,y:405},
				{type:"hero", name:"apple",x:140,y:405},
            ]
        }
    ],
    init:function(){
        var html = "";
        for (var i=0; i < levels.data.length; i++) {
            var level = levels.data[i];
            html += '<input type="button" value="'+(i+1)+'">';
        };
        $('#levelselectscreen').html(html);
        
        // Set the button click event handlers to load level
        $('#levelselectscreen input').click(function(){
            levels.load(this.value-1);
            $('#levelselectscreen').hide();
        });
    },
    load:function(number){
        //加载关卡时，初始化box2d世界
        box2d.init();

        // declare a new current level object 声明新的当前关卡对象
        game.currentLevel = {number:number,hero:[]};
		game.score=0;
        $('#score').html('Score: '+game.score);
        game.currentHero = undefined;
        var level = levels.data[number];

        //load the background, foreground and slingshot images 加载图
        game.currentLevel.backgroundImage = loader.loadImage("images/gameOne/backgrounds/"+level.background+".png");
        game.currentLevel.foregroundImage = loader.loadImage("images/gameOne/backgrounds/"+level.foreground+".png");
        game.slingshotImage = loader.loadImage("images/gameOne/slingshot.png");
        game.slingshotFrontImage = loader.loadImage("images/gameOne/slingshot-front.png");

        // Load all the entities 加载所有物体
		for (var i = level.entities.length - 1; i >= 0; i--){	
			var entity = level.entities[i];
			entities.create(entity);			
		};

        //Call game.start() once the assets have loaded
        if(loader.loaded){
            game.start()
        } else {
            loader.onload = game.start;
        }
    }

}
var loader = {
    loaded:true,
    loadedCount:0, // Assets that have been loaded so far
    totalCount:0, // Total number of assets that need to be loaded
    
    init:function(){
        // check for sound support
        var mp3Support,oggSupport;
        var audio = document.createElement('audio');
    	if (audio.canPlayType) {
       		// Currently canPlayType() returns: "", "maybe" or "probably" 
      		mp3Support = "" != audio.canPlayType('audio/mpeg');
      		oggSupport = "" != audio.canPlayType('audio/ogg; codecs="vorbis"');
    	} else {
    		//The audio tag is not supported
    		mp3Support = false;
    		oggSupport = false;	
    	}

        // Check for ogg, then mp3, and finally set soundFileExtn to undefined
        loader.soundFileExtn = oggSupport?".ogg":mp3Support?".mp3":undefined;        
    },
    
    loadImage:function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },
    soundFileExtn:".ogg",
    loadSound:function(url){
        this.totalCount++;
        this.loaded = false;
        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src = url+loader.soundFileExtn;
		audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;   
    },
    itemLoaded:function(){
        loader.loadedCount++;
        $('#loadingmessage').html('Loaded '+loader.loadedCount+' of '+loader.totalCount);
        if (loader.loadedCount === loader.totalCount){
            // Loader has loaded completely..
            loader.loaded = true;
            // Hide the loading screen 
            $('#loadingscreen').hide();
            //and call the loader.onload method if it exists
            if(loader.onload){
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}
var mouse = {
    x:0,
    y:0,
    down:false,
    init:function(){
        $('#gamecanvas').mousemove(mouse.mousemovehandler);
        $('#gamecanvas').mousedown(mouse.mousedownhandler);
        $('#gamecanvas').mouseup(mouse.mouseuphandler);
        $('#gamecanvas').mouseout(mouse.mouseuphandler);
    },
    mousemovehandler:function(ev){
        var offset = $('#gamecanvas').offset();
        
		mouse.x = ev.pageX - offset.left;
		mouse.y = ev.pageY - offset.top;
		
		if (mouse.down) {
		    mouse.dragging = true;
		}
    },
    mousedownhandler:function(ev){
        mouse.down = true;
        mouse.downX = mouse.x;
        mouse.downY = mouse.y;
        ev.originalEvent.preventDefault();
        
    },
    mouseuphandler:function(ev){
        mouse.down = false;
        mouse.dragging = false;
    }
}

var entities = {
	definitions:{
		"glass":{
			fullHealth:100,
			density:2.4,
			friction:0.4,
			restitution:0.15,
		},
		"wood":{
			fullHealth:500,
			density:0.7,
			friction:0.4,
			restitution:0.4,
		},
		"dirt":{
			density:3.0,
			friction:1.5,
			restitution:0.2,	
		},
		"burger":{
			shape:"circle",
			fullHealth:40,
			radius:25,
			density:1,
			friction:0.5,
			restitution:0.4,	
		},
		"sodacan":{
			shape:"rectangle",
			fullHealth:80,
			width:40,
			height:60,
			density:1,
			friction:0.5,
			restitution:0.7,	
		},
		"fries":{
			shape:"rectangle",
			fullHealth:50,
			width:40,
			height:50,
			density:1,
			friction:0.5,
			restitution:0.6,	
		},
		"apple":{
			shape:"circle",
			radius:25,
			density:1.5,
			friction:0.5,
			restitution:0.4,	
		},
		"orange":{
			shape:"circle",
			radius:25,
			density:1.5,
			friction:0.5,
			restitution:0.4,	
		},
		"strawberry":{
			shape:"circle",
			radius:15,
			density:2.0,
			friction:0.5,
			restitution:0.4,	
		},
	},
    // take the entity, create a box2d body and add it to the world
    //以物体作为参数，创建一个box2d物体，并加入世界
	create:function(entity){
		var definition = entities.definitions[entity.name];	
		if(!definition){
			console.log ("Undefined entity name",entity.name);
			return;
		}	
		switch(entity.type){
			case "block": // simple rectangles 简单矩形      障碍物
				entity.health = definition.fullHealth;
				entity.fullHealth = definition.fullHealth;
				entity.shape = "rectangle";	
				entity.sprite = loader.loadImage("images/gameOne/entities/"+entity.name+".png");						
				//entity.breakSound = game.breakSound[entity.name];
				box2d.createRectangle(entity,definition);				
				break;
			case "ground": // simple rectangles 简单矩形  地面
				// No need for health. These are indestructible 不可摧毁物体，不必具有生命值
				entity.shape = "rectangle";  
				// No need for sprites. These won't be drawn at all    不会被画出，所以不必具有图像
				box2d.createRectangle(entity,definition);			   
				break;	
			case "hero":	// simple circles 简单的圆  英雄
			case "villain": // can be circles or rectangles  可以是原形或矩形  坏蛋
				entity.health = definition.fullHealth;
				entity.fullHealth = definition.fullHealth;
				entity.sprite = loader.loadImage("images/gameOne/entities/"+entity.name+".png");
				entity.shape = definition.shape;  
				//entity.bounceSound = game.bounceSound;
				if(definition.shape == "circle"){
					entity.radius = definition.radius;
					box2d.createCircle(entity,definition);					
				} else if(definition.shape == "rectangle"){
					entity.width = definition.width;
					entity.height = definition.height;
					box2d.createRectangle(entity,definition);					
				}												 
				break;							
			default:
				console.log("Undefined entity type",entity.type);
				break;
		}		
	},

    // take the entity, its position and angle and draw it on the game canvas
    //以物体、物体的位置和角度做参数，在游戏画面中绘制物体
	draw:function(entity,position,angle){
		game.context.translate(position.x*box2d.scale-game.offsetLeft,position.y*box2d.scale);
		game.context.rotate(angle);
		switch (entity.type){
			case "block":
				game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
						-entity.width/2-1,-entity.height/2-1,entity.width+2,entity.height+2);	
			break;
			case "villain":
			case "hero": 
				if (entity.shape=="circle"){
					game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
							-entity.radius-1,-entity.radius-1,entity.radius*2+2,entity.radius*2+2);	
				} else if (entity.shape=="rectangle"){
					game.context.drawImage(entity.sprite,0,0,entity.sprite.width,entity.sprite.height,
							-entity.width/2-1,-entity.height/2-1,entity.width+2,entity.height+2);
				}
				break;				
			case "ground":
                // do nothing... We will draw objects like the ground & slingshot separately
                //什么都不做，我们单独绘制地面和弹弓
				break;
		}

		game.context.rotate(-angle);
		game.context.translate(-position.x*box2d.scale+game.offsetLeft,-position.y*box2d.scale);
	}

}

var box2d = {
	scale:30,
	init:function(){
        // Setup the box2d World that will do most of they physics calculation
        //创建box2d世界，大部分物理运算将在其中完成
		var gravity = new b2Vec2(0,9.8); //declare gravity as 9.8 m/s^2 downwards
		var allowSleep = true; //Allow objects that are at rest to fall asleep and be excluded from calculations 物体休眠不参与计算
		box2d.world = new b2World(gravity,allowSleep);

        // Setup debug draw 设置调试绘画
		var debugContext = document.getElementById('debugcanvas').getContext('2d');
		var debugDraw = new b2DebugDraw();
		debugDraw.SetSprite(debugContext);
		debugDraw.SetDrawScale(box2d.scale);
		debugDraw.SetFillAlpha(0.3);
		debugDraw.SetLineThickness(1.0);
		debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);	
		box2d.world.SetDebugDraw(debugDraw);
		
	},  
	
	createRectangle:function(entity,definition){
        var bodyDef = new b2BodyDef;
        if(entity.isStatic){
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }
        
        bodyDef.position.x = entity.x/box2d.scale;
        bodyDef.position.y = entity.y/box2d.scale;
        if (entity.angle) {
            bodyDef.angle = Math.PI*entity.angle/180;
        }
        
        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;

        fixtureDef.shape = new b2PolygonShape;
        fixtureDef.shape.SetAsBox(entity.width/2/box2d.scale,entity.height/2/box2d.scale);
        
        var body = box2d.world.CreateBody(bodyDef);	
        body.SetUserData(entity);
        
        var fixture = body.CreateFixture(fixtureDef);
        return body;
	},
	
	createCircle:function(entity,definition){
        var bodyDef = new b2BodyDef;
        if(entity.isStatic){
            bodyDef.type = b2Body.b2_staticBody;
        } else {
            bodyDef.type = b2Body.b2_dynamicBody;
        }
        
        bodyDef.position.x = entity.x/box2d.scale;
        bodyDef.position.y = entity.y/box2d.scale;
        
        if (entity.angle) {
            bodyDef.angle = Math.PI*entity.angle/180;
        }			
        var fixtureDef = new b2FixtureDef;
        fixtureDef.density = definition.density;
        fixtureDef.friction = definition.friction;
        fixtureDef.restitution = definition.restitution;

        fixtureDef.shape = new b2CircleShape(entity.radius/box2d.scale);
        
        var body = box2d.world.CreateBody(bodyDef);	
        body.SetUserData(entity);

        var fixture = body.CreateFixture(fixtureDef);
        return body;
	},  
}
