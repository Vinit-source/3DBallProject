var CenterViewButton = pc.createScript('centerViewButton');

CenterViewButton.attributes.add('target', {
    type: 'entity',
    title: 'Target',
    description: 'The Entity (the ball) to center the view on'
});

CenterViewButton.attributes.add('viewDistance', {
    type: 'number',
    default: 8,
    min: 2,
    title: 'View Distance',
    description: 'Follow distance used when centering. Larger values show more of the surrounding environment'
});

CenterViewButton.attributes.add('label', {
    type: 'string',
    default: 'Center on Ball',
    title: 'Label'
});

// initialize code called once per entity
CenterViewButton.prototype.initialize = function() {
    this.offset = new pc.Vec3();
    this.pos = new pc.Vec3();

    const button = document.createElement('button');
    button.textContent = this.label;
    button.style.cssText = [
        'position:fixed',
        'top:16px',
        'right:16px',
        'z-index:10',
        'padding:8px 14px',
        'font:600 14px sans-serif',
        'color:#fff',
        'background:rgba(30,30,30,0.7)',
        'border:1px solid rgba(255,255,255,0.4)',
        'border-radius:6px',
        'cursor:pointer'
    ].join(';');

    const onClick = () => {
        this.center();
        // Release focus so Space/Enter and arrow keys keep driving the ball, not the button
        button.blur();
    };
    button.addEventListener('click', onClick);
    document.body.appendChild(button);
    this.button = button;

    this.on('destroy', () => {
        button.removeEventListener('click', onClick);
        button.remove();
    });
};

// Frame the ball and its surroundings: pull the camera back and re-aim it at the ball
CenterViewButton.prototype.center = function() {
    if (!this.target) return;

    // Keep the follow script's distance in sync so it doesn't ease back to the old zoom
    const follow = this.entity.script && this.entity.script.followCamera;
    if (follow) {
        follow.distance = this.viewDistance;
    }

    // Same viewing angle as the follow camera (see follow-camera.js)
    const targetPos = this.target.getPosition();
    this.offset.set(0.75, 1, 0.75).scale(this.viewDistance);
    this.pos.copy(targetPos).add(this.offset);

    this.entity.setPosition(this.pos);
    this.entity.lookAt(targetPos);
};
