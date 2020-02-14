myApp.onPageInit('device', function (page) {
    vue = new Vue({
        el: page.container.children[1],
		data: {
            now: moment(),
            readonly: vue_panel.selectedPlant.Readonly == true,
            device: null
        },
		methods: {
			resetData: function() {
				this.device = globalData.device;
			},
		},
        beforeMount: function () {
            autoRefreshDevice(this);
            updateTimestamp(this, "device");
        }
    });
    new Vue({
        el: page.container.children[0],
		data: vue._data
    });
});

autoRefreshDevice = function(vueInstance) {
    if(mainView.activePage.name == "device") {
        ajaxDevice(vueInstance);
        setTimeout(function() {
            autoRefreshDevice(vueInstance);
        }, 30000);
    }
}

ajaxDevice= function(vueInstance) {
    $.ajax({
        method: 'POST',
        url: serverUrl + '/plant_ajax/ajaxDevice/',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
        dataType: "json",
        data: {PlantOID: localStorage.PlantOID},
        retryCount: 3,
        success : function(response) {
            $.each(response, function(key, value){
                globalData[key.toString()] = value;
                $.each(globalData[key.toString()], function(index, item){
                    item.LastUpdate = moment(item.LastUpdate);
                });
            });
            vueInstance.resetData();
        }
    });
}