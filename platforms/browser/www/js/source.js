myApp.onPageInit('source', function (page) {
    vue = new Vue({
        el: page.container.children[1],
		data: {
            source: globalData.load_source || null,
            readonly: panelData.selectedPlant.Readonly == true
        },
		methods: {
			resetData: function() {
                this.source = globalData.load_source;
			},
		},
        beforeMount: function () {
            if(!globalData.load_source)
                ajaxSource(this);
        }
    });
    new Vue({
        el: page.container.children[0],
		data: vue._data
    });
});

function ajaxSource(vueInstance) {
    $.ajax({
        method: 'POST',
        url: serverUrl + '/plant_ajax/ajaxSource/',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
        dataType: "json",
        data: {PlantOID: localStorage.PlantOID},
        retryCount: 3,
        success : function(response) {
            globalData.load_source = response;
            _.forEach(globalData.load_source, function(element) {
                element.Readonly = element.UserOID == null || panelData.selectedPlant.Readonly == 1;
            });
            vueInstance.resetData();
        }
    });
}