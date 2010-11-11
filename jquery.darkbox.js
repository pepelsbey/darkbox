( function ( $ ) {

	$.fn.darkbox = function () {
		var shadowFadeInTime  = 200,
			shadowFadeOutTime = 100,

			imageFadeInTime       = 400,
			imageErrorFadeOutTime = 800,

			darkboxStateClasses =
				'darkbox-canvas-done darkbox-canvas-load darkbox-canvas-error',

			boxMargin        = 50,
			buttonPlaceClass = /mac/i.test( navigator.platform ) ?
				'darkbox-button-left' :
				'darkbox-button-right';

		function openBox ( e ) {
			e.preventDefault();

			var link = $( this ),
				frame = $( 'div.darkbox-frame' );

			$( 'div.darkbox-canvas' ).removeClass( darkboxStateClasses );

			frame.
				children( 'div.darkbox-canvas' ).
					css( { width: '', marginLeft: '', height: '', marginTop: '' } ).
					children( 'img' ).
						one( 'error', handleImageLoadError ).
						css( { width: '', height: '' } ).
						attr( 'src', link.attr( 'href' ) ). // + '?_=' + ( +new Date() )
						attr( 'alt', link.attr( 'title' ) ).
						end().
					end().
				show().
				children( 'div.darkbox-shadow' ).
					animate( { opacity: 0.6 }, shadowFadeInTime );
		}

		function closeBox() {
			$( 'div.darkbox-shadow' ).animate(
				{ opacity: 0 },
				shadowFadeOutTime,
				function () {
					$( 'div.darkbox-frame' ).
						hide().
						children( 'div.darkbox-canvas' ).
							removeClass( darkboxStateClasses ).
							children( 'img' ).
								unbind( 'error', handleImageLoadError ).
								attr( 'src', '' );
				}
			);
		}

		function handleKey( e ) {
			if ( 27 === e.which || 32 === e.which ) {
				// If darkbox is shown
				if ( 0 === $(".darkbox-frame:hidden").length ) {
					e.preventDefault();
					closeBox();
				}
			}
		}

		function handleImageLoadError() {
			$( 'div.darkbox-canvas' ).addClass( 'darkbox-canvas-error' );
			setTimeout( closeBox, imageErrorFadeOutTime );
		}

		function handleImageLoad() {
			var img = $( this ),
				frame = img.parents( 'div.darkbox-frame' ),
				canvas = img.parents( 'div.darkbox-canvas' ),
				ratio = 1,
				img_width = img.width(), img_height = img.height(),
				frame_width = frame.width(), frame_height = frame.height();

			if ( 0 === img_width && 0 === img_height ) {
				setTimeout( function (){ img.load(); }, 10 );
				return;
			}

			if (
				( img_width > frame_width - boxMargin ) ||
				( img_height > frame_height - boxMargin )
			) {
				ratio = Math.min(
					( frame_width - boxMargin ) / img_width,
					( frame_height - boxMargin ) / img_height
				);

				img_width = Math.round( img_width * ratio );
				img_height = Math.round( img_height * ratio );

				img.css( { width: img_width, height: img_height } );
			}

			canvas.
				addClass( 'darkbox-canvas-load' ).
				animate( {
					width:      img_width,
					marginLeft: -img_width / 2,
					height:     img_height,
					marginTop:  -img_height / 2
					}, imageFadeInTime,
					function () {
						$( this ).
							removeClass( 'darkbox-canvas-load' ).
							addClass( 'darkbox-canvas-done' ).
							children( 'img' ).
								show();
					}
				);
		}

		$( '<div class="darkbox-frame"><div class="darkbox-shadow"></div><div class="darkbox-canvas"><img><div class="darkbox-button" title="Закрыть"></div></div></div>' ).
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

		$( document ).
			keypress( handleKey ).
			keydown( handleKey );
		this.click( openBox );

		return this;
	};
} ( jQuery ) );