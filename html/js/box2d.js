// Declare all the commonly used objects as variables for convenience
var b2Vec2 = Box2D.Common.Math.b2Vec2;
var b2BodyDef = Box2D.Dynamics.b2BodyDef;
var b2Body = Box2D.Dynamics.b2Body;
var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
var b2Fixture = Box2D.Dynamics.b2Fixture;
var b2World = Box2D.Dynamics.b2World;
var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;
var b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef;

var world;
var scale = 30; //在canvas上的30像素表示box2d世界中的一米
function init(){
	// 创建box2d World对象，该对象将完成大部分物理计算
	var gravity = new b2Vec2(0,9.8); //声明重力加速度9.8 m/s^2向下
	var allowSleep = true; //允许静止的物体进入休眠状态，休眠物体不参与物理仿真计算
	world = new b2World(gravity,allowSleep);	

	createFloor();

	createRectangularBody();
	createCircularBody();
	createSimplePolygonBody();
	// Create a body combining two shapes  创建由两个形状组成的物体
	createComplexBody();
	// Join two bodies using a revolute joint  将两个物体用转动关节连接起来
	createRevoluteJoint();
	// Create a body with special user data  创建具有自定义用户数据的对象
	createSpecialBody();	

	// Create contact listeners and track events  创建接触监听器并追踪事件
	listenForContact();
	

	setupDebugDraw();
	animate();

	
}

function createFloor(){	
	//body的预定义对象，包括创建body刚体需要用到的所有数据
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_staticBody;
	bodyDef.position.x = 640/2/scale;
	bodyDef.position.y = 450/scale;
	
	// fixture用来向body添加shape以实现碰撞检测
	// A fixture的预定义对象，用来建立fixture
	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.2;
	
	fixtureDef.shape = new b2PolygonShape;
	fixtureDef.shape.SetAsBox(320/scale,10/scale); //640 像素宽and 20像素高

	var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixtureDef);
}

var context;
function setupDebugDraw(){
	context = document.getElementById('canvas').getContext('2d');

	var debugDraw = new b2DebugDraw();

	// Use this canvas context for drawing the debugging screen	 //调试画面
	debugDraw.SetSprite(context);
	// Set the scale  设置绘图比例
	debugDraw.SetDrawScale(scale);
	// Fill boxes with an alpha transparency of 0.3 填充透明度为0.3
	debugDraw.SetFillAlpha(0.3);
	// Draw lines with a thickness of 1  线条的宽度为1
	debugDraw.SetLineThickness(1.0);
	// Display all shapes and joints  绘制所有的shapes和joints
	debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);	

	// Start using debug draw in our world   设置调制绘制模式
	world.SetDebugDraw(debugDraw);
}


var timeStep = 1/60;

//As per the Box2d manual, the suggested iteration count for Box2D is 8 for velocity and 3 for position. 
//按照box2d手册建议的；速度8，位置3
var velocityIterations = 8;
var positionIterations = 3;

function animate(){
	world.Step(timeStep,velocityIterations,positionIterations);
	world.ClearForces();

	world.DrawDebugData();

	// Custom Drawing  自定义绘制
	if (specialBody){
		drawSpecialBody();
	}

	//Kill Special Body if Dead  摧毁耗尽生命值的物体
	if (specialBody && specialBody.GetUserData().life<=0){
		world.DestroyBody(specialBody);
		specialBody = undefined;
		console.log("The special body was destroyed");
	}

	setTimeout(animate, timeStep);
}

function createRectangularBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 40/scale;
	bodyDef.position.y = 100/scale;
	
	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.3;
	
	fixtureDef.shape = new b2PolygonShape;
	fixtureDef.shape.SetAsBox(30/scale,50/scale);
		
	var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixtureDef);
}

function createCircularBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 130/scale;
	bodyDef.position.y = 100/scale;

	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.7;
	
	fixtureDef.shape = new b2CircleShape(30/scale);
	
	var body = world.CreateBody(bodyDef);
	var fixture = body.CreateFixture(fixtureDef);	
}

function createSimplePolygonBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 230/scale;
	bodyDef.position.y = 50/scale;
	
	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.2;
	
	fixtureDef.shape = new b2PolygonShape;
	// Create an array of b2Vec2 points in clockwise direction
	var points = [
		new b2Vec2(0,0),
		new b2Vec2(40/scale,50/scale),
		new b2Vec2(50/scale,100/scale),
		new b2Vec2(-50/scale,100/scale),
		new b2Vec2(-40/scale,50/scale),
	
	];	
	// Use SetAsArray to define the shape using the points array
	fixtureDef.shape.SetAsArray(points,points.length);
	
	var body = world.CreateBody(bodyDef);

	var fixture = body.CreateFixture(fixtureDef);	
}

function createComplexBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 350/scale;
	bodyDef.position.y = 50/scale;
	var body = world.CreateBody(bodyDef);
	
	//Create first fixture and attach a circular shape to the body
	//创建第一个载具并为物体添加圆形状
	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.7;	
	fixtureDef.shape = new b2CircleShape(40/scale);
	body.CreateFixture(fixtureDef);
	
	// Create second fixture and attach a polygon shape to the body.
	//创建第二个载具并为物体添加多边形形状
	fixtureDef.shape = new b2PolygonShape;
	var points = [
		new b2Vec2(0,0),
		new b2Vec2(40/scale,50/scale),
		new b2Vec2(50/scale,100/scale),
		new b2Vec2(-50/scale,100/scale),
		new b2Vec2(-40/scale,50/scale),
	];
	fixtureDef.shape.SetAsArray(points,points.length);
	body.CreateFixture(fixtureDef);
}

