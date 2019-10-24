var Alloy = require('/alloy'),
Backbone = Alloy.Backbone,
_ = Alloy._;




function __processArg(obj, key) {
  var arg = null;
  if (obj) {
    arg = obj[key] || null;
  }
  return arg;
}

function Controller() {

  require('/alloy/controllers/' + 'BaseController').apply(this, Array.prototype.slice.call(arguments));
  this.__controllerPath = 'index';
  this.args = arguments[0] || {};

  if (arguments[0]) {
    var __parentSymbol = __processArg(arguments[0], '__parentSymbol');
    var $model = __processArg(arguments[0], '$model');
    var __itemTemplate = __processArg(arguments[0], '__itemTemplate');
  }
  var $ = this;
  var exports = {};
  var __defers = {};

  // Generated code that must be executed before all UI and/or
  // controller code. One example is all model and collection
  // declarations from markup.


  // Generated UI code
  $.__views.index = Ti.UI.createWindow(
  { backgroundColor: "#ffffff", theme: "Theme.AppCompat.Translucent.NoTitleBar.Fullscreen", exitOnClose: true, id: "index" });

  $.__views.index && $.addTopLevelView($.__views.index);
  $.__views.celdaFotos = Ti.UI.createView(
  { top: "60dp", bottom: 0, id: "celdaFotos" });

  $.__views.index.add($.__views.celdaFotos);
  $.__views.topCredencial = Ti.UI.createView(
  { top: 0, height: "50%", width: Ti.UI.FILL, id: "topCredencial" });

  $.__views.celdaFotos.add($.__views.topCredencial);
  $.__views.frontal = Ti.UI.createView(
  { borderRadius: "30dp", height: "90%", width: Ti.UI.FILL, borderColor: "#B9CFE2", touchEnabled: false, id: "frontal" });

  $.__views.topCredencial.add($.__views.frontal);
  $.__views.bottomCredencial = Ti.UI.createView(
  { bottom: 0, height: "50%", width: Ti.UI.FILL, id: "bottomCredencial" });

  $.__views.celdaFotos.add($.__views.bottomCredencial);
  $.__views.reverso = Ti.UI.createView(
  { borderRadius: "30dp", height: "90%", width: Ti.UI.FILL, borderColor: "#B9CFE2", touchEnabled: false, id: "reverso" });

  $.__views.bottomCredencial.add($.__views.reverso);
  exports.destroy = function () {};

  // make all IDed elements in $.__views available right on the $ in a
  // controller's internal code. Externally the IDed elements will
  // be accessed with getView().
  _.extend($, $.__views);

  // Controller code directly from the developer's controller file
  var imagenFrontal = Ti.UI.createImageView({
    width: "100%",
    height: "100%",
    autorotate: true });



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

  function openCameraf() {
    $.frontal.add(imagenFrontal);
    var dialog = Titanium.UI.createOptionDialog({
      title: 'Seleccion el Tipo de Imagen',
      options: ['Camara', 'Galeria de Fotos', 'Cancelar'],
      cancel: 2 });

    dialog.addEventListener('click', function (e) {
      if (e.index == 0) {
        Titanium.Media.showCamera({
          success: function (e) {
            image = e.media;
            if (e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
              imagenFrontal.image = image;
              var url = 'https://www.ideashappy.com/ahorra/otro.php';
              //var url = "http://www.mark-43.net/mark43-service/v1/api-drive/subir-imagen"
              var xhr = Titanium.Network.createHTTPClient({
                onload: function (e) {
                  Ti.API.info('Info received from the uploading: ' + this.responseText);
                  // var json = JSON.parse(this.responseText);
                  // console.log("JSON = ", json);
                },
                onerror: function (e) {
                  console.log("Error", e);
                },
                timeout: 200000 });


              var params = {
                myfile: e.media };

              var alerta = JSON.stringify(e.media);
              alert(alerta);
              xhr.open("POST", url);
              xhr.setRequestHeader('Content-Type', 'multipart/form-data');
              xhr.send(alerta);
              //console.log("Paramatros =", params);
            }
          },
          cancel: function () {},
          error: function (error) {
            var a = Titanium.UI.createAlertDialog({
              title: 'Camera' });

            if (error.code == Titanium.Media.NO_CAMERA) {
              a.setMessage('Device does not have camera');
            } else {
              a.setMessage('Unexpected error: ' + error.code);
            }
            a.show();
          },
          allowImageEditing: true,
          saveToPhotoGallery: true });

      } else if (e.index == 1) {
        Titanium.Media.openPhotoGallery({
          success: function (e) {
            image = e.media;
            if (e.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
              imagenFrontal.image = image;
              var url = 'https://www.ideashappy.com/ahorra/otro.php';
              //var url = "http://www.mark-43.net/mark43-service/v1/api-drive/subir-imagen"
              var xhr = Titanium.Network.createHTTPClient({
                onload: function (e) {
                  console.log('url ', url);
                  console.log('Info received from the uploading: ' + this.responseText);
                  console.log("parametro = ", alerta);
                  // var json = JSON.parse(this.responseText);
                  // console.log("JSON = ", json);
                },
                onerror: function (e) {
                  console.log("Error", e);
                },
                timeout: 200000 });


              var params = {
                myfile: e.media };

              var alerta = JSON.stringify(params);
              //alert(alerta);
              xhr.open("POST", url);
              xhr.setRequestHeader('Content-Type', 'multipart/form-data');
              xhr.send(alerta);
              console.log("ALERTA = ", alerta);

            }
          },
          cancel: function () {
            //user cancelled the action fron within
            //the photo gallery
          } });

      } else {
        //cancel was tapped
        //user opted not to choose a photo
      }
    });
    dialog.show();
  }


  var imagenReverso = Ti.UI.createImageView({
    width: "100%",
    height: "100%",
    autorotate: true });


  $.bottomCredencial.addEventListener('click', function (e) {
    if (Ti.Media.hasCameraPermissions()) {
      openCamerar();
    } else {
      Ti.Media.requestCameraPermissions(function (e) {
        if (e.success) {
          openCamerar();
        } else {
          alert('You denied permission');
        }
      });
    }
  });


  function openCamerar() {
    $.bottomCredencial.add(imagenReverso);
    Ti.Media.showCamera({
      success: function (e) {
        // display image information:
        console.log(e.media);
        imagenReverso.image = e.media;
      } });

  }


  $.index.open();

  // Generated code that must be executed after all UI and
  // controller code. One example deferred event handlers whose
  // functions are not defined until after the controller code
  // is executed.


  // Extend the $ instance with all functions and properties
  // defined on the exports object.
  _.extend($, exports);
}

module.exports = Controller;
//# sourceMappingURL=file:///Users/user001/Documents/Appcelerator_Studio_Workspace/ocr/build/map/Resources/android/alloy/controllers/index.js.map