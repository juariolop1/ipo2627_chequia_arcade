/**
 * Clase base para todas las entidades del juego.
 * Implementa la detección de colisiones AABB (Axis-Aligned Bounding Box).
 */
class Entity {
    constructor(x, y, width, height, color) {
        this.x = x; 
        this.y = y;
        this.width = width; 
        this.height = height;
        this.color = color;
    }

    // Colisión AABB optimizada con salida temprana
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

/* Jugador */
class Player extends Entity {
    constructor(canvasWidth, canvasHeight) {
        super(canvasWidth / 2 - 20, canvasHeight - 50, 40, 20, 'hsl(212, 100%, 67%)');
        this.speed = 3.55;
    }

    move(dx) {
        this.x += dx * this.speed;
        // Limitar el movimiento a los bordes del canvas (800px de ancho)
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > 800) this.x = 800 - this.width;
    }
}

/* Bala */
class Bullet extends Entity {
    constructor(x, y) {
        // Usamos Math.round(x) para asegurar que la bala nace en un píxel exacto
        super(Math.round(x), y, 4, 15, 'hsl(3, 93%, 63%)');
        this.speed = -7;
    }

    update() { 
        // Solo actualizamos la Y. La X se mantiene intacta.
        this.y += this.speed; 
    }
}

/* Enemigo */
class Enemy extends Entity {
    constructor(x, y) {
        super(x, y, 30, 30, 'hsl(128, 49%, 49%)');
        this.speedX = 1.5;
        this.speedY = 15;
    }
}

/**
 * El Modelo del Juego
 * Maneja el estado, la lógica y las reglas.
 */
class GameModel {
    constructor() {
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        
        this.player = new Player(this.canvasWidth, this.canvasHeight);
        this.bullets = [];
        this.enemies = [];
        
        this.score = 0;
        this.lives = 3;
        this.state = 'STOPPED'; // STOPPED, RUNNING, PAUSED, GAMEOVER
        
        this.initEnemies();
    }

    initEnemies() {
        this.enemies = [];
        // Crear una cuadrícula de 3 filas x 8 columnas
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 8; col++) {
                this.enemies.push(new Enemy(col * 60 + 50, row * 50 + 100));
            }
        }
    }

    update() {
        if (this.state !== 'RUNNING') return;

        // 1. Actualizar balas
        this.bullets.forEach(b => b.update());
        // Limpiar balas que salen de la pantalla por arriba
        this.bullets = this.bullets.filter(b => b.y + b.height > 0);

        // 2. Actualizar enemigos (Movimiento grupal)
        let hitEdge = false;
        this.enemies.forEach(e => {
            e.x += e.speedX;
            if (e.x <= 0 || e.x + e.width >= this.canvasWidth) {
                hitEdge = true;
            }
        });

        // Si algún enemigo toca el borde, todos cambian de dirección y bajan
        if (hitEdge) {
            this.enemies.forEach(e => {
                e.speedX *= -1;
                e.y += e.speedY;
            });
        }

        // 3. Detección de colisiones (Balas vs Enemigos)
        // Iteramos hacia atrás para poder eliminar elementos del array sin romper el bucle
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.bullets[i] && this.bullets[i].collidesWith(this.enemies[j])) {
                    this.bullets.splice(i, 1); // Elimina la bala
                    this.enemies.splice(j, 1); // Elimina el enemigo
                    this.score += 10;          // Suma puntos
                    break; // La bala ya no existe, pasamos a la siguiente bala
                }
            }
        }

        // 4. Condiciones de Fin de Juego
        // Si no quedan enemigos -> Victoria
        if (this.enemies.length === 0) {
            this.state = 'GAMEOVER';
        }

        // Si algún enemigo llega a la altura del jugador -> Derrota
        const enemyReachedBottom = this.enemies.some(e => e.y + e.height >= this.player.y);
        if (enemyReachedBottom) {
            this.lives = 0;
            this.state = 'GAMEOVER';
        }
    }

    shoot() {
        if (this.state === 'RUNNING') {
            // Calculamos la posición X central del jugador
            const bulletX = this.player.x + (this.player.width / 2) - 2;
            
            // Creamos la bala. Al pasarle bulletX, el constructor de Bullet
            // se encarga de redondearla y fijarla.
            this.bullets.push(new Bullet(bulletX, this.player.y));
        }
    }
}