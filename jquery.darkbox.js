( function ( $ ) {

  $.fn.darkbox = function ( userSettings ) {

    // Run once
    if ( !$.fn.darkbox.Class ) {

      // Add all necessary Darkbox nodes (as constants)
      var closebuttonPlaceClass = /mac/i.test( navigator.platform ) ? // FIXME: Ubuntu 10(11?) by default has left-side controls too
          'darkbox-button-left' : 'darkbox-button-right',

        DarkboxStateClasses = 'darkbox-on darkbox-done darkbox-loaded darkbox-error',

        CloseButtonTitle = function() {
          switch( $( 'html' ).attr( 'lang' ) ) {
            case 'ru':
              return 'Закрыть';
            default:
              return 'Close';
          }
        }(), // call it in place

        CloseButton = $( '<div/>', {
          'class': 'darkbox-button ' + closebuttonPlaceClass
        }),

        Darkbox = $( '<div class="darkbox"/>' ),
        DarkboxShadow = $( '<div class="darkbox-shadow"/>' ),
        DarkboxCanvas = $( '<div class="darkbox-canvas"/>' ),
        DarkboxImage = $( '<img/>' );

      DarkboxCanvas.append( DarkboxImage, CloseButton );
      Darkbox.
        append( DarkboxShadow, DarkboxCanvas ).
        appendTo( 'body' );



      /* In order to keep all event handler bindings static, but still have
      *  access to +this+ context, we pass +this+ to the variable +self+ on
      *  each openBox() run. So inside functions self == darkboxInstance.
      *  */
      var self,

      // Global event handlers & functions

        resetCanvasBackgroundChanges = function() {
          clearInterval( self.spinnerAnimationIntervalId );
          DarkboxCanvas.css( 'background-position', '24px 24px' );
        },

        handleKey = function( e ) {
          // Close darkbox on space (32) and esc (27)
          if ( 27 === e.which || 32 === e.which ) {
            if ( Darkbox.is( ':visible' ) ) {
              e.preventDefault();
              closeBox();
            }
          }
        },

        handleImageLoad = function( e ) {
          resetCanvasBackgroundChanges();

          var img = $( e.currentTarget ),
              ratio = self.ratio,
              imgWidth = img.width(), imgHeight = img.height(),
              darkboxWidth = Darkbox.width(),
              darkboxHeight = Darkbox.height();

          // Sometimes IE fires load event before loading image.
          if ( 0 === imgWidth && 0 === imgHeight ) {
            setTimeout( function (){ img.load(); }, 10 );
          }

          // We must downsize the image when it is bigger than viewport
          if (
            ( imgWidth > darkboxWidth - self.boxMargin ) ||
            ( imgHeight > darkboxHeight - self.boxMargin )
          ) {
            ratio = Math.min(
              ( darkboxWidth - self.boxMargin ) / imgWidth,
              ( darkboxHeight - self.boxMargin ) / imgHeight
            );

            imgWidth = Math.round( imgWidth * ratio );
            imgHeight = Math.round( imgHeight * ratio );
          }

          Darkbox.addClass( 'darkbox-loaded' );

          // NOTE: we must show darkboxCanvas to compute dimensions right
          DarkboxCanvas.
            animate( {
              width:      imgWidth,
              marginLeft: -imgWidth / 2,
              height:     imgHeight,
              marginTop:  -imgHeight / 2,
              opacity: 1
              }, self.imageFadeInTime,
              function () {
                Darkbox.addClass( 'darkbox-done' );
              }
            );
        },

        handleImageLoadError = function() {
          resetCanvasBackgroundChanges();

          Darkbox.addClass( 'darkbox-error' );
          setTimeout( closeBox, self.imageErrorFadeOutTime );
        },

        closeBox = function() {
          resetCanvasBackgroundChanges();

          DarkboxShadow.animate(
            { opacity: 0 },
            self.shadowFadeOutTime,
            function () {
              Darkbox.removeClass( DarkboxStateClasses );

              DarkboxCanvas.stop(); // Stop animation on close

              // FIXME: Prevent image download, current solution is not perfect
              // http://stackoverflow.com/questions/930237/javascript-cancel-stop-image-requests
              DarkboxImage.attr( 'src', '' ); // FIXME: Fires error in IE - check
            }
          );
        };
      
      // Static bindings

      DarkboxImage.
        bind( 'load.darkbox', handleImageLoad ).
        bind( 'error.darkbox', handleImageLoadError );

      CloseButton.bind( 'click.darkbox', closeBox );
      DarkboxShadow.bind( 'click.darkbox', closeBox );

      // FIXME: need better solution
      // Opera preventDefault for space on keypress
      // Safari reacts on esc only on keydown
      $( document ).bind( 'keypress.darkbox keydown.darkbox', handleKey );



      // Darkbox constructor
      $.fn.darkbox.Class = function( userArgs ) {
        var defaultSettings = {
          shadowFadeInTime: 200,
          shadowFadeOutTime: 100,
          darkboxShadowOpacity: 0.6,

          darkboxCanvasOpacity: 0.5,

          imageFadeInTime: 400,
          imageErrorFadeOutTime: 800,

          boxMargin: 50,
          ratio: 1,

          closeButtonTitle: CloseButtonTitle
        };

        $.extend( this, defaultSettings, userArgs );
      };


      $.fn.darkbox.Class.prototype = {

        // User clicks on the Darkbox link
        openBox: function( e ) {
          // Using closure to capture +this+
          self = this;

          e.preventDefault();

          var link = $( e.currentTarget );

          Darkbox.addClass( 'darkbox-on' );
          DarkboxCanvas.css( {
            'width': '',
            'marginLeft': '',
            'height': '',
            'marginTop': '',
            'opacity': this.darkboxCanvasOpacity
          } );

          // FIXME: Constants for initial shift, step height, number of
          // steps, interval?
          var spinnerStep = 0;
          this.spinnerAnimationIntervalId = setInterval( function () {
            var shift = 24 - ( 56 * spinnerStep );

            DarkboxCanvas.css( 'background-position', '24px ' + shift + 'px' );

            spinnerStep = ( 7 <= spinnerStep ) ? 0 : spinnerStep + 1;
          }, 90 );

          DarkboxImage.
            css( { 'width': '', 'height': '' } ).
            attr( 'src', link.attr( 'href' ) ).
            attr( 'alt', link.attr( 'title' ) );

          DarkboxShadow.animate( { 'opacity': this.darkboxShadowOpacity }, this.shadowFadeInTime );

          CloseButton.attr( 'title', this.closeButtonTitle );
        }
      };
    } // ran once

    var darkboxInstance = new $.fn.darkbox.Class( userSettings );
    this.click( $.proxy( darkboxInstance, 'openBox' ) );

    return this; // Support chaining
  };
} ( jQuery ) );