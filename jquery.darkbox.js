( function ( $ ) {

	$.fn.darkbox = function () {
		var shadowFadeInTime  = 200,
			shadowFadeOutTime = 100,

			imageFadeInTime       = 400,
			imageErrorFadeOutTime = 800,

			darkboxStateClasses =
				'darkbox-on darkbox-done darkbox-loaded darkbox-error',

			boxMargin = 50, // For cases, when image is bigger than viewport

			buttonPlaceClass = /mac/i.test( navigator.platform ) ?
				'darkbox-button-left' :
				'darkbox-button-right';

		function openBox ( e ) {
			e.preventDefault();

			var link = $( this ),
				darkbox = $( 'div.darkbox' );

			//darkbox.removeClass( darkboxStateClasses );

			// NOTE: ?_=timestamp is for Opera 9 and Safari, possible non-caching behaviour
			darkbox.
				children( 'div.darkbox-canvas' ).
					css( { width: '', marginLeft: '', height: '', marginTop: '' } ).
					children( 'img' ).
						one( 'error', handleImageLoadError ).
						css( { width: '', height: '' } ).
						attr( 'src', link.attr( 'href' ) ). // + '?_=' + ( +new Date() )
						attr( 'alt', link.attr( 'title' ) ).
						end().
					end().
				addClass( 'darkbox-on' ).
				children( 'div.darkbox-shadow' ).
					animate( { opacity: 0.6 }, shadowFadeInTime );
		}

		function closeBox() {
			$( 'div.darkbox-shadow' ).animate(
				{ opacity: 0 },
				shadowFadeOutTime,
				function () {
					$( 'div.darkbox' ).
						removeClass( darkboxStateClasses ).
						children( 'div.darkbox-canvas' ).
							// FIXME: Prevent image download, current solution is not perfect
							// http://stackoverflow.com/questions/930237/javascript-cancel-stop-image-requests
							children( 'img' ).
								unbind( 'error', handleImageLoadError ).
								attr( 'src', '' ); // FIXME: Fires error in IE - check
				}
			);
		}

		function handleKey( e ) {
			// Close darkbox on space (32) and esc (27)
			if ( 27 === e.which || 32 === e.which ) {
				// If darkbox is visible
				if ( 0 === $(".darkbox:hidden").length ) {
					e.preventDefault();
					closeBox();
				}
			}
		}

		function handleImageLoadError() {
			$( 'div.darkbox' ).addClass( 'darkbox-error' );
			setTimeout( closeBox, imageErrorFadeOutTime );
		}

		function handleImageLoad() {
			var img = $( this ),
				darkbox = img.parents( 'div.darkbox' ),
				// NOTE: we must show canvas to compute dimensions right
				canvas = img.parents( 'div.darkbox-canvas' ),
				ratio = 1,
				img_width = img.width(), img_height = img.height(),
				darkbox_width = darkbox.width(),
				darkbox_height = darkbox.height();

			// Sometimes IE fires load event before loading image.
			if ( 0 === img_width && 0 === img_height ) {
				setTimeout( function (){ img.load(); }, 10 );
				return;
			}

			// We must downsize the image when it is bigger than viewport
			if (
				( img_width > darkbox_width - boxMargin ) ||
				( img_height > darkbox_height - boxMargin )
			) {
				ratio = Math.min(
					( darkbox_width - boxMargin ) / img_width,
					( darkbox_height - boxMargin ) / img_height
				);

				img_width = Math.round( img_width * ratio );
				img_height = Math.round( img_height * ratio );

				img.css( { width: img_width, height: img_height } );
			}

			darkbox.addClass( 'darkbox-loaded' );

			canvas.
				animate( {
					width:      img_width,
					marginLeft: -img_width / 2,
					height:     img_height,
					marginTop:  -img_height / 2
					}, imageFadeInTime,
					function () {
						darkbox.
							//removeClass( 'darkbox-loaded' ).
							addClass( 'darkbox-done' );
					}
				);
		}

		// Add all necessary Darkbox nodes and handlers
		$( '<div class="darkbox"><div class="darkbox-shadow"></div><div class="darkbox-canvas"><img alt=""><div class="darkbox-button" title="Close"></div></div></div>' ).
			children( 'div.darkbox-shadow' ).
				click( closeBox ).
				end().
			find( 'div.darkbox-button' ).
				addClass( buttonPlaceClass ).
				click( closeBox ).
				end().
			find( 'img' ).
				load( handleImageLoad ).
				end().
			appendTo( 'body' ).
			end();

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
