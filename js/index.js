$(function () {

	function main(){

		$(".visual").slick({
			infinite: true,
			speed: 500,
			autoplaySpeed: 5000,
			fade: true,
			slidesToShow: 1,
			slidesToScroll: 1,
			dots: true,
			appendDots: '.auto_box',
			arrows: true,
			prevArrow: $('.up_btn'),
			nextArrow: $('.down_btn'),
			autoplay: true,
			pauseOnDotsHover: false,
			pauseOnHover: false,
            asNavFor: '.txt_slide'   
		});

		$('.txt_slide').slick({
            slidesToShow: 1,
            slidesToScroll: 1,
            asNavFor: '.visual',
            arrows:false,
            focusOnSelect: true,
            vertical: true,
            cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
			verticalWidth:true
		
          });
		
		let time = 0;
		let interval;
		let duration = 5;

		
		  $('.circle_button .slick-arrow').on('click', function () {
            clearInterval(interval);
			$(".full_bar").css({
				'animation-duration': duration + time + 's',
			})
			duration = duration + time;
			time = 0;
			$(".bar").removeClass("stop");
            $(".button_text .stop").removeClass("on");
			$(".button_text .play").addClass("on");
            $('.visual').slick('slickPause');
        });
   
		$('.button_text .stop').on('click', function () {
			$('.visual').slick('slickPause');
			$(".button_text .play").addClass("on");
			$(".button_text .stop").removeClass("on");
			$(".bar").addClass("stop");
            $(this).parent().parent().removeClass("on");
			
            $('.circle_button .slick-arrow').addClass("on");
		});

		$('.button_text .play').on('click', function () {
			$('.visual').slick('slickPlay');
			$(".button_text .stop").addClass("on");
			$(".button_text .play").removeClass("on");
            $(this).parent().parent().addClass("on");

            $('.circle_button .slick-arrow').removeClass("on");
			
            clearInterval(interval);
			$(".full_bar").css({
				'animation-duration': duration + time + 's',
			})
			duration = duration + time;
			time = 0;
			$(".bar").removeClass("stop");
		});

	}

	function visualWrap(){
		let time = 0;
		let timeSet;
		let duration = 5;


		$(".visual .slick-slide").addClass("active");

		$(".visual").on('afterChange', function (event, slick, currentSlide, nextSlide) {
			$(".bar").addClass('full_bar');
			$(".full_bar").css({
				'animation-duration': '5s',
			})
			timeSet = setInterval(function () {
				duration--;
			}, 1000)
            $(".visual .slick-slide").removeClass("active");
            $(".visual .slick-active").addClass("active");
		});

		$(".visual").on('beforeChange', function (event, slick, currentSlide, nextSlide) {
			$(".bar").removeClass('full_bar');
			clearInterval(timeSet);

		});
	}

	function animation() {
		if($(window).width() > 1200){
			$('body').addClass('main_ani');
		}else {
			$('body').removeClass('main_ani');
            $('body').removeClass('ani');
		}

	}
	
	main();
	visualWrap();
	animation();
	$(window).resize(function(){animation()});
});