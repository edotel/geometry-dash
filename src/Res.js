
var imagenes = {
    jugador : "res/jugador.png",
    fondo : "res/fondo.png",
    fondo_2 : "res/fondo_2.png",
    enemigo_morir : "res/enemigo_morir.png",
    bloque_tierra : "res/bloque_metal.png",

};

var rutasImagenes = Object.values(imagenes);
cargarImagenes(0);

function cargarImagenes(indice){
    var imagenCargar = new Image();
    imagenCargar.src = rutasImagenes[indice];
    imagenCargar.onload = function(){
        if ( indice < rutasImagenes.length-1 ){
            indice++;
            cargarImagenes(indice);
        } else {
            iniciarJuego();
        }
    }
}