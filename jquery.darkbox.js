( function ( $ ) {

	$.fn.darkbox = function ( userSettings ) {

		// Run once
		if ( !$.fn.darkbox.Class ) {

		  // Add all necessary Darkbox nodes (as constants)
		  var closebuttonPlaceClass = /mac/i.test( navigator.platform ) ? // FIXME: Ubuntu 10(11?) by default has left-side controls too
			  'darkbox-button-left' :
			  'darkbox-button-right',

			  closeButtonTitle = function() {
			    switch( $( "html" ).attr( "lang" ) ) {
			      case "ru":
			        return "Закрыть";
			      default:
			        return "Close";
			    }
			  }(), // call it in place

        closeButton = $("<div/>", {
          "class": "darkbox-button " + closebuttonPlaceClass
        }),

        darkbox = $( "<div class='darkbox'/>" ),
        darkboxShadow = $( "<div class='darkbox-shadow'/>" ),
        darkboxCanvas = $( "<div class='darkbox-canvas'/>" ),
        darkboxImage = $( "<img/>" );

		  darkboxCanvas.append( darkboxImage, closeButton );
		  darkbox.
		    append( darkboxShadow, darkboxCanvas ).
		    appendTo( "body" );

      // Darkbox constructor
		  $.fn.darkbox.Class = function( userArgs ) {
		    var defaultSettings = {
		      shadowFadeInTime      : 200,
		      shadowFadeOutTime     : 100,
		      darkboxShadowOpacity  : 0.6,

		      darkboxCanvasOpacity  : 0.5,

		      imageFadeInTime       : 400,
		      imageErrorFadeOutTime : 800,

		      boxMargin             : 50,

		      closeButtonTitle      : closeButtonTitle
		    };

		    $.extend( this, defaultSettings, userArgs );
		  };

		  // Constants
		  var darkboxStateClasses = 'darkbox-on darkbox-done darkbox-loaded darkbox-error';

		  /* All event handlers has .darkbox namespace (see jQuery unbind doc).
		     To ensure all .darkbox() sets will have unique user's settings we must bind/unbind
		     listeners on each image show.
		  */
		  $.fn.darkbox.Class.prototype = {

		    resetCanvasBackgroundChanges: function() {
		      clearInterval( this.spinnerAnimationIntervalId );
			    darkboxCanvas.css( 'background-position', '24px 24px' );
		    },


        // User clicks on the Darkbox link
		    openBox: function( e ) {
		      e.preventDefault();

			    var link = $( e.currentTarget );

			    darkbox.addClass( 'darkbox-on' );
			    darkboxCanvas.css( {
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

            darkboxCanvas.css( 'background-position', '24px ' + shift + 'px' );

            spinnerStep = ( 7 <= spinnerStep ) ? 0 : spinnerStep + 1;
          }, 90 );

          darkboxImage.
            one( 'error.darkbox', $.proxy( this, "handleImageLoadError" ) ).
            bind( 'load.darkbox', $.proxy( this, "handleImageLoad" ) ).
            css( { 'width': '', 'height': '' } ).
            attr( 'src', link.attr( 'href' ) ).
            attr( 'alt', link.attr( 'title' ) );

          darkboxShadow.animate( { 'opacity': this.darkboxShadowOpacity }, this.shadowFadeInTime );

          // Other Darkbox handlers
          var closeBoxRebound = $.proxy(this, "closeBox");
          darkboxShadow.bind( "click.darkbox", closeBoxRebound );
          closeButton.
            bind( "click.darkbox", closeBoxRebound ).
            attr( "title", this.closeButtonTitle );

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
              darkboxWidth = darkbox.width(),
              darkboxHeight = darkbox.height();

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

          darkbox.addClass( 'darkbox-loaded' );

          // NOTE: we must show darkboxCanvas to compute dimensions right
          darkboxCanvas.
            animate( {
              width:      imgWidth,
              marginLeft: -imgWidth / 2,
              height:     imgHeight,
              marginTop:  -imgHeight / 2,
              opacity: 1
              }, this.imageFadeInTime,
              function () {
                darkbox.addClass( 'darkbox-done' );
              }
            );
		    },


		    handleImageLoadError: function() {
		      this.resetCanvasBackgroundChanges();

			    darkbox.addClass( 'darkbox-error' );
			    setTimeout( $.proxy(this, "closeBox"), this.imageErrorFadeOutTime );
		    },


		    // User closes Darkbox via GUI or keyboard
		    closeBox: function() {
          this.resetCanvasBackgroundChanges();

          darkboxShadow.animate(
            { opacity: 0 },
            this.shadowFadeOutTime,
            function () {
              darkbox.removeClass( darkboxStateClasses );

              darkboxCanvas.stop(); // Stop animation on close

              // FIXME: Prevent image download, current solution is not perfect
              // http://stackoverflow.com/questions/930237/javascript-cancel-stop-image-requests
              darkboxImage.attr( 'src', '' ); // FIXME: Fires error in IE - check

              // Unbinding via namespace
              $.each(
                [ darkboxImage, darkboxShadow, closeButton, $( document ) ],
                function( i, elem ) {
                  elem.unbind( ".darkbox" )
                }
              );
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

    var darkboxInstance = new $.fn.darkbox.Class( userSettings );
    this.click( $.proxy( darkboxInstance, "openBox" ) );

		return this; // Support chaining
	};
} ( jQuery ) );