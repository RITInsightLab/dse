/**
 * jquery.jMovie.js (15kb)
 * 
 * @author Kevin Addison
 * @version 3.0 (05/11/12)
 * @requires jquery v1.3 or later
 *
 *
 *
 * Browsers:
 * 
 * Firefox: v3.x.x or higher (PC and Mac)
 * Opera: v9.6 or higher
 * Chrome: v1.0.154.53 or higher
 * Safari: v3.2.1 or higher
 * IE: v7, v8
 *
 *
 * 
 * Usage:
 * 
 * <style type="text/css">@import url('/path/to/jMovie/css/jMovie.style.css');</style>
 * <script type="text/javascript" src="/path/to/jquery/">
 * <script type="text/javascript" src="/path/to/jMovie/js/jquery.jMovie.js"></script>
 * <script type="text/javascript">
 * $(function() {
 * 	$('div#player').jMovie({
 *		autoupdate: autoupdateval,
 *		dataset: '/<?php echo $this->dataset; ?>',
 *		dataPath: '/assets/data',
 *		serverPath: '/viewing/getnextimages',
 *		jsPath: '/assets/js/jMovie',
 *		controlpanel: 1,
 *		buttons: ['playpause','step','divider','trackbar'],
 *		labelpanel: 1,
 *		labels: ['speedlabel','playlabel'],
 *		width: 854,
 *		height: 480,
 *		skin: 'silver',
 *		urls: images
 *        });
 * });
 * </script>
 *
 * <body>
 * <div id="player"></div>
 * </body>
 * 
 */
