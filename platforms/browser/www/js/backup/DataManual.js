myApp.onPageInit('DataManual', function (page) {
    vue = new Vue({
        el: page.container.children[1],
		data: {
            cycle: globalData.load_cycle,
            source: globalData.load_source || null,
            readonly: vue_panel.selectedPlant.Readonly == true,
            allowAdd: false //!(globalData.load_cycle.length >= 1 && moment(globalData.load_cycle[0].EndDate).isAfter(moment()))
        },
		methods: {
			resetData: function() {
				this.cycle = globalData.load_cycle;	
                this.source = globalData.load_source;									
			},
		},
        beforeMount: function () {
          //  if(!globalData.load_source)
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