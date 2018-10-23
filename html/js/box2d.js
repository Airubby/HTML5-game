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

	// Custom Drawing
	if (specialBody){
		drawSpecialBody();
	}

	//Kill Special Body if Dead
	if (specialBody && specialBody.GetUserData().life<=0){
		world.DestroyBody(specialBody);
		specialBody = undefined;
		console.log("The special body was destroyed");
	}

	setTimeout(animate, timeStep);
}