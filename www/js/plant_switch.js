myApp.onPageInit('plant_switch', function (page) {
	localData = {
		plant_list: globalData.plant_list
	};
    vue = new Vue({
        el: page.container.children[1],
		data: localData,
        methods: {
            plantSwitch: function(plantOID) {
                localStorage.PlantOID = parseInt(plantOID);
                globalData.sensor = null;
                globalData.sensor_data = null;
                vue_panel.resetData();
                ajaxData('main.html', true);
                // mainView.router.load({
                    // url: 'index.html',
                    // reload: true
                // });
            }
        }
    });
});