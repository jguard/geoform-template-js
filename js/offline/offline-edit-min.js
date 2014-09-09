define(["dojo/Evented","dojo/_base/Deferred","dojo/promise/all","dojo/_base/declare","dojo/_base/array","dojo/dom-attr","dojo/dom-style","dojo/query","esri/config","esri/layers/GraphicsLayer","esri/graphic","esri/symbols/SimpleMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/urlUtils"],function(a,b,c,d,e,f,g,h,i,j,k,l,m,n){"use strict";return d("O.esri.Edit.OfflineFeaturesManager",[a],{_onlineStatus:"online",_featureLayers:{},_editStore:new O.esri.Edit.EditStore(k),ONLINE:"online",OFFLINE:"offline",RECONNECTING:"reconnecting",attachmentsStore:null,events:{EDITS_SENT:"edits-sent",EDITS_ENQUEUED:"edits-enqueued",ALL_EDITS_SENT:"all-edits-sent",ATTACHMENT_ENQUEUED:"attachment-enqueued",ATTACHMENTS_SENT:"attachments-sent"},initAttachments:function(a){if(a=a||function(a){},!this._checkFileAPIs())return a(!1,"File APIs not supported");try{if(this.attachmentsStore=new O.esri.Edit.AttachmentsStore,!this.attachmentsStore.isSupported())return a(!1,"indexedDB not supported");this.attachmentsStore.init(a)}catch(b){}},_checkFileAPIs:function(){return window.File&&window.FileReader&&window.FileList&&window.Blob?(XMLHttpRequest.prototype.sendAsBinary||(XMLHttpRequest.prototype.sendAsBinary=function(a){function b(a){return 255&a.charCodeAt(0)}var c=Array.prototype.map.call(a,b),d=new Uint8Array(c);this.send(d.buffer)}),!0):!1},_extendAjaxReq:function(a){a.sendAsBinary=XMLHttpRequest.prototype.sendAsBinary},extend:function(a){function d(){try{a._phantomLayer=new j({opacity:.8}),a._map.addLayer(a._phantomLayer)}catch(b){}}var i=this;this._featureLayers[a.url]=a,a._applyEdits=a.applyEdits,a._addAttachment=a.addAttachment,a._queryAttachmentInfos=a.queryAttachmentInfos,a._deleteAttachments=a.deleteAttachments,a.queryAttachmentInfos=function(a,c,d){if(i.getOnlineStatus()===i.ONLINE){var e=this._queryAttachmentInfos(a,function(){i.emit(i.events.ATTACHMENTS_INFO,arguments),c&&c.apply(this,arguments)},d);return e}if(i.attachmentsStore){var f=new b;return i.attachmentsStore.getAttachmentsByFeatureId(this.url,a,function(a){c&&c(a),f.resolve(a)}),f}},a.addAttachment=function(a,c,d,e){if(i.getOnlineStatus()===i.ONLINE)return this._addAttachment(a,c,function(){i.emit(i.events.ATTACHMENTS_SENT,arguments),d&&d.apply(this,arguments)},function(a){e&&e.apply(this,arguments)});if(i.attachmentsStore){var f=this._getFilesFromForm(c),g=f[0],j=new b,k=this._getNextTempId();return i.attachmentsStore.store(this.url,k,a,g,function(b,c){var f={attachmentId:k,objectId:a,success:b};if(b){i.emit(i.events.ATTACHMENT_ENQUEUED,f),d&&d(f),j.resolve(f);var g=this._url.path+"/"+a+"/attachments/"+k,l=h("[href="+g+"]");l.attr("href",c.url)}else f.error="can't store attachment",e&&e(f),j.reject(f)}.bind(this)),j}},a.deleteAttachments=function(a,d,e,f){if(i.getOnlineStatus()===i.ONLINE){var g=this._deleteAttachments(a,d,function(){e&&e.apply(this,arguments)},function(a){f&&f.apply(this,arguments)});return g}if(i.attachmentsStore){var h=[];d.forEach(function(c){c=parseInt(c,10);var d=new b;i.attachmentsStore.delete(c,function(b){var e={objectId:a,attachmentId:c,success:b};d.resolve(e)}),h.push(d)},this);var j=c(h);return j.then(function(a){e&&e(a)}),j}},a.applyEdits=function(a,c,d,e,h){if(i.getOnlineStatus()===i.ONLINE){var j=this._applyEdits(a,c,d,function(){i.emit(i.events.EDITS_SENT,arguments),e&&e.apply(this,arguments)},h);return j}var l=new b,m={addResults:[],updateResults:[],deleteResults:[]},n={};return this.onBeforeApplyEdits(a,c,d),a=a||[],a.forEach(function(a){var b=this._getNextTempId();a.attributes[this.objectIdField]=b;var c=i._editStore.pushEdit(i._editStore.ADD,this.url,a);if(m.addResults.push({success:c.success,error:c.error,objectId:b}),c.success){var d=new k(a.geometry,i._getPhantomSymbol(a.geometry,i._editStore.ADD),{objectId:b});this._phantomLayer.add(d),f.set(d.getNode(),"stroke-dasharray","10,4"),g.set(d.getNode(),"pointer-events","none")}},this),c=c||[],c.forEach(function(a){var b=a.attributes[this.objectIdField],c=i._editStore.pushEdit(i._editStore.UPDATE,this.url,a);if(m.updateResults.push({success:c.success,error:c.error,objectId:b}),n[b]=a,c.success){var d=new k(a.geometry,i._getPhantomSymbol(a.geometry,i._editStore.UPDATE),{objectId:b});this._phantomLayer.add(d),f.set(d.getNode(),"stroke-dasharray","5,2"),g.set(d.getNode(),"pointer-events","none")}},this),d=d||[],d.forEach(function(a){var b=a.attributes[this.objectIdField],c=i._editStore.pushEdit(i._editStore.DELETE,this.url,a);if(m.deleteResults.push({success:c.success,error:c.error,objectId:b}),c.success){var d=new k(a.geometry,i._getPhantomSymbol(a.geometry,i._editStore.DELETE),{objectId:b});this._phantomLayer.add(d),f.set(d.getNode(),"stroke-dasharray","4,4"),g.set(d.getNode(),"pointer-events","none")}i.attachmentsStore&&i.attachmentsStore.deleteAttachmentsByFeatureId(this.url,b,function(a){})},this),setTimeout(function(){this._editHandler(m,a,n,e,h,l),i.emit(i.events.EDITS_ENQUEUED,m)}.bind(this),0),l},a.convertGraphicLayerToJSON=function(a,b,c){var d={};d.objectIdFieldName=b.target.objectIdField,d.globalIdFieldName=b.target.globalIdField,d.geometryType=b.target.geometryType,d.spatialReference=b.target.spatialReference,d.fields=b.target.fields;for(var e=a.length,f=[],g=0;e>g;g++){var h=a[g].toJson();if(f.push(h),g==e-1){var i=JSON.stringify(f),j=JSON.stringify(d);c(i,j);break}}},a.getFeatureDefinition=function(a,b,c,d){var e={layerDefinition:a,featureSet:{features:b,geometryType:c}};d(e)},a._getFilesFromForm=function(a){var b=[],c=e.filter(a.elements,function(a){return"file"===a.type});return c.forEach(function(a){b.push.apply(b,a.files)},this),b},a._replaceFeatureIds=function(a,b,c){a.length||c(0);var d,e=a.length,f=e,g=0;for(d=0;e>d;d++)i.attachmentsStore.replaceFeatureId(this.url,a[d],b[d],function(a){--f,g+=a?1:0,0===f&&c(g)}.bind(this))},a._nextTempId=-1,a._getNextTempId=function(){return this._nextTempId--},d()},goOffline:function(){this._onlineStatus=this.OFFLINE},goOnline:function(a){this._onlineStatus=this.RECONNECTING,this._replayStoredEdits(function(b,c){var d={features:{success:b,responses:c}};null!=this.attachmentsStore?this._sendStoredAttachments(function(b,c){this._onlineStatus=this.ONLINE,d.attachments={success:b,responses:c},a&&a(d)}.bind(this)):(this._onlineStatus=this.ONLINE,a&&a(d))}.bind(this))},getOnlineStatus:function(){return this._onlineStatus},getReadableEdit:function(a){var b=this._featureLayers[a.layer],c=this._editStore._deserialize(a.graphic),d=c.geometry.type,e=a.layer.substring(a.layer.lastIndexOf("/")+1);return b&&(d+=" [id="+c.attributes[b.objectIdField]+"]"),"o:"+a.operation+", l:"+e+", g:"+d},_phantomSymbols:[],_getPhantomSymbol:function(a,b){if(0===this._phantomSymbols.length){var c=[0,255,0,255],d=1.5;this._phantomSymbols.point=[],this._phantomSymbols.point[this._editStore.ADD]=new l({type:"esriSMS",style:"esriSMSCross",xoffset:10,yoffset:10,color:[255,255,255,0],size:15,outline:{color:c,width:d,type:"esriSLS",style:"esriSLSSolid"}}),this._phantomSymbols.point[this._editStore.UPDATE]=new l({type:"esriSMS",style:"esriSMSCircle",xoffset:0,yoffset:0,color:[255,255,255,0],size:15,outline:{color:c,width:d,type:"esriSLS",style:"esriSLSSolid"}}),this._phantomSymbols.point[this._editStore.DELETE]=new l({type:"esriSMS",style:"esriSMSX",xoffset:0,yoffset:0,color:[255,255,255,0],size:15,outline:{color:c,width:d,type:"esriSLS",style:"esriSLSSolid"}}),this._phantomSymbols.multipoint=null,this._phantomSymbols.polyline=[],this._phantomSymbols.polyline[this._editStore.ADD]=new m({type:"esriSLS",style:"esriSLSSolid",color:c,width:d}),this._phantomSymbols.polyline[this._editStore.UPDATE]=new m({type:"esriSLS",style:"esriSLSSolid",color:c,width:d}),this._phantomSymbols.polyline[this._editStore.DELETE]=new m({type:"esriSLS",style:"esriSLSSolid",color:c,width:d}),this._phantomSymbols.polygon=[],this._phantomSymbols.polygon[this._editStore.ADD]=new n({type:"esriSFS",style:"esriSFSSolid",color:[255,255,255,0],outline:{type:"esriSLS",style:"esriSLSSolid",color:c,width:d}}),this._phantomSymbols.polygon[this._editStore.UPDATE]=new n({type:"esriSFS",style:"esriSFSSolid",color:[255,255,255,0],outline:{type:"esriSLS",style:"esriSLSDash",color:c,width:d}}),this._phantomSymbols.polygon[this._editStore.DELETE]=new n({type:"esriSFS",style:"esriSFSSolid",color:[255,255,255,0],outline:{type:"esriSLS",style:"esriSLSDot",color:c,width:d}})}return this._phantomSymbols[a.type][b]},_fieldSegment:function(a,b){return'Content-Disposition: form-data; name="'+a+'"\r\n\r\n'+b+"\r\n"},_fileSegment:function(a,b,c,d){return'Content-Disposition: form-data; name="'+a+'"; filename="'+b+'"\r\nContent-Type: '+c+"\r\n\r\n"+d+"\r\n"},_uploadAttachment:function(a){var c=new b,d=[];d.push(this._fieldSegment("f","json")),d.push(this._fileSegment("attachment",a.name,a.contentType,a.content));var e=new XMLHttpRequest;e.sendAsBinary||this._extendAjaxReq(e),e.onload=function(a){c.resolve(JSON.parse(a.target.response))},e.onerror=function(a){c.reject(a)};var f=i.defaults.io.proxyUrl||"";""!==f&&(f+="?"),e.open("post",f+a.featureId+"/addAttachment",!0);var g="---------------------------"+Date.now().toString(16);return e.setRequestHeader("Content-Type","multipart/form-data; boundary="+g),e.sendAsBinary("--"+g+"\r\n"+d.join("--"+g+"\r\n")+"--"+g+"--\r\n"),c},_deleteAttachment:function(a,c){var d=new b;return this.attachmentsStore.delete(a,function(a){d.resolve(c)}),d},_sendStoredAttachments:function(a){this.attachmentsStore.getAllAttachments(function(b){var d=[];b.forEach(function(a){var b=this._uploadAttachment(a).then(function(b){return b.addAttachmentResult&&b.addAttachmentResult.success===!0?this._deleteAttachment(a.id,b):null}.bind(this),function(){});d.push(b)},this);var e=c(d);e.then(function(b){a&&a(!0,b)},function(b){a&&a(!1,b)})}.bind(this))},_optimizeEditsQueue:function(){for(var a,b,c,d,e={},f=(this._editStore.pendingEditsCount(),0);this._editStore.hasPendingEdits();){if(a=this._editStore.popFirstEdit(),b=this._featureLayers[a.layer],a.layer in e||(e[a.layer]={}),c=e[a.layer],d=a.graphic.attributes[b.objectIdField],d in c)switch(a.operation){case this._editStore.ADD:throw"can't add the same feature twice!";case this._editStore.UPDATE:c[d].graphic=a.graphic;break;case this._editStore.DELETE:0>d?(delete c[d],f-=1):c[d].operation=this._editStore.DELETE}else c[d]=a,f+=1;0===Object.keys(c).length&&delete e[a.layer]}return e},_replayStoredEdits:function(a){if(this._editStore.hasPendingEdits()){var d=this._optimizeEditsQueue(),e={};if(0===Object.keys(d).length)return this.emit(this.events.ALL_EDITS_SENT),void(a&&a(!0,{}));var f,g,h,i,j,k,l,m,n,o,p;for(f in d)if(d.hasOwnProperty(f)){if(g=this._featureLayers[f],null==this.attachmentsStore&&g.hasAttachments)throw new Error("OfflineFeaturesManager: Attachments aren't initialized.");g._attachmentsStore=this.attachmentsStore,h=d[f],g.__onEditsComplete=g.onEditsComplete,g.onEditsComplete=function(){},g.__onBeforeApplyEdits=g.onBeforeApplyEdits,g.onBeforeApplyEdits=function(){},i=[],j=[],k=[],l=[];for(m in h)if(h.hasOwnProperty(m))switch(n=h[m],n.operation){case this._editStore.ADD:for(o=0;o<g.graphics.length;o++)if(p=g.graphics[o],p.attributes[g.objectIdField]===n.graphic.attributes[g.objectIdField]){g.remove(p);break}l.push(n.graphic.attributes[g.objectIdField]),delete n.graphic.attributes[g.objectIdField],i.push(n.graphic);break;case this._editStore.UPDATE:j.push(n.graphic);break;case this._editStore.DELETE:k.push(n.graphic)}e[f]=function(a,c){var d=new b;return a._applyEdits(i,j,k,function(b,e,f){a._phantomLayer.clear(),a.onEditsComplete=a.__onEditsComplete,delete a.__onEditsComplete,a.onBeforeApplyEdits=a.__onBeforeApplyEdits,delete a.__onBeforeApplyEdits;var g=b.map(function(a){return a.objectId});null!=a._attachmentsStore&&a.hasAttachments&&c.length>0?a._replaceFeatureIds(c,g,function(){d.resolve({addResults:b,updateResults:e,deleteResults:f})}):d.resolve({addResults:b,updateResults:e,deleteResults:f})},function(b){a.onEditsComplete=a.__onEditsComplete,delete a.__onEditsComplete,a.onBeforeApplyEdits=a.__onBeforeApplyEdits,delete a.__onBeforeApplyEdits,d.reject(b)}),d}(g,l)}var q=c(e);q.then(function(b){this.emit(this.events.EDITS_SENT),this.emit(this.events.ALL_EDITS_SENT),a&&a(!0,b)}.bind(this),function(b){a&&a(!1,b)}.bind(this))}else this.emit(this.events.ALL_EDITS_SENT),a&&a(!0,{})}})}),"undefined"!=typeof O?O.esri.Edit={}:(O={},O.esri={Edit:{}}),O.esri.Edit.EditStore=function(a){var b="esriEditsQueue",c="|@|";this.ADD="add",this.UPDATE="update",this.DELETE="delete",this.ERROR_LOCALSTORAGE_FULL="LocalStorage capacity exceeded",this.isSupported=function(){var a="esriLocalStorageTest";try{return window.localStorage.setItem(a,a),window.localStorage.removeItem(a),!0}catch(b){return!1}},this.pushEdit=function(a,b,c){var d={operation:a,layer:b,graphic:this._serialize(c)},e=this.retrieveEditsQueue();e.push(d);var f=this._storeEditsQueue(e);return{success:f,error:f?void 0:{code:1e3,description:this.ERROR_LOCALSTORAGE_FULL}}},this.peekFirstEdit=function(){var a,b=this.retrieveEditsQueue();return b?(a=b[0],a.graphic=this._deserialize(a.graphic),a):null},this.popFirstEdit=function(){var a,b=this.retrieveEditsQueue();return b?(a=b.shift(),this._storeEditsQueue(b),a.graphic=this._deserialize(a.graphic),a):null},this.hasPendingEdits=function(){var a=window.localStorage.getItem(b)||"";return""!==a},this.pendingEditsCount=function(){var a=window.localStorage.getItem(b)||"";if(""===a)return 0;var c=this._unpackArrayOfEdits(a);return c.length},this.resetEditsQueue=function(){window.localStorage.setItem(b,"")},this.retrieveEditsQueue=function(){var a=window.localStorage.getItem(b)||"";return this._unpackArrayOfEdits(a)},this.getEditsStoreSizeBytes=function(){var a=window.localStorage.getItem(b);return a?b.length+a.length:0},this.getLocalStorageSizeBytes=function(){var a,b,c=0;for(a in window.localStorage)window.localStorage.hasOwnProperty(a)&&(b=window.localStorage.getItem(a),c+=a.length+b.length);return c},this._serialize=function(a){var b=a.toJson(),c={attributes:b.attributes,geometry:b.geometry};return JSON.stringify(c)},this._deserialize=function(b){var c=new a(JSON.parse(b));return c},this._storeEditsQueue=function(a){try{var c=this._packArrayOfEdits(a);return window.localStorage.setItem(b,c),!0}catch(d){return!1}},this._packArrayOfEdits=function(a){var b=[];return a.forEach(function(a){b.push(JSON.stringify(a))}),b.join(c)},this._unpackArrayOfEdits=function(a){if(!a)return[];var b=[];return a.split(c).forEach(function(a){b.push(JSON.parse(a))}),b},this._isEditDuplicated=function(a,b){var c,d;for(c=0;c<b.length;c++)if(d=b[c],d.operation===a.operation&&d.layer===a.layer&&d.graphic===a.graphic)return!0;return!1}},O.esri.Edit.AttachmentsStore=function(){this._db=null;var a="attachments_store",b="attachments";this.isSupported=function(){return window.indexedDB?!0:!1},this.store=function(a,c,d,e,f){try{this._readFile(e,function(g){var h={id:c,objectId:d,featureId:a+"/"+d,contentType:e.type,name:e.name,size:e.size,url:this._createLocalURL(e),content:g},i=this._db.transaction([b],"readwrite");i.oncomplete=function(){f(!0,h)},i.onerror=function(a){f(!1,a.target.error.message)};var j=i.objectStore(b),k=j.put(h);k.onsuccess=function(){}}.bind(this))}catch(g){f(!1,g.stack)}},this.retrieve=function(a,c){var d=this._db.transaction([b]).objectStore(b),e=d.get(a);e.onsuccess=function(a){var b=a.target.result;b?c(!0,b):c(!1,"not found")},e.onerror=function(a){c(!1,a)}},this.getAttachmentsByFeatureId=function(a,c,d){var e=a+"/"+c,f=[],g=this._db.transaction([b]).objectStore(b),h=g.index("featureId"),i=IDBKeyRange.only(e);h.openCursor(i).onsuccess=function(a){var b=a.target.result;b?(f.push(b.value),b.continue()):d(f)}},this.getAttachmentsByFeatureLayer=function(a,c){var d=[],e=this._db.transaction([b]).objectStore(b),f=e.index("featureId"),g=IDBKeyRange.bound(a+"/",a+"/A");f.openCursor(g).onsuccess=function(a){var b=a.target.result;b?(d.push(b.value),b.continue()):c(d)}},this.getAllAttachments=function(a){var c=[],d=this._db.transaction([b]).objectStore(b);d.openCursor().onsuccess=function(b){var d=b.target.result;d?(c.push(d.value),d.continue()):a(c)}},this.deleteAttachmentsByFeatureId=function(a,c,d){var e=a+"/"+c,f=this._db.transaction([b],"readwrite").objectStore(b),g=f.index("featureId"),h=IDBKeyRange.only(e),i=0;g.openCursor(h).onsuccess=function(a){var b=a.target.result;if(b){var c=b.value;this._revokeLocalURL(c),f.delete(b.primaryKey),i++,b.continue()}else setTimeout(function(){d(i)},0)}.bind(this)},this.delete=function(a,c){this.retrieve(a,function(d,e){if(!d)return void c(!1,"attachment "+a+" not found");this._revokeLocalURL(e);var f=this._db.transaction([b],"readwrite").objectStore(b).delete(a);f.onsuccess=function(){setTimeout(function(){c(!0)},0)},f.onerror=function(a){c(!1,a)}}.bind(this))},this.deleteAll=function(a){this.getAllAttachments(function(c){c.forEach(function(a){this._revokeLocalURL(a)},this);var d=this._db.transaction([b],"readwrite").objectStore(b).clear();d.onsuccess=function(){setTimeout(function(){a(!0)},0)},d.onerror=function(b){a(!1,b)}}.bind(this))},this.replaceFeatureId=function(a,c,d,e){var f=a+"/"+c,g=this._db.transaction([b],"readwrite").objectStore(b),h=g.index("featureId"),i=IDBKeyRange.only(f),j=0;h.openCursor(i).onsuccess=function(b){var c=b.target.result;if(c){var f=a+"/"+d,h=c.value;h.featureId=f,h.objectId=d,g.put(h),j++,c.continue()}else setTimeout(function(){e(j)},1)}},this.getUsage=function(a){var c={sizeBytes:0,attachmentCount:0},d=this._db.transaction([b]).objectStore(b).openCursor();d.onsuccess=function(b){var d=b.target.result;if(d){var e=d.value,f=JSON.stringify(e);c.sizeBytes+=f.length,c.attachmentCount+=1,d.continue()}else a(c,null)}.bind(this),d.onerror=function(b){a(null,b)}},this._readFile=function(a,b){var c=new FileReader;c.onload=function(a){b(a.target.result)},c.readAsBinaryString(a)},this._createLocalURL=function(a){return window.URL.createObjectURL(a)},this._revokeLocalURL=function(a){window.URL.revokeObjectURL(a.url)},this.init=function(c){var d=indexedDB.open(a,11);c=c||function(a){}.bind(this),d.onerror=function(a){c(!1,a.target.errorCode)}.bind(this),d.onupgradeneeded=function(a){var c=a.target.result;c.objectStoreNames.contains(b)&&c.deleteObjectStore(b);var d=c.createObjectStore(b,{keyPath:"id"});d.createIndex("featureId","featureId",{unique:!1})}.bind(this),d.onsuccess=function(a){this._db=a.target.result,c(!0)}.bind(this)}};