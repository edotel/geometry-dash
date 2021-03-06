class GameLayer extends Layer {

    constructor() {
        super();
        this.mensaje = new Boton(imagenes.mensaje_como_jugar, 480/2, 320/2);
        this.pausa = true;
        this.iniciar();
    }

    iniciar() {

        this.espacio = new Espacio(2.7);

        this.scrollX = 0;
        this.suelos = [];
        this.bloques = [];
        this.pinchos = [];
        this.gravitys = [];
        this.naves = [];
        this.deslizables = [];

        this.jugador = new Jugador(50, 50);
        this.fondo = new Fondo(imagenes.fondo,480*0.5,320*0.5);


        this.cargarMapa("res/"+nivelActual+".txt");
        this.jugador.senBlocks(this.bloques,this.suelos);

        this.canChange = true;

    }

    actualizar (){

        if (this.pausa){
            return;
        }

        if(this.jugador.isDead()) {
            this.iniciar();
        }

        if ( this.copa.colisiona(this.jugador)){
            nivelActual++;
            if (nivelActual > nivelMaximo){
                nivelActual = 0;
            }
            pararMusica();

            this.pausa = true;
            this.mensaje =
                new Boton(imagenes.mensaje_ganar, 480/2, 320/2);
            this.iniciar();

            this.jugador.matar();
        }


        for (var i=0; i < this.gravitys.length; i++) {
            this.gravitys[i].actualizar();
        }

        for (var i=0; i < this.naves.length; i++) {
            this.naves[i].actualizar();
        }

        for (var i=0; i < this.deslizables.length; i++) {
            this.deslizables[i].actualizar();
        }

        this.espacio.actualizar();
        this.fondo.vx = -2;
        this.fondo.actualizar();
        this.jugador.actualizar();


        for (var i=0; i < this.suelos.length; i++) {
            if (this.jugador.colisiona(this.suelos[i])) {
                this.canChange = true;
                this.jugador.vy = 0;
            }
        }


        for (var i=0; i < this.bloques.length; i++){
            if (this.jugador.colisiona(this.bloques[i])) {
                this.canChange = true;
                if (this.jugador.colisionaLateral(this.bloques[i]))
                    this.jugador.golpeado();
            }

        }

        for (var i=0; i < this.pinchos.length; i++) {
            if (this.jugador.colisiona(this.pinchos[i]))
                this.jugador.golpeado();
        }

        for (var i=0; i < this.naves.length; i++) {
            if (this.jugador.colisiona(this.naves[i])) {
                this.jugador.estado = estados.volando;
                this.naves.splice(i,1);
            }
        }

        for (var i=0; i < this.gravitys.length; i++) {
            if (this.jugador.colisiona(this.gravitys[i])){
                this.jugador.estado = estados.gravitatorio;
                this.espacio.gravedad = 1;
                this.gravitys.splice(i,1);
                this.espacio.eliminarCuerpoDinamico(this.gravitys[i]);
            }

        }

        for (var i=0; i < this.deslizables.length; i++) {
            if (this.jugador.colisiona(this.deslizables[i])) {
                this.espacio.gravedad = 2.7;
                this.jugador.estado = estados.deslizandose;
                this.jugador.cubo();
                this.deslizables.splice(i, 1);
                this.espacio.eliminarCuerpoDinamico(this.deslizables[i]);
            }
        }





    }


    calcularScroll(){
        // limite izquierda
        if ( this.jugador.x > 480 * 0.3) {
            if (this.jugador.x - this.scrollX < 480 * 0.3) {
                this.scrollX = this.jugador.x - 480 * 0.3;
            }
        }

        // limite derecha
        if ( this.jugador.x < this.anchoMapa - 480 * 0.3 ) {
            if (this.jugador.x - this.scrollX > 480 * 0.4) {
                this.scrollX = this.jugador.x - 480 * 0.4;
            }
        }
    }

    dibujar (){
        this.calcularScroll();
        this.fondo.dibujar();

        for (var i=0; i < this.suelos.length; i++){
            this.suelos[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.bloques.length; i++){
            this.bloques[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.pinchos.length; i++){
            this.pinchos[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.gravitys.length; i++) {
            this.gravitys[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.naves.length; i++) {
            this.naves[i].dibujar(this.scrollX);
        }

        for (var i=0; i < this.deslizables.length; i++) {
            this.deslizables[i].dibujar(this.scrollX);
        }

        this.jugador.dibujar(this.scrollX);

        if ( this.pausa ) {
            this.mensaje.dibujar();
        }

    }



    procesarControles( ){

        if (controles.continuar){
            controles.continuar = false;
            this.pausa = false;
            reproducirMusica();
        }


        if ( controles.barspace > 0 ){
            switch (this.jugador.estado) {

                case estados.volando:
                    this.jugador.volar(-1);
                    break;
                case estados.gravitatorio:
                    this.cambiarGravedad();
                    break;
                default:
                    this.jugador.saltar();
                    break;

            }

        }
    }


    cargarMapa(ruta){
        var fichero = new XMLHttpRequest();
        fichero.open("GET", ruta, false);

        fichero.onreadystatechange = function () {
            var texto = fichero.responseText;
            var lineas = texto.split('\n');
            this.anchoMapa = (lineas[0].length-1) * 40;
            for (var i = 0; i < lineas.length; i++){
                var linea = lineas[i];
                for (var j = 0; j < linea.length; j++){
                    var simbolo = linea[j];
                    var x = 40/2 + j * 40; // x central
                    var y = 32 + i * 32; // y de abajo
                    this.cargarObjetoMapa(simbolo,x,y);
                }
            }
        }.bind(this);

        fichero.send(null);
    }


    cargarObjetoMapa(simbolo, x, y){
        switch(simbolo) {
            case "1":
                this.jugador = new Jugador(x, y);
                // modificación para empezar a contar desde el suelo
                this.jugador.y = this.jugador.y - this.jugador.alto/2;
                this.espacio.agregarCuerpoDinamico(this.jugador);
                break;
            case "#":
                var suelo = new Bloque(imagenes.suelo, x,y);
                suelo.y = suelo.y - suelo.alto/2;
                // modificación para empezar a contar desde el suelo
                this.suelos.push(suelo);
                this.espacio.agregarCuerpoEstatico(suelo);
                break;
            case "B":
                var bloque = new Bloque(imagenes.bloque, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.bloques.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "T":
                var bloque = new Bloque(imagenes.triangulo, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.pinchos.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "A":
                var bloque = new Bloque(imagenes.triangulo_apoyo, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.pinchos.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "V":
                var bloque = new Bloque(imagenes.triangulo_volteado, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.pinchos.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "P":
                var bloque = new Bloque(imagenes.pincho, x,y);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.pinchos.push(bloque);
                this.espacio.agregarCuerpoEstatico(bloque);
                break;
            case "G":
                var bloque = new Tile(imagenes.gravity, x,y,2,3);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.gravitys.push(bloque);
                this.espacio.agregarCuerpoDinamico(bloque);
                break;
            case "O":
                var bloque = new Tile(imagenes.bloque_apoyo, x,y,2,3);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.bloques.push(bloque);
                this.espacio.agregarCuerpoDinamico(bloque);
                break;
            case "N":
                var bloque = new Tile(imagenes.nave, x,y,2,3);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.naves.push(bloque);
                this.espacio.agregarCuerpoDinamico(bloque);
                break;
            case "D":
                var bloque = new Tile(imagenes.animacion_deslizar, x,y,2,2);
                bloque.y = bloque.y - bloque.alto/2;
                // modificación para empezar a contar desde el suelo
                this.deslizables.push(bloque);
                this.espacio.agregarCuerpoDinamico(bloque);
                break;

            case "C":
                this.copa = new Bloque(imagenes.copa, x,y);
                this.copa.y = this.copa.y - this.copa.alto/2;
                // modificación para empezar a contar desde el suelo
                this.espacio.agregarCuerpoDinamico(this.copa);
                break;
        }
    }

    cambiarGravedad(){

        if(this.canChange) {
            this.espacio.gravedad = this.espacio.gravedad * -1;
            this.canChange = false;
        }
    }

}