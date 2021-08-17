$(function(){
	function select() { //셀렉트 박스 커스텀
		$(".select_box .select").click(function () {
			var bt = $(this);
			var adDiv = bt.next("ul");

			if (adDiv.is(":hidden")) {
				adDiv.slideDown();
				bt.addClass("on");
			} else {
				adDiv.slideUp();
				bt.removeClass("on");
			}
		});
	}
	select();
});