class Map extends Phaser.Scene {
    constructor() {
        super('mapScene');
    }

    preload()  {
        this.load.path = "./assets/";

        this.map = this.load.image('map', 'temp.jpeg')
    }

    create() {
        // Save the image to a variable when you add it
        let bgMap = this.add.image(0, 0, 'map').setOrigin(0).setDepth(1).setScale(0.5);

        // temp player sprite
        this.ace = new Guy(this, 400, 400, 'ace', 0, 'down', true); // Shifted spawn so he isn't stuck outside bounds
        this.ace.setDepth(5);

        this.guyFSM = this.ace.scene.guyFSM;

        // Automatically set bounds to start at 0,0 and match the image's exact width and height!
        this.cameras.main.setBounds(0, 0, bgMap.width, bgMap.height);
        this.physics.world.setBounds(0, 0, bgMap.width, bgMap.height); 
        
        this.cameras.main.startFollow(this.ace, false, 0.5, 0.5);

        // setup keyboard input
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.Space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        this.guyFSM.step()
    }
}