var PlatformMover = pc.createScript('platformMover');

PlatformMover.attributes.add('lengthFraction', {
    type: 'number',
    default: 0.5,
    min: 0,
    max: 5,
    title: 'Travel (x length)',
    description: 'Total travel distance as a fraction of the square\'s length (0.5 = half its length)'
});

PlatformMover.attributes.add('speed', {
    type: 'number',
    default: 1,
    min: 0.1,
    max: 10,
    title: 'Speed',
    description: 'Units per second'
});

// initialize code called once per entity
PlatformMover.prototype.initialize = function() {
    this.startPos = this.entity.getPosition().clone();
    this.newPos = new pc.Vec3();

    // The square's length along X in world units (assumes a unit-sized box/plane scaled to size)
    const length = Math.abs(this.entity.getLocalScale().x);
    this.distance = length * this.lengthFraction;

    // Start at the left end and travel to the right end, then back (ping-pong)
    this.time = 0;
};

// update code called every frame
PlatformMover.prototype.update = function(dt) {
    if (this.distance <= 0) return;

    this.time += dt * this.speed;

    // Triangle wave 0 -> 1 -> 0 gives constant-speed left/right motion
    const cycle = this.distance * 2;
    const d = this.time % cycle;
    const offset = d <= this.distance ? d : cycle - d;

    this.newPos.copy(this.startPos);
    this.newPos.x += offset;

    // Kinematic bodies must be moved via the rigidbody so the ball rides along physically
    if (this.entity.rigidbody) {
        this.entity.rigidbody.teleport(this.newPos);
    } else {
        this.entity.setPosition(this.newPos);
    }
};
