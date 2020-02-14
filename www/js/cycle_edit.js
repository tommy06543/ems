myApp.onPageInit('cycle_edit', function (page) {
    var Cycle = _.find(globalData.load_cycle, {OID: parseInt(page.query.OID)});
	localData = {
		cycle: page.query.OID ? Cycle : null,
		source: globalData.load_source,
        readonly: !page.query.OID ? false : Cycle.Readonly
	};
    new Vue({
        el: page.container.children[0],
		data: localData,
        methods: {
            submit: function() {
                if(formValidate($(page.container).find('form'))) {
                    var data = $('[data-page="cycle_edit"].page .page-content form').serializeArray();
                    data.push({name: 'PlantOID', value: localStorage.PlantOID});
                    $.ajax({
                        method: 'POST',
                        url: serverUrl + '/plant_ajax/form_cycle/',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        dataType: "html",
                        data: data,
                        retryCount: 3,
                        success : function(response) {
                            ajaxData('cycle.html', true);
                        }
                    });
                }
            }
        }
    });
    vue = new Vue({
        el: page.container.children[1],
		data: localData,
        mounted: function () {
            calendarPicker = myApp.calendar({
                input: '[data-page="cycle_edit"].page .page-content [name="StartDate"]',
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月' , '九月' , '十月', '十一月', '十二月'],
                dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
                dateFormat: 'yyyy-mm-dd',
                // direction: 'vertical',
                firstDay: 0,
                closeOnSelect: true,
                value: page.query.OID ? [this.cycle.StartDate] : null,
                minDate: !page.query.OID && globalData.load_cycle.length == 0 || page.query.OID && globalData.load_cycle.length == 1 ? null : moment(globalData.load_cycle[page.query.OID && globalData.load_cycle.length >= 2 ? 1 : 0].EndDate).add(1, 'days').toDate(),
                toolbarCloseText: '確定'
            });
            calendarPicker2 = myApp.calendar({
                input: '[data-page="cycle_edit"].page .page-content [name="Medicine"]',
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月' , '九月' , '十月', '十一月', '十二月'],
                dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
                dateFormat: 'yyyy-mm-dd',
                // direction: 'vertical',
                firstDay: 0,
                closeOnSelect: true,
                value: page.query.OID ? [this.cycle.Medicine] : null,
                minDate: !page.query.OID && globalData.load_cycle.length == 0 || page.query.OID && globalData.load_cycle.length == 1 ? null : moment(globalData.load_cycle[page.query.OID && globalData.load_cycle.length >= 2 ? 1 : 0].EndDate).add(1, 'days').toDate(),
                toolbarCloseText: '確定'
            });
        }
    });
});