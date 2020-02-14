myApp.onPageInit('alarm', function (page) {
    vue = new Vue({
        el: page.container.children[1],
		data: {
            alarm: panelData.alarm
        },
        methods: {
            setRead: function(item) {
                if(item.Read == 1)
                    return;
                
                item.Read = 1;
                $.ajax({
                    method: 'POST',
                    url: serverUrl + '/plant_ajax/form_alarmRead/',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    dataType: "html",
                    data: {OID: item.OID},
                    retryCount: 3,
                    beforeSend : function() {
                        setTimeout(function() { myApp.hideIndicator(); });
                    },
                    success : function(response) {},
                    error : function() {},
                    complete : function() {}
                });
            }
        }
    });
});