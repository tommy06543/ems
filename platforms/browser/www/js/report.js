myApp.onPageInit('report', function (page) {
	localData = {
		report: globalData.report
	};
    vue = new Vue({
        el: page.container.children[1],
		data: localData,
		methods: {
			resetData: function() {
				localData.report = globalData.report;
			},
            ajaxReportData: function() {
                var self = this;
                $.ajax({
                    method: 'POST',
                    url: serverUrl + '/plant_ajax/ajaxReportData/',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
                    dataType: "json",
                    data: {},
                    retryCount: 3,
                    success : function(response) {
                        globalData.report = response;
                        self.resetData();
                    }
                });
            }
		},
        beforeMount: function () {
            this.ajaxReportData();
        },
        mounted: function () {
        }
    });
    new Vue({
        el: page.container.children[0]
    });
});