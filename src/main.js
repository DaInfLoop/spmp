import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";
// import "kaplay/global"; // uncomment if you want to use without the k. prefix

function start() {
    const k = kaplay();
    k.setGravity(1600);

    k.loadRoot("./public/"); // A good idea for Itch.io publishing later
    k.loadSprite("bean", "sprites/bean.png");
    k.loadSprite("coin", "sprites/coin.png");
    k.loadSprite("grass", "sprites/grass.png");
    k.loadBitmapFont("happy", "sprites/happy.png", 36, 45);


    const roomCode = Playroom.getRoomCode()

    k.add([
        k.text(`${roomCode}\n(1/1)`, { font: 'happy', align: "right" }),
        k.pos(k.width() - 20, 20),
        k.anchor('topright'),
        k.fixed()
    ])

    const t = k.add([
        k.text(`1.0/8.0`, { font: 'happy', align: "left" }),
        k.pos(20, 20),
        k.anchor('topleft'),
        k.fixed()
    ])

    const p = k.add([
        k.pos(120, 80),
        k.sprite("bean"),
        k.area(),
        k.body(),
        k.anchor('center'),
        k.rotate(),
        k.scale()
    ]);

    k.add([
        k.sprite('grass', { width: k.width() + 128, tiled: true }),
        k.pos(-64, k.height() - 64),
        k.area(),
        k.body({ isStatic: true }),
    ]);

    k.onKeyDown(["left", "a"], () => {
        if (!p.exists()) return
        p.angle = p.angle - 5
        p.pos = p.pos.add(-5, 0)
    })

    k.onKeyDown(["right", "d"], () => {
        if (!p.exists()) return
        p.angle = p.angle + 5
        p.pos = p.pos.add(5, 0)
    })

    k.onKeyPress(["space", "up", "w"], () => {
        if (!p.exists()) return
        if (!p.isGrounded()) return;

        const startY = p.pos.y

        k.tween(
            startY,
            startY - 100,
            0.3,
            (value) => {
                p.pos.y = value
            },
            k.easings.easeOutQuad
        ).then(() => {
            k.tween(
                p.pos.y,
                startY,
                0.3,
                (value) => {
                    p.pos.y = value
                },
                k.easings.easeInQuad
            )
        })
    })

    let coinSize = 1;

    // Randomly spawn coins
    const l = k.loop(2, () => {
        const coin = k.add([
            k.sprite("coin"),
            k.pos(
                k.rand(40, k.width() - 40),
                k.height() - 100
            ),
            k.area(),
            k.anchor("center"),
            k.scale(1),
            "coin"
        ]);

        // Remove coin after 8 seconds if not collected
        k.wait(8, () => {
            if (coin.exists()) {
                coin.destroy();
            }
        });
    });

    // Collect coins
    p.onCollide("coin", async (coin) => {
        coin.destroy();

        coinSize += 0.2;
        t.text = `${coinSize.toFixed(1)}/8.0`

        await k.tween(
            p.scale,
            k.vec2(coinSize),
            0.2,
            (value) => {
                p.scale = value;
            },
            k.easings.easeOutBack
        );

        if (coinSize > 8) {
            k.burp();
            k.addKaboom(p.pos);
            p.destroy();
            l.cancel();

            // Victory scene
            k.add([
                k.rect(k.width(), k.height()),
                k.pos(0, 0),
                k.color(0, 0, 0),
                k.fixed(),
                k.z(100)
            ]);

            k.add([
                k.text("YOU WIN!", {
                    size: 64,
                    font: "happy",
                    align: "center"
                }),
                k.pos(k.center()),
                k.anchor("center"),
                k.color(255, 220, 50),
                k.fixed(),
                k.z(101)
            ]);

            console.log("YOU WIN!");
        }
    });
}

Playroom.insertCoin({
    maxPlayersPerRoom: 1,
    maxSpectatorsPerRoom: 0,
}).then(start);