(function($) {
    $.fn.jMovie = function(options) {
        
	/**
	 * default settings for plugin
	 */
	var defaults = {
	    /**
             * default setting for autoupdate
             */
            autoupdate: 0,
            
            /**
             * default setting for dataset
             */
            dataset: null,
            
            /**
             * default setting for the dataset path
             */
            dataPath: null,
            
            /**
             * default setting for the serverPath
             */
            serverPath: null,
            
            /**
	     * skin is the style for the control panel and buttons
	     * there are 2 skin modes: black and silver
	     */
	    skin: 'silver',
	    
	    /**
	     * default color settings for label text
	     */
	    label: '#1A1A1A',
	    
	    /**
	     * default color settings for status text
	     */
	    status: '#F2F2F2',
	    
	    /**
	     * default setting for player width
	     */
	    width: 1024,
	    
	    /**
	     * default setting for player height
	     */
            height: 512,
	    
            /**
             * default path for javascript package
             */
	    jsPath: '/assets/js/jMovie',
	    
	    json:0,
	    
	    params: null,
            
            /**
             * default setting for control label
             */
            controlpanel: 1,
            
            /**
             * default elements for the player in order
             */
            buttons: ['playpause','step','swing','divider','fast','slow','divider','trackbar'],
            
            /**
             * default setting for the label panel
             */
            labelpanel: 1,
            
            /**
             * default labels for the label panel
             */
            labels: ['speedlabel','swinglabel','playlabel'],
	    
	    /**
	     * array to hold urls for images
	     */
            urls: []
	    
        },
        settings = $.extend({}, defaults, options);
        
	/**
	 * for each instance of the plugin, do the following...
	 */
        this.each(function() {
	    var $this = $(this);
	    var inc = 1.50;
            var delay = 250;
	    var num_loaded_images = 0;
	    var frame = -1;
            var speed = 16;
            var timeout_id = null;
            var dir = 1;
            var playing = 0;
            var swingon = 0;
	    var index = 0;
            var imgQueue = settings.urls;
	    var images = [];
	    var imageSum = settings.urls.length;
            var cntrlpnl = settings.controlpanel;
            var btns = settings.buttons;
            var lblpnl = settings.labelpanel;
            var lbls = settings.labels;
            var jspath = settings.jsPath;
            var dpath = settings.dataPath;
            var spath = settings.serverPath;
	    var json = settings.json;
            var dataset = settings.dataset;
            var autoupdate = settings.autoupdate;
	    var trackValue = 0;
	    var params = settings.params;
            
	    /**
	     * sets the width and height properties for the screen div
	     * defaults to 512 x 512 px
	     */
            var screen = function() {
                html = $('<div />').attr('id','screen').css({
                            'width' : settings.width+'px',
                            'height' : settings.height+'px'
                        });
                return html;
            };
	    
	    /**
	     * sets the width and height properties for the load div
	     * defaults to 512 x 512 px
	     */
	    var load = function() {
                html = $('<div />').attr('id','load').css({
                            'width' : settings.width+'px',
                            'height' : settings.height+'px'    
                        });
                return html;
            };
	    
	    /**
	     * sets the width and height properties for the animation div
	     * defaults to 512 x 512 px
	     */
	    var animation = function() {
                html = $('<div />').attr('id','animation').css({
                            'width' : settings.width+'px',
                            'height' : settings.height+'px'
                        });
                return html;
            };
	    
	    /**
	     * control panel settings
	     */
            var controlpanel = function() {
                html = $('<div />').attr('id','controlpanel').css({
                            'width' : settings.width+'px',
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_controlpanel.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'repeat-x'
                        });
                return html;
            };
            
            /**
             * control buttons wrapper settings
             */
            var controlbuttons = function() {
                html = $('<div />').attr('id','controlbuttons');
                return html;
            };
	    
	    /**
	     * play and pause button settings
	     */
            var playpause = function () {
                html = $('<div />').attr('id','playpause').css({
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_pause.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat',
                            'margin-left' : '0'
                        }).hover(function(e) {
                            if(playing == 0) {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_play_hover.png)'});
                            } else {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_pause_hover.png)'});
                            }
                        }, function() {
                            if(playing == 1) {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_pause.png)'});
                            } else {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_play.png)'});
                            }
                        }).click(function() {
                            if(playing == 0) {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_pause.png)'});
                                animate();
                            } else {
                                if(timeout_id) {
                                    clearTimeout(timeout_id);
                                }
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_play.png)'});
                                $('#playlabel').html('paused ');
                                timeout_id = null;
                                playing = 0;
                            }
                        });
                return html;
            };
	    
	    /**
	     * step button settings
	     */
            var step = function() {
                html = $('<div />').attr('id','step').css({
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_step.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat'
                        }).hover(function(e) {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_step_hover.png)'})
                        }, function() {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_step.png)'})
                        }).click(function() {
                            if(playing == 0) {
                                $('#animation').animate({opacity: 1},200);
                                stepframes();
                            } else {
                                $('#playpause').css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_play.png)'});
                                stepframes();		    
                            }
                        });
                return html;
            };
            
            /**
	     * reload button settings
	     */
            var reload = function() {
                html = $('<div />').attr('id','reload').css({
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_reload.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat'
                        }).hover(function(e) {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_reload_hover.png)'});
                        }, function() {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_reload.png)'});
                        }).click(function() {
                            sendAjaxRequest(spath,'POST','format=json&count='+images.length+'&dataset='+dataset,true,'handleImageUpdate');
                        });
                return html;
            };
	    
	    /**
	     * track bar settings
	     */
	    var trackbar = function() {
		div = $('<div />').attr('id','slider').css({'margin-top':'10px'})
			    .slider({
				min:1,
				max: imageSum,
				slide: function(e,i) {
				    trackValue = $(this).slider('value');
				    trackframes(i.value - 1);
				}
			    });
			    
		html = $('<div />').attr('id','trackbar')
				   .css({'width':'50%','height':'35px','float':'left','position':'relative'})
				   .append(div);
		
		return html;
	    };
            
	    /**
	     * fast button settings
	     */
            var fast = function() {
                html = $('<div />').attr('id','fast').css({
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_fast.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat'
                        }).hover(function(e) {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_fast_hover.png)'})
                        }, function() {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_fast.png)'})
                        }).click(function() {
                            speed *= inc;
                            show_speed();
                        });
                return html;
            };
	    
	    /**
	     * slow button settings
	     */
	    var slow = function() {
                html = $('<div />').attr('id','slow').css({
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_slow.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat'
                        }).hover(function(e) {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_slow_hover.png)'})
                        }, function() {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_slow.png)'})
                        }).click(function() {
                            speed /= inc;
                            show_speed();
                        });
                return html;
            };
	    
	    /**
	     * swing button settings
	     */
            var swing = function() {
                html = $('<div />').attr('id','swing').css({
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_swing.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat'
                        }).hover(function(e) {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_swing_hover.png)'})
                        }, function() {
                            $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_swing.png)'})
                        }).click(function() {
                            if(swingon == 1) {
                                swingon = 0;
				$('#swinglabel').html('swing: off');
                            } else {
                                swingon = 1;
				$('#swinglabel').html('swing: on');
                            }
                        });
                return html;
            };
	    
	    /**
	     * vertical spacer for buttons
	     */
	    var divider = function() {
                html = $('<div />').attr('class','divider').css({
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_divider.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat',
                            'width' : '2px',
                            'cursor' : 'default'
                        });
                return html;
            };
	    
	    /**
	     * direction button settings
	     */
            var direction = function() {
                html = $('<div />').attr('id','direction').css({
                            'width' : '84px',
                            'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_reverse.png)',
                            'background-position' : 'top left',
                            'background-repeat' : 'no-repeat'
                        }).hover(function(e) {
                            if(dir > 0) {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_reverse_hover.png)'})
                            } else if(dir < 0) {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_forward_hover.png)'})
                            }
                        }, function() {
                            if(dir > 0) {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_reverse.png)'})
                            } else if(dir < 0) {
                                $(this).css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_forward.png)'})
                            }
                        }).click(function() {
                            reverse();
                        });
                return html;
            };
            
            /**
             * creates controllable container
             */
            var controllabels = function() {
                html = $('<div />').attr('id','controllabels');
                return html;
            };
	    
            /**
	     * creates speed label
	     */
            var speedlabel = function() {
                div = $('<div />').attr('class','label');
                label = $('<span />').attr('id','speedlabel').css({'color':settings.label}).html('speed: ');
                html = div.append(label).append(status);
                return html;
            };
            
	    /**
	     * creates swing label
	     */
            var swinglabel = function() {
                div = $('<div />').attr('class','label');
                label = $('<span />').attr('id','swinglabel').css({'color':settings.label}).html('swing: off');
                html = div.append(label).append(status);
                return html;
            };
            
            /**
	     * creates play label
	     */
            var playlabel = function() {
                div = $('<div />').attr('class','label');
                label = $('<span />').attr('id','playlabel').css({'color':settings.label});
                html = div.append(label).append(status);
                return html;
            };
	    
	    
	    /**
	     * begin loading images into the browser's cache
	     */
	    var removeImage = function () {
		mySrc = this.src;
		for(var i = imageSum; i--;) {
		    if(images[i].src == mySrc) {
			images.splice( i, 1 );
			if (num_loaded_images <= --imageSum ) {
			    start_playing();
			};
			return;
		    }
		}
		return;
            };
            
            /**
             * start_playing()
             */
            function start_playing() {
                show_speed();
                animate();
            }
	    
            /**
	     * count_images()
	     * This method counts images as they are loaded into the browser's cache
	     */
            function count_images() {
                if (++num_loaded_images == imageSum) {
                    start_playing(); 
                } else {
                    $('.label #playlabel').html('Loading: ' + num_loaded_images+" of "+imageSum);
                }
            }
	    
            /**
             * handleError()
             * reduces the imageSum count if there is an error
             */
	    function handleError() {
		imageSum--;
	    }
	    
            /**
	     * animate()
	     * This method uses the timeout function and delay to load each image
	     */
            function animate() {
                $('div#animation').fadeIn('slow');
		var j;
                frame = (frame + dir + imageSum) % imageSum;
                j = frame+1;
                if(images[frame].complete) {
                    $('div#animation').html('<img id="'+frame+'" style="width:'+settings.width+'px;height:'+settings.height+'px" src="'+images[frame].src+'" />');
		    $('.label #playlabel').html('playing: '+j+' of '+imageSum);
                    $('#slider').slider('option','value',frame);
		    
                    if(swingon && (j == imageSum || frame == 0)) {
                        reverse();
                    }
                    
                    timeout_id = setTimeout(function() {
                        animate();
                    }, delay);
                    
                    playing = 1;
                }
	    }
	    
	    /**
	     * stepframes()
	     * This method will step through each image and load it into the screen
	     */
	    function stepframes() {
		var j;
		if(timeout_id) {
		    clearTimeout(timeout_id);
		    timeout_id = null;
		}
		frame = (frame + dir + imageSum) % imageSum;
		j = frame + 1;
		
		if(images[frame].complete) {
		    $('div#animation').html('<img id="'+frame+'" style="width:'+settings.width+'px;height:'+settings.height+'px" src="'+images[frame].src+'" style="float:left;position:relative;z-index:10;" />');
		    $('.label #playlabel').html('step: '+j+' of '+imageSum);
		    $('#slider').slider('option','value',frame);
		    
		    if(swingon && (j == imageSum || frame == 0)) {
			reverse();
		    }
		    
		    playing = 0;
		}
	    }
	    
	    /**
	     * trackframes()
	     * @param i {int}
	     */
	    function trackframes(i) {
		var j;
		frame = i;
		j = frame + 1;
		$('div#animation').html('<img id="'+frame+'" style="width:'+settings.width+'px;height:'+settings.height+'px" src="'+images[frame].src+'" style="float:left;position:relative;z-index:10;" />');
		$('.label #playlabel').html('frame '+j+' of '+imageSum);
		$('#slider').slider('option','value',frame);
	    }
	    
            /**
	     * reverse()
	     * This method reverses the direction of the loop
	     */
            function reverse() {
                dir = -dir;
		if(dir > 0) {
		    $('#direction').css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_reverse.png)'});
		}
		
		if(dir < 0) {
		    $('#direction').css({'background-image' : 'url('+jspath+'/skins/'+settings.skin+'/'+settings.skin+'_forward.png)'});
		}
	    }
	    
            /**
	     * show_speed()
	     * Shows current speed in frames per second
	     */
            function show_speed() {
		$('.label #speedlabel').html('speed: ' + Math.round(speed) + ' (frames/sec)');
		delay = 1000.0 / speed;
            }
	    
	    
	    function initAutoUpdate() {
		autoupdate_intvl = setInterval(function() {
                    sendAjaxRequest(spath,'POST','format=json&count='+imageSum+'&dataset='+dataset,true,'handleImageUpdate');
                }, 60000);
	    }
            
            /**
             * sendAjaxRequest
             * This method make a jQuery ajax call
             * @param {String} link - path to server
             * @param {String} method - request method
             * @param {String} params - parameters of the url query string
             * @param {Bool} asc - setting for asynchronous
             * @param {String} callback - name of the call back function
             */
            function sendAjaxRequest(link,method,params,asc,callback) {
                $.ajax({
                    url: link,
                    type: method,
                    data: params,
                    async: asc,
                    success: eval(callback)
                });
            }
            
            /**
             * handleImageUpdate
             * this is a call back function for the auto update feature
             * @param {Obj} data - data to be handled
             */
	    function handleImageUpdate(data) {		
		if(data.urls.length > 0) {
		    if(timeout_id) { clearTimeout(timeout_id); }
		    timeout_id = null;
		    playing = 0;
		    imgQueue = new Array();
		    index = imageSum;
		    for(var i=0;  i<data.urls.length; i++) {
			images.pop();
			imageSum--;
		    }
		    for(var i=0;  i<data.urls.length; i++) {
			imgQueue[i] = dpath+'/'+data.files[i];
		    }
		    imageSum = imageSum + data.urls.length;
		    x=0;
		    for(var i=index; i<imageSum; i++) {
			images[i] = new Image(settings.width,settings.height);
			images[i].onload = function() {
			    count_images();
			}
			images[i].src = imgQueue[x];
			images[i].onerror = removeImage;
			x++;
		    }
		    
		    if($('#slider')) {
			$('#slider').slider('option','max',imageSum);
		    }
		    
		} else {
		    $('.label #playlabel').html('No new data');
		}
            }
	    
	    function handleJsonUpdate(data) {
		if(timeout_id) { clearTimeout(timeout_id); }
		timeout_id = null;
		playing = 0;
		imgQueue = new Array();    
		params[0] = data.last_date;
		for(var i=0;  i<data.urls.length; i++) {
		    imgQueue[i] = data.urls[i];
		}
		index = imageSum;
		imageSum = imageSum + data.urls.length;
		x=0;
		for(var i=index; i<imageSum; i++) {
		    images[i] = new Image(settings.width,settings.height);
		    images[i].onload = function() {
			count_images();
		    }
		    images[i].src = imgQueue[x];
		    images[i].onerror = removeImage;
		    x++;
		}
		
		if($('#slider')) {
		    $('#slider').slider('option','max',imageSum);
		}
            }
	    
	    
            //-----------------------------------------------------------------
            
            /**
	     * initialize the plugin
	     */
            $this.css('width',settings.width+'px');
	    display = screen().append(animation);
            $this.append(display);
            
            if(cntrlpnl == 1) {
                controls = controlpanel();
                btnwrapper = controlbuttons();
                for(i in btns) {
                    btnwrapper.append(eval(btns[i]));
                }
                controls.append(btnwrapper);
                
                if(lblpnl == 1) {
                    lblpanel = controllabels();
                    for(i in lbls) {
                        lblpanel.append(eval(lbls[i]));
                    }
                    controls.append(lblpanel);
                }
                $this.append(controls);
            }
            
            for(var i=0;i<imageSum;i++) {
                images[i] = new Image(settings.width,settings.height);
                images[i].onload = function() {
                    count_images();
                }
                images[i].src = imgQueue[i];
                images[i].onerror = removeImage;
	    }
            
            if(autoupdate == 1) {
                setInterval(function() {
		    if(json) {
			$.getJSON(spath+'&date='+params, handleJsonUpdate);
		    } else {
			sendAjaxRequest(spath,'POST','',true,'handleImageUpdate');
		    }
                }, 3600000);
            }
	});
    }
    
    // return the jQuery instance to client
    return this;
})(jQuery);