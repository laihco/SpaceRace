class Map extends Phaser.Scene {
    constructor() {
        super('mapScene');
    }

    preload() {
        this.load.path = "./assets/";

        this.load.spritesheet('map', 'bg_anim.png', {
            frameWidth: 155,
            frameHeight: 146
        });
    }

    create() {
        this.anims.create({
            key: 'map_anim',
            frames: this.anims.generateFrameNumbers('map', { start: 0, end: 3 }),
            frameRate: 7,
            repeat: -1
        });

        let bgMap = this.add.sprite(0, 0, 'map')
            .setOrigin(0)
            .setDepth(1)
            .setScale(5);

        bgMap.play('map_anim');

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

        this.createUI()
        this.ui.setDepth(100)
        console.log(this.ui)

        this.time.addEvent({
            delay: 600000, // 10 minutes
            loop: true,
            callback: () => {
                this.triggerSleepWarning();
            }
        });

        // mini game scene testing purpose
        this.useButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update(time, delta) {
        this.guyFSM.step();

        // mini game scene testing purpose
        if (Phaser.Input.Keyboard.JustDown(this.useButton))
        {
            this.scene.launch("trashScene");
        }

        // example: slowly drain stats
        this.fuel -= 0.01;
        this.food -= 0.005;
        this.water -= 0.008;

        this.updateUI();
    }

    createUI() {

        // container that stays fixed to camera
        this.ui = this.add.container(0, 0);
        this.ui.setScrollFactor(0);

        // stats
        this.fuel = 100;
        this.food = 100;
        this.water = 100;

        // background box behind stats
        this.uiBg = this.add.rectangle(5, 5, 150, 70, 0x000000, 0.85)
            .setOrigin(0);

        this.ui.add(this.uiBg);

        this.fuelText = this.add.text(10, 10, "Fuel: 100", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });
        this.foodText = this.add.text(10, 30, "Food: 100", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });
        this.waterText = this.add.text(10, 50, "Water: 100", { fontFamily: 'spaceranger', fontSize: '18px', fill: '#fff' });

        this.ui.add([this.fuelText, this.foodText, this.waterText]);

        this.sleepText = this.add.text(this.scale.width / 2, 20, "GO TO BED!", {
            fontFamily: 'spaceranger',
            fontSize: '20px',
            fill: '#ff0000'
        }).setOrigin(0.5).setVisible(false);

        this.ui.add(this.sleepText);

        //compass
        this.compass = this.add.circle(this.scale.width - 50, this.scale.height - 50, 30, 0x222222);
        this.compassNeedle = this.add.line(this.scale.width - 50, this.scale.height - 50, 0, 0, 0, -20, 0xff0000)
            .setLineWidth(3);

        this.ui.add([this.compass, this.compassNeedle]);
    }

    updateUI() {
        this.fuelText.setText("Fuel: " + Math.floor(this.fuel));
        this.foodText.setText("Food: " + Math.floor(this.food));
        this.waterText.setText("Water: " + Math.floor(this.water));
    }

    triggerSleepWarning() {
        this.sleepText.setVisible(true);

        // hide after 5 seconds
        this.time.delayedCall(5000, () => {
            this.sleepText.setVisible(false);
        });
    }

}