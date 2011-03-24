(function(T, default_image){
  default_image = default_image || {
    content:"iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADNQTFRFx+H5rNL2vtv40eb64/D87PX9mcf0frjxo8z19vr+kMLzdLPwh73ytdb3a67v2uv7////DFkSyQAAAJ1JREFUeNpMjwmKxTAMQ9023tf7n/YnLQNjYnBekCPBnNK+s/Ud4VylnKNK9APLM25LosvXAcudeCyxxB03sAujjCOK1GQAS4exQ/qh6VJ4bJRnS2Z8n4aMFM5k230lb0B9Rx9JB3Q0QMzUJ6lXgoWzOduzn87SMcHYTowq1vl2Vrm4Wqrf9RobcIm0vIg+6zMoVf/DvfHzL/5PgAEABToLXXm2DMMAAAAASUVORK5CYII=",
    mime: "image/png"
  };
  
  function cacheSupported() {
    var supported = false;
    try {
        supported = 'localStorage' in window && window['localStorage'] !== null && 'btoa' in window && 'JSON' in window;
    } catch (ex) {}
    
    return supported;
  }
    
  function createDataString(img) {
    img = img || default_image;
    return ["data:",img.mime,";base64,",img.content].join("");
  }
  

  
  function checkCache(src) {
    var key = encodeURIComponent(src),
        img = localStorage.getItem(key);
        
    if(img) { img = JSON.parse(img); }
    else { img = null; }
        
    return img;
  }
  
  function data_string(data) { // Generates the binary data string from character / multibyte data
      var data_string='';
      for(var i=0,il=data.length;i<il;i++) {data_string+=String.fromCharCode(data[i].charCodeAt(0)&0xff);}
      return data_string;
  }
  
  function fetchImage(src, img, nocache) {
    nocache = nocache || false;
    ajax_request(src,img,nocache)    
  }
  
  function ajax_request(src, img, nocache) {
    var xhr;
    try { xhr= new XMLHttpRequest();} 
     catch (e) { try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } 
      catch (e) {return false;}
    }
     xhr.overrideMimeType('text/plain; charset=x-user-defined');
     xhr.open("GET", src);
     xhr.onreadystatechange = function() {
      if(xhr.readyState != 4) { return; }
      if(xhr.status==200) { ajax_success(xhr, src, img, nocache); }
      else { img.setAttribute("src", createDataString(default_image)); }
      return true;
     };
     xhr.send(null);
  }
  
  function ajax_success(xhr, src, img, nocache) {
    var data = xhr.responseText;
    var img_obj = {
      content: btoa(data_string(data)),
      mime: xhr.getResponseHeader("Content-Type") || "image/png"
    }
    var key = encodeURIComponent(src);
    if(!nocache) { 
      val = JSON.stringify(img_obj); 
      //console.log(key +" " + val.length); 
      localStorage.setItem(key, val); 
    }
    img.setAttribute("src", createDataString(img_obj));
  
  }

  T.extend("cimg", function(attributes, content) {
    var args = Array.prototype.slice.call(arguments);
    var go_get = false;
    
    if(cacheSupported()) { 
      var attributes = {};
      if (args[0].toString() === "[object Object]") { // if the first arg is an object, its attributes
        attributes = args.shift();
      }

      var src = attributes.src || null;
      var cache_img = (!attributes.nocache && src && checkCache(src)) || null;
      
      go_get = (!cache_img && src);
      
      attributes.src = createDataString(cache_img);
      args.unshift(attributes);
      
    } // no caching here, so just return src and move along
    
    var img = this.img.apply(this, args);
    
    if(go_get) {
      fetchImage(go_get, img, attributes.nocache);
    }
    
    return img;
    
  }, true);
})(newT);