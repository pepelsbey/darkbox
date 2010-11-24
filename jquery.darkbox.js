( function ( $ ) {

	$.fn.darkbox = function () {
		// Add all necessary Darkbox nodes
		$( '<div class="darkbox"><div class="darkbox-shadow"></div><div class="darkbox-canvas"><img alt=""><div class="darkbox-button" title="Close"></div></div></div>' ).
			appendTo( 'body' );

		var shadowFadeInTime  = 200,
			shadowFadeOutTime = 100,

			imageFadeInTime       = 400,
			imageErrorFadeOutTime = 800,

			darkboxStateClasses =
				'darkbox-on darkbox-done darkbox-loaded darkbox-error',

			boxMargin = 50, // For cases, when image is bigger than viewport

			buttonPlaceClass = /mac/i.test( navigator.platform ) ?
				'darkbox-button-left' :
				'darkbox-button-right',

			darkbox = $( 'div.darkbox' ),
			darkboxShadow = darkbox.children( 'div.darkbox-shadow' ),
			darkboxCanvas = darkbox.children( 'div.darkbox-canvas' ),
			darkboxImage  = darkboxCanvas.children( 'img' ),
			darkboxButton = darkboxCanvas.children( 'div.darkbox-button' ),
			spinnerAnimationIntervalId = 0, spinnerStep = 0;

		function resetCanvasBackgroundChanges() {
			clearInterval( spinnerAnimationIntervalId );
			darkboxCanvas.css( 'background-position', '24px 24px' );
		}

		function openBox ( e ) {
			e.preventDefault();

			var link = $( this );

			darkbox.addClass( 'darkbox-on' );

			darkboxCanvas.css( {
				'width': '',
				'marginLeft': '',
				'height': '',
				'marginTop': '',
				'opacity': 0.5
			} );

			// FIXME: Constants for initial shift, step height, number of
			// steps, interval?
			spinnerAnimationIntervalId = setInterval( function () {
				var shift = 24 - ( 56 * spinnerStep ); 

				darkboxCanvas.css( 'background-position', '24px ' + shift + 'px' );

				spinnerStep = ( 7 <= spinnerStep ) ? 0 : spinnerStep + 1;
			}, 90 );

			darkboxImage.
				one( 'error', handleImageLoadError ).
				css( { 'width': '', 'height': '' } ).
				attr( 'src', link.attr( 'href' ) ).
				attr( 'alt', link.attr( 'title' ) );

			darkboxShadow.animate( { 'opacity': 0.6 }, shadowFadeInTime );
		}

		function closeBox() {
			resetCanvasBackgroundChanges();

			darkboxShadow.animate(
				{ opacity: 0 },
				shadowFadeOutTime,
				function () {
					darkbox.removeClass( darkboxStateClasses );

					darkboxCanvas.stop(); // Stop animation on close

					// FIXME: Prevent image download, current solution is not perfect
					// http://stackoverflow.com/questions/930237/javascript-cancel-stop-image-requests
					darkboxImage.
						unbind( 'error', handleImageLoadError ).
						attr( 'src', '' ); // FIXME: Fires error in IE - check
				}
			);
		}

		function handleKey( e ) {
			// Close darkbox on space (32) and esc (27)
			if ( 27 === e.which || 32 === e.which ) {
				// If darkbox is visible
				if ( 0 === $( 'div.darkbox:hidden' ).length ) {
					e.preventDefault();
					closeBox();
				}
			}
		}

		function handleImageLoadError() {
			resetCanvasBackgroundChanges();

			darkbox.addClass( 'darkbox-error' );
			setTimeout( closeBox, imageErrorFadeOutTime );
		}

		function handleImageLoad() {
			resetCanvasBackgroundChanges();

			var img = $( this ),
				ratio = 1,
				imgWidth = img.width(), imgHeight = img.height(),
				darkboxWidth = darkbox.width(),
				darkboxHeight = darkbox.height();

			// Sometimes IE fires load event before loading image.
			if ( 0 === imgWidth && 0 === imgHeight ) {
				setTimeout( function (){ img.load(); }, 10 );
				return;
			}

			// We must downsize the image when it is bigger than viewport
			if (
				( imgWidth > darkboxWidth - boxMargin ) ||
				( imgHeight > darkboxHeight - boxMargin )
			) {
				ratio = Math.min(
					( darkboxWidth - boxMargin ) / imgWidth,
					( darkboxHeight - boxMargin ) / imgHeight
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
					}, imageFadeInTime,
					function () {
						darkbox.addClass( 'darkbox-done' );
					}
				);
		}

		// Darkbox handlers
		darkboxShadow.
			css( { opacity: 0 } ).
			click( closeBox );

		darkboxButton.
			addClass( buttonPlaceClass ).
			click( closeBox );

		darkboxImage.load( handleImageLoad );

		// FIXME: need better solution
		// Opera preventDefault for space on keypress
		// Safari reacts on esc only on keydown
		$( document ).
			keypress( handleKey ).
			keydown( handleKey );

		this.click( openBox );

		return this; // Support chaining
	};
} ( jQuery ) );