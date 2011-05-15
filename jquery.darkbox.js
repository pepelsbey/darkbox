( function ( $ ) {

	$.fn.darkbox = function ( userSettings ) {

		// Run once
		if ( !$.fn.darkbox.Klass ) {

		  // Making shortcut
		  var d = $.fn.darkbox;

		  // Add all necessary Darkbox nodes (as global constants)
		  var buttonPlaceClass = /mac/i.test( navigator.platform ) ? // FIXME: Ubuntu 10(11?) by default has left-side controls too
			 'darkbox-button-left' :
			 'darkbox-button-right';

		  d.closeButton = $("<div/>", {
		    "class": "darkbox-button " + buttonPlaceClass,
		    // FIXME: Title set once at a first .darkbox() call. Change it in the openBox()?
		    title: ( userSettings || {} ).closeButtonTitle || "Close"
		  });

		  d.darkbox = $( "<div class='darkbox'/>" );
		  d.darkboxShadow = $( "<div class='darkbox-shadow'/>" );
		  d.darkboxCanvas = $( "<div class='darkbox-canvas'/>" );
		  d.darkboxImage = $( "<img/>" );

		  d.darkboxCanvas.append( d.darkboxImage, d.closeButton );
		  d.darkbox.
		    append( d.darkboxShadow, d.darkboxCanvas ).
		    appendTo( "body" );

      // Darkbox constructor
		  d.Klass = function( userArgs ) {
		    var defaultSettings = {
		      shadowFadeInTime      : 200,
		      shadowFadeOutTime     : 100,
		      darkboxShadowOpacity  : 0.6,

		      darkboxCanvasOpacity  : 0.5,

		      imageFadeInTime       : 400,
		      imageErrorFadeOutTime : 800,

		      boxMargin             : 50
		    };

		    // Overwriting default settings
		    !userArgs ? userArgs = {} : 0;
		    for ( var key in defaultSettings ) {
		      this[key] = userArgs[key] || defaultSettings[key]
		    }
		  };

		  // Constants
		  d.darkboxStateClasses = 'darkbox-on darkbox-done darkbox-loaded darkbox-error';

		  /* All event handlers has .darkbox namespace (see jQuery unbind doc).
		     To ensure all .darkbox() sets will have unique user's settings we must bind/unbind
		     listeners on each image show.
		  */
		  d.Klass.prototype = {

		    resetCanvasBackgroundChanges: function() {
		      clearInterval( this.spinnerAnimationIntervalId );
			    d.darkboxCanvas.css( 'background-position', '24px 24px' );
		    },


        // User clicks on the Darkbox link
		    openBox: function( e ) {
		      e.preventDefault();

			    var link = $( e.currentTarget );

			    d.darkbox.addClass( 'darkbox-on' );
			    d.darkboxCanvas.css( {
            'width'      : '',
            'marginLeft' : '',
            'height'     : '',
            'marginTop'  : '',
            'opacity'    : this.darkboxCanvasOpacity
          } );

          // FIXME: Constants for initial shift, step height, number of
          // steps, interval?
          var spinnerStep = 0;
          this.spinnerAnimationIntervalId = setInterval( function () {
            var shift = 24 - ( 56 * spinnerStep );

            d.darkboxCanvas.css( 'background-position', '24px ' + shift + 'px' );

            spinnerStep = ( 7 <= spinnerStep ) ? 0 : spinnerStep + 1;
          }, 90 );

          d.darkboxImage.
            one( 'error.darkbox', $.proxy( this, "handleImageLoadError" ) ).
            bind( 'load.darkbox', $.proxy( this, "handleImageLoad" ) ).
            css( { 'width': '', 'height': '' } ).
            attr( 'src', link.attr( 'href' ) ).
            attr( 'alt', link.attr( 'title' ) );

          d.darkboxShadow.animate( { 'opacity': this.darkboxShadowOpacity }, this.shadowFadeInTime );

          // Other Darkbox handlers
          var closeBoxRebound = $.proxy(this, "closeBox");
          d.darkboxShadow.bind( "click.darkbox", closeBoxRebound );
          d.closeButton.bind( "click.darkbox", closeBoxRebound );

          // FIXME: need better solution
          // Opera preventDefault for space on keypress
          // Safari reacts on esc only on keydown
          $( document ).bind( "keypress.darkbox keydown.darkbox", $.proxy(this, "handleKey") )
		    },


		    handleImageLoad: function( e ) {
          this.resetCanvasBackgroundChanges();

          var img = $( e.currentTarget ),
              ratio = 1,
              imgWidth = img.width(), imgHeight = img.height(),
              darkboxWidth = d.darkbox.width(),
              darkboxHeight = d.darkbox.height();

          // Sometimes IE fires load event before loading image.
          if ( 0 === imgWidth && 0 === imgHeight ) {
            setTimeout( function (){ img.load(); }, 10 );
          }

          // We must downsize the image when it is bigger than viewport
          if (
            ( imgWidth > darkboxWidth - this.boxMargin ) ||
            ( imgHeight > darkboxHeight - this.boxMargin )
          ) {
            ratio = Math.min(
              ( darkboxWidth - this.boxMargin ) / imgWidth,
              ( darkboxHeight - this.boxMargin ) / imgHeight
            );

            imgWidth = Math.round( imgWidth * ratio );
            imgHeight = Math.round( imgHeight * ratio );
          }

          d.darkbox.addClass( 'darkbox-loaded' );

          // NOTE: we must show darkboxCanvas to compute dimensions right
          d.darkboxCanvas.
            animate( {
              width:      imgWidth,
              marginLeft: -imgWidth / 2,
              height:     imgHeight,
              marginTop:  -imgHeight / 2,
              opacity: 1
              }, this.imageFadeInTime,
              function () {
                d.darkbox.addClass( 'darkbox-done' );
              }
            );
		    },


		    handleImageLoadError: function() {
		      this.resetCanvasBackgroundChanges();

			    d.darkbox.addClass( 'darkbox-error' );
			    setTimeout( $.proxy(this, "closeBox"), this.imageErrorFadeOutTime );
		    },


		    // User closes Darkbox via GUI or keyboard
		    closeBox: function() {
          this.resetCanvasBackgroundChanges();

          d.darkboxShadow.animate(
            { opacity: 0 },
            this.shadowFadeOutTime,
            function () {
              d.darkbox.removeClass( d.darkboxStateClasses );

              d.darkboxCanvas.stop(); // Stop animation on close

              // FIXME: Prevent image download, current solution is not perfect
              // http://stackoverflow.com/questions/930237/javascript-cancel-stop-image-requests
              d.darkboxImage.
                unbind( 'error.darkbox' ).
                unbind( 'load.darkbox' ).
                attr( 'src', '' ); // FIXME: Fires error in IE - check

              $( document ).
                unbind( 'keydown.darkbox' ).
                unbind( 'keypress.darkbox' );

              d.darkboxShadow.unbind( 'click.darkbox' );
              d.closeButton.unbind( 'click.darkbox' );
            }
          );
        },


        handleKey: function( e ) {
          // Close darkbox on space (32) and esc (27)
          if ( 27 === e.which || 32 === e.which ) {
            // If darkbox is visible
            if ( 0 === $( 'div.darkbox:hidden' ).length ) {
              e.preventDefault();
              this.closeBox();
            }
          }
        }
		  };
		} // ran once

    var darkbox = new $.fn.darkbox.Klass( userSettings );
    this.click( $.proxy( darkbox, "openBox" ) );

		return this; // Support chaining
	};
} ( jQuery ) );