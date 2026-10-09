var PlatformMover = pc.createScript('platformMover');

PlatformMover.attributes.add('lengthFraction', {
    type: 'number',
    default: 0.5,
    min: 0,
    max: 5,
    title: 'Travel (x length)',
    description: 'Total travel distance as a fraction of the square\'s length (0.5 = half its length)'
});

PlatformMover.attributes.add('minSpeed', {
    type: 'number',
    default: 0.5,
    min: 0.1,
    max: 10,
    title: 'Min Speed',
    description: 'Lower bound of the random speed (units per second)'
});

PlatformMover.attributes.add('maxSpeed', {
    type: 'number',
    default: 2,
    min: 0.1,
    max: 10,
    title: 'Max Speed',
    description: 'Upper bound of the random speed (units per second)'
});

PlatformMover.attributes.add('minDelay', {
    type: 'number',
    default: 0,
    min: 0,
    max: 10,
    title: 'Min Delay',
    description: 'Lower bound of the random delay in seconds (before starting and when pausing at each end)'
});

PlatformMover.attributes.add('maxDelay', {
    type: 'number',
    default: 2,
    min: 0,
    max: 10,
    title: 'Max Delay',
    description: 'Upper bound of the random delay in seconds (before starting and when pausing at each end)'
});

// Random value in [a, b], tolerant of min/max being entered the wrong way round
PlatformMover.prototype.randomBetween = function(a, b) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return lo + Math.random() * (hi - lo);
};

// initialize code called once per entity
PlatformMover.prototype.initialize = function() {
    this.startPos = this.entity.getPosition().clone();
    this.newPos = new pc.Vec3();

    // The square's length along X in world units (assumes a unit-sized box/plane scaled to size)
    const length = Math.abs(this.entity.getLocalScale().x);
    this.distance = length * this.lengthFraction;

    // Each platform gets its own random speed, and waits a random time before first moving
    this.speed = this.randomBetween(this.minSpeed, this.maxSpeed);
    this.wait = this.randomBetween(this.minDelay, this.maxDelay);

    // Start at the left end and travel to the right end, then back (ping-pong)
    this.offset = 0;
    this.direction = 1;
};

// update code called every frame
PlatformMover.prototype.update = function(dt) {
    if (this.distance <= 0) return;

    // Hold still while the delay runs out
    if (this.wait > 0) {
        this.wait -= dt;
        return;
    }

    this.offset += this.direction * this.speed * dt;

    // At either end: clamp, turn around, pause for a new random delay and pick a new random speed
    if (this.offset >= this.distance || this.offset <= 0) {
        this.offset = pc.math.clamp(this.offset, 0, this.distance);
        this.direction = -this.direction;
        this.wait = this.randomBetween(this.minDelay, this.maxDelay);
        this.speed = this.randomBetween(this.minSpeed, this.maxSpeed);
    }

    this.newPos.copy(this.startPos);
    this.newPos.x += this.offset;

    // Kinematic bodies must be moved via the rigidbody so the ball rides along physically
    if (this.entity.rigidbody) {
        this.entity.rigidbody.teleport(this.newPos);
    } else {
        this.entity.setPosition(this.newPos);
    }
};
