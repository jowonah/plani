
    $(function () {
        var beforeSegments = {
            page: 1,
            category: 'all',
            year: 'all'
        };

        var $window = $(window);
        var $header = $('#header');
        var $tab = $('#experience_tab');
        var $content = $('#experience_tab_contents');

        // 프로젝트 검색 input
        var $searchProject = $('#search_project');

        // 프로젝트 검색 input 내용 지우는 x 버튼
        var $resetSearch = $('#reset_search');

        /**
         * 페이지번호, 카테고리 id, 프로젝트명에 해당하는 페이지를 요청하여 가져온다.
         * 각 값이 falsy 값이면, 이전에 요청되었던 정보를 그대로 사용한다.
         *
         * 응답이 성공하는 경우, 현재 상태값으로 이전 상태값을 업데이트하고
         * 프로젝트 페이지를 업데이트한다.
         *
         * @param {number} page 페이지 번호
         * @param {string} category 카테고리 id
         * @param {string} search 프로젝트명
         * @param {string} year
         * @returns {PromiseLike}
         */
        function fetchAndUpdateItems(page, category, search, year) {
            var segments = {
                page: page || beforeSegments.page,
                category: category || beforeSegments.category,
                year: year || beforeSegments.year,
                search: search
            };

            var segmentsUrl = Object
                .keys(segments)
                .reduce(function (acc, key) {
                    acc.push(key);
                    acc.push(segments[key]);

                    return acc;
                }, [])
                .join('/');

            return $.ajax({
                type: 'GET',
                url: '/experiences/items/' + segmentsUrl

            }).then(function (html) {
                beforeSegments = segments;

                $content.html(html);

                moveScrollToExperienceTab();
            });
        }

        /**
         * 헤더 크기를 감안하여 $target의 위치를 가져온다.
         *
         * padding이 0이면 헤더 바로 밑 위치를 가져온다.
         *
         * @param {jQuery} $target
         * @param {number} padding
         */
        function getPositionWithPadding($target, padding) {
            return $target.offset().top - ($header.height() + padding)
        }

        /**
         * 스크롤을 탭 상단 부분으로 이동
         *
         * 다른 페이지로 이동하는 경우, 사용자가 보기 좋게
         * 상단 부분으로 스크롤을 이동하게한다.
         */
        function moveScrollToExperienceTab() {
            var targetPos = getPositionWithPadding($tab, 20);
            var currentWindowPos = $window.scrollTop();

            // 현재 스크롤 위치가 탭보다 위에 있으면
            // 움직이지 않는다.
            if (currentWindowPos < targetPos) {
                return;
            }

            $window.scrollTop(targetPos);
        }

        /**
         * Quadratic easing-in
         *
         * https://www.gizma.com/easing 참고
         *
         * @param {number} t 현재 frame step
         * @param {number} b 현재위치 (window.scrollY)
         * @param {number} c 움직일 거리 (목표위치 - 현재위치)
         * @param {number} d 총 frame step
         */
        function easing(t, b, c, d) {
            t /= d;
            return c*t*t + b;
        }

        var FPS = 1000 / 60;

        /**
         * $target 위치로 ms시간만큼 스크롤을 이동시킨다.
         *
         * @param {jQuery} $target
         * @param {number} ms
         */
        function moveEasingScroll($target, ms) {
            var currentStep = 0;
            var totalStep = ms / FPS;

            var ref = setInterval(function () {
                var current = $window.scrollTop();
                var target = getPositionWithPadding($target, 0);
                var distance = target - current;

                var pos = easing(currentStep++, current, distance, totalStep);
                $window.scrollTop(pos);

                if (currentStep >= totalStep) {
                    clearInterval(ref);
                    $window.scrollTop(target);

                    ref = null;
                }
            }, FPS);
        }

        /**
         * 프로젝트 토글 애니메이션
         *
         * /plani/js/contents.js 에서 가져온 코드.
         */
        $content.on('click', '.toggle_list .title', function (e) {
            var $this = $(this);

            if (!$this.hasClass('can_open')) {
                return;
            }

            e.preventDefault();

            var $siblings = $('.toggle_list .title');

            $siblings.next('.toggle_contents').slideUp();
            $siblings.parent().removeClass('active');

            var $parent = $this.parent();
            var $nextToggleContents = $this.next('.toggle_contents');

            if ($this.next('.toggle_contents').is(':hidden')) {
                $parent.addClass('active');
                $nextToggleContents.slideDown();

                moveEasingScroll($this, 500);

            } else {
                $parent.removeClass('active');
                $nextToggleContents.slideUp();
            }
        });

        /**
         * 년도 선택 셀렉트 박스 코드
         */
        var $selected = $('.experience_search .select_year .selected');

        $selected.on('click',function(){
            $(this).parent().toggleClass('active');

            return false;
        });

        //빈화면 클릭시 제거
        $('html').on('click', function (e) {
            if (!$(e.target).hasClass('select_year')) {
                $selected.parent().removeClass('active');
            }
        });

        //셀렉트박스 스크롤
        $(".select_year .select_list ul").mCustomScrollbar({
            axis: "y",
            theme: "light-3",
            scrollbarPosition: "outside",
            values: "auto"
        });

        var $selectYear = $('#select_year > span');
        $('.select_year .select_list ul li a').on('click', function (e) {
            var $this = $(this);
            var year = $this.data('year');
            var name = $this.text();

            $selectYear.text(name);

            fetchAndUpdateItems(1, '', $searchProject.val(), year);
        });

        /**
         * 카테고리 변경
         *
         * 탭을 클릭했을 때, 해당 탭의 category_id 값으로
         * 서버에 새로운 목록을 요청한다.
         */
        $tab.on('click', 'a.tab_item', function (e) {
            e.preventDefault();

            // 현재 클릭된 탭 li
            var $currentTab = $(this).parent();

            // 현재 활성화된 탭이면 아무것도 하지 않음
            if ($currentTab.hasClass('active')) {
                return;
            }

            // 다른 탭 li들
            // 이전 탭의 active 클래스를 지우기 위함
            var $otherTabs = $currentTab.siblings();

            // 이전에 선택된 탭 li
            // 응답 실패인 경우, 이전 선택된 값으로 되돌리기 위함
            var $beforeTab = $otherTabs.find('.active');

            $otherTabs.removeClass('active');
            $currentTab.addClass('active');

            var category = $(this).data('id');

            // 클릭된 카테고리 위치와 비슷하게 스크롤
            if (window.innerWidth < 768) {
                moveCategoryLeftScroll($currentTab, 500);
            }

            // 카테고리 변경시 페이지는 1페이지로 요청하고,
            // 년도는 전체로 한다.
            fetchAndUpdateItems(1, category, '', 'all')
                .then(function () {
                    // 응답성공인 경우 검색창 및 년도선택 리셋
                    $searchProject.val('');
                    $selectYear.text('전체');
                })
                .catch(function (err) {
                    // 응답실패인 경우
                    // 원래 탭 상태로 되돌린다.
                    $currentTab.removeClass('active');
                    $beforeTab.addClass('active');

                    moveCategoryLeftScroll($beforeTab, 0);

                    console.error(err);
                });
        });

        /**
         * 선택된 카테고리로 스크롤한다.
         *
         * @param {jQuery} $li
         * @param {number} ms
         */
        function moveCategoryLeftScroll($li, ms) {
            var $this = $li;
            var $parent = $this.parent();

            var currentLeft = $this.position().left;
            var leftPadding = 20;
            var target = $parent[0].scrollLeft + currentLeft - leftPadding;

            $parent.animate({
                scrollLeft: target
            }, ms);
        }

        /**
         * 페이지 변경
         *
         * 클릭된 페이지 번호의 텍스트값으로 페이징한다.
         */
        $content.on('click', 'a.page_num', function () {
            var page = parseInt($(this).text().trim());
            var search = $searchProject.val();

            fetchAndUpdateItems(page, '', search, '')
                .catch(function (err) {
                    console.error(err);
                });
        });

        /**
         * 프로젝트명 검색
         */
        $searchProject.on('search:change', function (e, value) {
            fetchAndUpdateItems(1, '', value, '')
                .catch(function (err) {
                    console.error(err);
                });
        });

        /**
         * 프로젝트명 입력하는 대로 자동검색 되도록
         */
        $searchProject.on('keydown', _.debounce(function () {
            var $this = $(this);

            var value = $this.val().trim();

            $this.trigger('search:change', value);

        }, 300));

        /**
         * 프로젝트명 입력값 초기화
         */
        $resetSearch.on('click', function () {
            $searchProject.val('');
            $searchProject.trigger('search:change', '');
            $(this).removeClass('active');
        });

        /**
         * 검색 input 내용 유무에 따라 reset 버튼 색상주기
         */
        $searchProject.on('keyup', function () {
            setTimeout(function () {
                var value = $searchProject.val();

                if (value.length > 0) {
                    $resetSearch.addClass('active');
                } else {
                    $resetSearch.removeClass('active');
                }
            }, 0);
        });

        /**
         * 이전, 다음 페이지 이동
         *
         * 현재 페이지에서 1만큼 증감하는 delta를 이용하여
         * 페이징을 처리한다.
         */
        $content.on('page:change', function (e, delta) {
            var current = beforeSegments.page;
            var search = $searchProject.val();

            // 1페이지보다 더 밑으로 내려갈 순 없다.
            var targetPage = Math.max(current + delta, 1);

            fetchAndUpdateItems(targetPage, '', search, '');
        });

        /**
         * 이전 페이지
         */
        $content.on('click', '.pagerWrap .prev.navigate', function () {
            $content.trigger('page:change', -1);
        });

        /**
         * 다음 페이지
         */
        $content.on('click', '.pagerWrap .next.navigate', function () {
            $content.trigger('page:change', 1);
        });
    });