function createRevoluteJoint(){
	//Define the first body  定义第一个物体
	var bodyDef1 = new b2BodyDef;
	bodyDef1.type = b2Body.b2_dynamicBody;
	bodyDef1.position.x = 480/scale;
	bodyDef1.position.y = 50/scale;
	var body1 = world.CreateBody(bodyDef1);
	
	//Create first fixture and attach a rectangular shape to the body
	//创建第一个载具并为物体添加矩形形状
	var fixtureDef1 = new b2FixtureDef;
	fixtureDef1.density = 1.0;
	fixtureDef1.friction = 0.5;
	fixtureDef1.restitution = 0.5;	
	fixtureDef1.shape = new b2PolygonShape;
	fixtureDef1.shape.SetAsBox(50/scale,10/scale);
	
	body1.CreateFixture(fixtureDef1);
	
	// Define the second body 定义第二个物体
	var bodyDef2 = new b2BodyDef;
	bodyDef2.type = b2Body.b2_dynamicBody;
	bodyDef2.position.x = 470/scale;
	bodyDef2.position.y = 50/scale;
	var body2 = world.CreateBody(bodyDef2);
	
	//Create second fixture and attach a polygon shape to the body
	//创建第一个载具并为物体添加多边形形状
	var fixtureDef2 = new b2FixtureDef;
	fixtureDef2.density = 1.0;
	fixtureDef2.friction = 0.5;
	fixtureDef2.restitution = 0.5;	
	fixtureDef2.shape = new b2PolygonShape;
	var points = [
		new b2Vec2(0,0),
		new b2Vec2(40/scale,50/scale),
		new b2Vec2(50/scale,100/scale),
		new b2Vec2(-50/scale,100/scale),
		new b2Vec2(-40/scale,50/scale),
	];
	fixtureDef2.shape.SetAsArray(points,points.length);	
	body2.CreateFixture(fixtureDef2);	
	
	
	// Create a joint between body1 and body2  创建结合点连接body1和body2
	var jointDef = new b2RevoluteJointDef;
	var jointCenter = new b2Vec2(470/scale,50/scale);

	jointDef.Initialize(body1, body2, jointCenter);
	world.CreateJoint(jointDef);	
}

var specialBody;
function createSpecialBody(){
	var bodyDef = new b2BodyDef;
	bodyDef.type = b2Body.b2_dynamicBody;
	bodyDef.position.x = 450/scale;
	bodyDef.position.y = 0/scale;	
	
	specialBody = world.CreateBody(bodyDef);
	specialBody.SetUserData({name:"special",life:250}) //传入自定义属性name和life
	
	//Create a fixture to attach a circular shape to the body //创建第一个载具并为物体添加圆形状
	var fixtureDef = new b2FixtureDef;
	fixtureDef.density = 1.0;
	fixtureDef.friction = 0.5;
	fixtureDef.restitution = 0.5;
	
	fixtureDef.shape = new b2CircleShape(30/scale);
	
	var fixture = specialBody.CreateFixture(fixtureDef);
}

function listenForContact(){
	var listener = new Box2D.Dynamics.b2ContactListener;
	listener.PostSolve = function(contact,impulse){ //重写PostSolve方法
		var body1 = contact.GetFixtureA().GetBody();
		var body2 = contact.GetFixtureB().GetBody();

		// If either of the bodies is the special body, reduce its life
		//如果两个物体都有生命值，减少其生命值
		if (body1 == specialBody || body2 == specialBody){
			var impulseAlongNormal = impulse.normalImpulses[0];
			specialBody.GetUserData().life -= impulseAlongNormal;
			console.log("The special body was in a collision with impulse", impulseAlongNormal,"and its life has now become ",specialBody.GetUserData().life);
		}	
	};
	world.SetContactListener(listener);
}

function drawSpecialBody(){
	// Get body position and angle 获取body的位置和角度
	var position = specialBody.GetPosition();
	var angle = specialBody.GetAngle();

	// Translate and rotate axis to body position and angle 移动并旋转物体
	context.translate(position.x*scale,position.y*scale);
	context.rotate(angle);
	
	// Draw a filled circular face  绘制实心的圆面
	context.fillStyle = "rgb(200,150,250);";
	context.beginPath();
	context.arc(0,0,30,0,2*Math.PI,false);
	context.fill();	
	
	// Draw two rectangular eyes  绘制两个矩形的眼睛
	context.fillStyle = "rgb(255,255,255);";
	context.fillRect(-15,-15,10,5);
	context.fillRect(5,-15,10,5);
	
	// Draw an upward or downward arc for a smile depending on life
	//绘制向上或向下的圆弧，根据生命值决定是否微笑
	context.strokeStyle = "rgb(255,255,255);";
	context.beginPath();
	if (specialBody.GetUserData().life>100){
		context.arc(0,0,10,Math.PI,2*Math.PI,true);
	} else {
		context.arc(0,10,10,Math.PI,2*Math.PI,false);
	}
	context.stroke();
	
	// Translate and rotate axis back to original position and angle
	//移动并旋转坐标轴至最初的位置和角度
	context.rotate(-angle);
	context.translate(-position.x*scale,-position.y*scale);
}