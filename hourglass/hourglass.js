import Matter from "matter-js";
import decomp from "poly-decomp";

const { Engine, Render, Runner, Bodies, Composite, Common, Query, Composites } =
  Matter;

const engine = Engine.create();
const world = engine.world;

engine.timing.timeScale = 0.75;

Common.setDecomp(decomp);

const render = Render.create({
  element: document.getElementById("hourglass-container"),
  engine: engine,
  options: {
    width: 800,
    height: 600,
    background: "#000000",
  },
});

Render.run(render);

const runner = Runner.create();
Runner.run(runner, engine);

let vertices = [
  { x: 0, y: 100 },
  { x: 195, y: 350 },
  { x: 195, y: 400 },
  { x: 30, y: 580 },
  { x: 370, y: 580 },
  { x: 215, y: 400 },
  { x: 215, y: 350 },
  { x: 400, y: 100 },
  { x: 400, y: 600 },
  { x: 0, y: 600 },
  { x: 0, y: 400 },
  { x: 0, y: 200 },
];

let terrain = Bodies.fromVertices(
  400,
  370,
  [vertices],
  {
    isStatic: true,
    render: {
      fillStyle: "#060a19",
      strokeStyle: "#060a19",
      lineWidth: 1,
    },
  },
  true
);

Composite.add(world, terrain);

let bodyOptions = {
  frictionAir: 0,
  friction: 0.0001,
  restitution: 0.6,
};

Composite.add(
  world,
  Composites.stack(270, 0, 25, 20, 0, 0, function (x, y) {
    return Bodies.circle(x, y, 5, bodyOptions);
  })
);

const total = Composite.allBodies(world).length - 1;

function countParticlesBelow(yThreshold) {
  const bodies = Composite.allBodies(world);
  let count = 0;
  bodies.forEach((body) => {
    if (body.position.y > yThreshold) {
      count++;
    }
  });

  return count - 1 > 0 ? count - 1 : 0;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

setInterval(() => {
  const particlesBelow = countParticlesBelow(250);
  const countElement = document.getElementById("count");
  if (countElement) {
    const divisor = gcd(particlesBelow, total);
    const simplifiedNumerator = particlesBelow / divisor;
    const simplifiedDenominator = total / divisor;
    countElement.textContent = `Tulajdoni hányad: ${simplifiedNumerator} / ${simplifiedDenominator}`;
  }
}, 50);

let enabled = true;

document.getElementById("stop").addEventListener("click", () => {
  const toggleButton = document.getElementById("stop");
  if (enabled) {
    Runner.stop(runner);
    toggleButton.textContent = "Continue";
    enabled = false;
  } else {
    Runner.run(runner, engine);
    toggleButton.textContent = "Stop";
    enabled = true;
  }
});

document.getElementById("reset").addEventListener("click", () => {
  enabled = true;
  Runner.stop(runner);
  Composite.clear(world, true);
  Composite.add(world, terrain);
  Composite.add(
    world,
    Composites.stack(250, 0, 25, 20, 0, 0, function (x, y) {
      return Bodies.circle(x, y, 5, bodyOptions);
    })
  );
  Runner.run(runner, engine);
});
