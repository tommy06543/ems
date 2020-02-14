myApp.onPageInit('statistic', function (page) {
    // 先隱藏內容，防止畫面調整時閃動
    $('[data-page="statistic"].page .page-content').css({visibility: 'hidden'});
    
    vue = new Vue({
        el: page.container.children[1],
		data: {
            cycle: globalData.load_cycle,
            cycle_data: null,
            selectedCycleOID: globalData.load_cycle.length > 0 ? globalData.load_cycle[0].OID : null
        },
		methods: {
			resetData: function() {
                var self = this;
                var newCycle = _.find(this.cycle, {OID: this.selectedCycleOID});
				this.cycle_data = _.filter(globalData.load_cycle_data, function(item) {
                    return moment(item.Date).isBetween(newCycle.StartDate, newCycle.EndDate, null, '[]') && moment(item.Date + ' ' + newCycle.DailyConclude).isBefore(moment());
                });
                setTimeout(function() { self.cssReset(); });
			},
            cssReset: function() {
                // 凍結標題列
                $('#swiper_header').css({
                    position: 'fixed',
                    top: $('.navbar').height(),
                    'z-index': 999,
                    width: '100%'
                });
                // 設定內容區塊，頂端標題列padding防止被navbar蓋住
                $('#swiper_contents').css({
                    'padding-top': $('.navbar').height()
                });
                // 日期欄寬度自動調整
                $('[data-page="statistic"].page #swiper_contents .col-25').css({
                    width: 'auto'
                });
                // 標題列的日期欄寬度設定一致
                $('[data-page="statistic"].page #swiper_header .col-25').css({
                    width: $('[data-page="statistic"].page #swiper_contents .col-25').width()
                });
                // 剩餘內容寬度自動計算
                $('[data-page="statistic"].page .col-75').css({
                    width: 'calc(100% - ' + $('[data-page="statistic"].page #swiper_contents .col-25').width() + 'px)'
                });
                // 儲存格左右padding調整縮小
                $('[data-page="statistic"].page .numeric-cell').css({
                    padding: '0 10px'
                });
            }
        },
        beforeMount: function () {
            this.resetData();
        },
        watch: {
            selectedCycleOID: function (newCycleOID) {
                var self = this;
                var newCycle = _.find(this.cycle, {OID: newCycleOID});
                // cycle_data 沒有此週期資料的時候下載
                if(_.some(globalData.load_cycle_data, function(item) {
                        return moment(item.Date).isBetween(newCycle.StartDate, newCycle.EndDate, null, '[]') && moment(item.Date + ' ' + newCycle.DailyConclude).isBefore(moment())
                    }) == false) {
                    $.ajax({
                        method: 'POST',
                        url: serverUrl + '/plant_ajax/ajaxLoadCycleData/',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
                        dataType: "json",
                        data: {PlantOID: localStorage.PlantOID, CycleOID: newCycle.OID},
                        retryCount: 3,
                        success : function(response) {
                            globalData.load_cycle_data = globalData.load_cycle_data.concat(response);
                            self.resetData();
                        }
                    });
                } else
                    this.resetData();
            }
        }
    });
    new Vue({
        el: page.container.children[0],
		data: vue._data
    });
});

// var swiper_header, swiper_contents;
myApp.onPageAfterAnimation('statistic', function (page) {
                // 日期欄寬度自動調整
                $('[data-page="statistic"].page .row > div:nth-child(1)').css({
                    width: 142
                });
                $('[data-page="statistic"].page .row > div:nth-child(2)').width($('[data-page="statistic"].page').width() - $('[data-page="statistic"].page .row > div:nth-child(1)').width());
    var swiper_header = myApp.swiper('#swiper_header .swiper-container', {
        spaceBetween: 0,
        breakpoints: {
            // when window width is <= 320px (iPhone5)
            320: {
                slidesPerView: 2
            },
            // when window width is <= 375px (iPhone6)
            375: {
                slidesPerView: 3
            },
            // when window width is <= 640px
            640: {
                slidesPerView: 4
            },
            // when window width is <= 768px (iPad)
            768: {
                slidesPerView: 5
            },
            // when window width is <= 1024px (iPad Pro)
            1024: {
                slidesPerView: 6
            }
        },
        on: {
            // sliderMove: function () {
                // swiper_contents.setTranslate(this.translate);
            // },
            setTranslate: function () {
                if(this.touches.diff != 0)
                    swiper_contents.setTranslate(this.translate);
            },
            touchStart: function () {
                swiper_contents.touches.diff = 0;
            },
            touchEnd: function () {
                this.touches.diff = 0;
                this.slideTo(this.activeIndex);
                swiper_contents.slideTo(this.activeIndex);
            },
            transitionEnd: function () {
                swiper_contents.slideTo(this.activeIndex);
            }
        }
    });
    var swiper_contents = myApp.swiper('#swiper_contents .swiper-container', {
        scrollbar: {
            el: '#swiper_contents .swiper-scrollbar',
            hide: true,
        },
        spaceBetween: 0,
        breakpoints: {
            // when window width is <= 320px (iPhone5)
            320: {
                slidesPerView: 2
            },
            // when window width is <= 375px (iPhone6)
            375: {
                slidesPerView: 3
            },
            // when window width is <= 640px
            640: {
                slidesPerView: 4
            },
            // when window width is <= 768px (iPad)
            768: {
                slidesPerView: 5
            },
            // when window width is <= 1024px (iPad Pro)
            1024: {
                slidesPerView: 6
            }
        },
        on: {
            // sliderMove: function () {
                // swiper_header.setTranslate(this.translate);
            // },
            setTranslate: function () {
                if(this.touches.diff != 0)
                    swiper_header.setTranslate(this.translate);
            },
            touchStart: function () {
                swiper_header.touches.diff = 0;
            },
            touchEnd: function () {
                this.touches.diff = 0;
                this.slideTo(this.activeIndex);
                swiper_header.slideTo(this.activeIndex);
            },
            transitionEnd: function () {
                swiper_header.slideTo(this.activeIndex);
            }
        }
    });
    
    vue.cssReset();
    // 顯示內容
    $('[data-page="statistic"].page .page-content').css({visibility: 'visible'});
});