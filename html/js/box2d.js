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

	// // Custom Drawing
	// if (specialBody){
	// 	drawSpecialBody();
	// }

	// //Kill Special Body if Dead
	// if (specialBody && specialBody.GetUserData().life<=0){
	// 	world.DestroyBody(specialBody);
	// 	specialBody = undefined;
	// 	console.log("The special body was destroyed");
	// }

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
