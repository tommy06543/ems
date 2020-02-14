myApp.onPageInit('datamanual', function (page) {	
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

