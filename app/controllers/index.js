var imagenFrontal = Ti.UI.createImageView({
    width: "100%",
    height: "100%",
    autorotate: true
})

$.topCredencial.addEventListener('click', function (e) {
    if (Ti.Media.hasCameraPermissions()) {
        openCameraf();
    } else {
        Ti.Media.requestCameraPermissions(function (e) {
            if (e.success) {
                openCameraf();
            } else {
                alert('You denied permission');
            }
        });
    }
});

var image;
var appPhoto;
var form_url = "https://www.ideashappy.com/ahorra/new.php";

function openCameraf() {
    Ti.Media.openPhotoGallery({
        mediaTypes: [Ti.Media.MEDIA_TYPE_PHOTO],
        success: function (e) {
            //btnPhoto.value = e.media;
            //anImageView.image = e.media;
            //btnPhoto.title = '[ Photo Selected ]';
            var c = Titanium.Network.createHTTPClient({
                onload: function (e) {
                    console.log('por aca');

                    Ti.API.info('this.responseText' + this.responseText);
                    //json = JSON.stringify(this.responseText);
                    alert(this.responseText);
                },
                onerror: function (e) {
                    console.log('pro aqui');
                    alert(JSON.stringify(e));
                }
            });
            c.open('POST', form_url);
            Ti.API.info('form_url ' + encodeURI(form_url));
            c.setRequestHeader('Content-Type', 'multipart/form-data');
            c.send({
                userid: 81,
                image: e.media
            });
        },
        cancel: function () {
            //btnPhoto.value = null;
            ///btnPhoto.title = 'Select Photo...';
            console.log('cancel');
        },
        error: function (err) {

            //btnPhoto.value = null;
            //btnPhoto.title = 'Select Photo...';
            console.log('error');
            Ti.API.error(err);
        }
    });
}

function resultado() {
    console.log('resultado');
}

function openCameraf2() {

    $.frontal.add(imagenFrontal);
    var dialog = Titanium.UI.createOptionDialog({
        title: 'Seleccion el Tipo de Imagen',
        options: ['Camara', 'Galeria de Fotos', 'Cancelar'],
        cancel: 2
    });
    dialog.addEventListener('click', function (e) {
        if (e.index == 0) {
            Titanium.Media.showCamera({
                success: function (e) {
                    image = e.media;
                    if (e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                        imagenFrontal.image = image;
                        var url = 'https://www.ideashappy.com/ahorra/nuevo.php';
                        var xhr = Titanium.Network.createHTTPClient({
                            onload: function (e) {
                                Ti.API.info('2. Info received from the uploading: ' + this.responseText);
                                // var json = JSON.parse(this.responseText);
                                // console.log("JSON = ", json);
                            },
                            onerror: function (e) {
                                console.log("Error", e);
                            },
                            timeout: 200000
                        });

                        var params = {
                            media: e.media,
                        };
                        ///var alerta = JSON.stringify(e.media);
                        //alert(alerta);
                        xhr.open("POST", url);
                        xhr.setRequestHeader('Content-Type', 'multipart/form-data');
                        xhr.send(params);
                    }
                },
                cancel: function () { },
                error: function (error) {
                    var a = Titanium.UI.createAlertDialog({
                        title: 'Camera'
                    });
                    if (error.code == Titanium.Media.NO_CAMERA) {
                        a.setMessage('Device does not have camera');
                    } else {
                        a.setMessage('Unexpected error: ' + error.code);
                    }
                    a.show();
                },
                allowImageEditing: true,
                saveToPhotoGallery: true
            });
        } else if (e.index == 1) {
            Titanium.Media.openPhotoGallery({
                success: function (e) {
                    image = e.media;
                    if (e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
                        imagenFrontal.image = image;
                        var url = 'https://www.ideashappy.com/ahorra/nuevo.php';
                        //var url = "http://www.mark-43.net/mark43-service/v1/api-drive/subir-imagen"
                        var xhr = Titanium.Network.createHTTPClient({
                            onload: function (e) {
                                console.log('url ', url);
                                console.log('1 Info received from the uploading: ' + this.responseText);
                                //console.log("parametro = ",alerta)
                                // var json = JSON.parse(this.responseText);
                                // console.log("JSON = ", json);
                            },
                            onerror: function (e) {
                                console.log("Error", e);
                            },
                            timeout: 200000
                        });

                        var params = {
                            media: e.media,
                        };
                        var alerta = JSON.stringify(params);
                        //alert(alerta);
                        xhr.open("POST", url);
                        //xhr.setRequestHeader('Content-Type', 'multipart/form-data');
                        xhr.send(params);
                        //console.log("ALERTA = ",alerta)

                    }
                },
                cancel: function () {
                    //user cancelled the action fron within
                    //the photo gallery
                }
            });
        } else {
            //cancel was tapped
            //user opted not to choose a photo
        }
    });
    dialog.show();
}


$.index.open();