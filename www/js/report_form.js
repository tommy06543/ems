myApp.onPageInit('report_form', function (page) {
	localData = {
        readonly: !page.query.OID ? false : Cycle.Readonly
	};
    new Vue({
        el: page.container.children[0],
		data: localData,
        methods: {
            submit: function() {
                var data = $('[data-page="report_form"].page .page-content form').serializeArray();
                data.push({name: 'PlantOID', value: localStorage.PlantOID});
                $.ajax({
                    method: 'POST',
                    url: serverUrl + '/plant_ajax/form_report/',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    dataType: "html",
                    data: data,
                    retryCount: 3,
                    success : function(response) {
                        notification = myApp.addNotification({
                            title: '訊息',
                            message: '已回報並通知管理員，謝謝。',
                            hold: 5000,
                            closeOnClick: true
                        });
                        mainView.router.back({
                            url: 'report.html',
                            force: true
                        });
                    }
                });
            }
        }
    });
    
    $('[data-page="report_form"].page [name="Info"]').css({
        height: $('[data-page="report_form"].page .page-content').height()
    });
});