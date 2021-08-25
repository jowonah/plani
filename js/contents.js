$(function () {
    function experience_slider() {
    
        $('.experience_slider').slick({
            infinite: true,
            slidesToShow:1,
            slidesToScroll: 1,
            dots: false,
            arrows: true,
            autoplay: true,
            autoplaySpeed: 2000,
            variableWidth:true,
            pauseOnDotsHover: false,
            pauseOnHover: true,
            focusOnSelect:true,
            cssEase: 'ease-out',
            prevArrow: $('.experience_slider_wrap .slider_btn .prev'),
            nextArrow: $('.experience_slider_wrap .slider_btn .next'),
            easing: 'ease',
            centerMode:true,
            
        }).on('afterChange', function (event, slick, currentSlide, nextSlide) {
            $(".slick-slide").removeClass("focus");
            $(".slick-center").addClass("focus");
          });

       
        $(".slick-center").addClass("focus");
       
    }


    function experience_tab() {
        $('.experience_tab > ul > li').click(function(){
            var tab_id = $(this).attr('data-tab');
    
            $('.experience_tab > ul > li').removeClass('active');
            $('.experience_contents > li').removeClass('active');
    
            $(this).addClass('active');
            $("#"+tab_id).addClass('active');
    
            return false;
        });
    }


    function experience_contents() {
        $('.toggle_list .title').on('click',function(e){
            e.preventDefault();
            $(".toggle_list .title").next(".toggle_contents").slideUp();
            $(".toggle_list .title").parent().removeClass("active");
    
            if($(this).next(".toggle_contents").is(":hidden")){
                $(this).parent().addClass("active");
                $(this).next(".toggle_contents").slideDown();
            }else{
                $(this).parent().removeClass("active");
                $(this).next(".toggle_contents").slideUp();
    
            }
    
        });
    }

    function headerfixed() { //헤더고정
		$(window).on("scroll", function () {
			let height = $("#header").height();
			let scroll = $(window).scrollTop();
			if (scroll >= height) {
				$("#header").addClass("scrolled");
			} else {
				$("#header").removeClass("scrolled");
			}
		});

	}

    headerfixed();
    experience_tab();
    experience_slider();
    experience_contents();
})

