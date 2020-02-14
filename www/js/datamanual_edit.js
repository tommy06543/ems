myApp.onPageInit('datamanual_edit', function (page) {
   //var load_cycle = _.find(globalData.load_cycle, {PlantOID: parseInt(page.query.PlantOID) , StartDate: page.query.StartDate});
     
   vue = new Vue({
        el: page.container.children[2],
		data: {
            PlantOID: page.query.PlantOID, 
            StartDate: page.query.StartDate,
            PeriodDays: page.query.PeriodDays,   
            
            load_cycle_data: globalData.load_cycle_data,
            readonly: false// !page.query.SourceOID ? false : Source.Readonly
        },
		methods: {
			resetData: function() {                 
				this.load_cycle_data = globalData.load_cycle_data;
			},
            ajaxCycleData: function() {                 
                    var self = this;
                    $.ajax({
                        method: 'POST',
                        url: serverUrl + '/plant_ajax/ajaxCycleData/',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
                        dataType: "json", 
                       // data: {PlantOID: load_cycle.PlantOID, StartDate:load_cycle.StartDate,PeriodDays:load_cycle.PeriodDays },  
					    data: {PlantOID: page.query.PlantOID, StartDate:page.query.StartDate,PeriodDays:page.query.PeriodDays },  
                        retryCount: 3,
                        success : function(response) {
                            globalData.load_cycle_data = response;
                            self.resetData();
                        }
                    });
              
            }
		},
        beforeMount: function () {
            this.ajaxCycleData();
        }
    });
    
    new Vue({
        el: page.container.children[0],
		data: vue._data,
      //  data2: vue.cycle_data;
        methods: {
             submit: function() {
                if(formValidate($(page.container).find('form'))) {
                    var data = $('[data-page="datamanual_edit"].page .page-content form').serializeArray();
                    var y = data.length;
                    data.push({name: 'length', value: data.length});
                    data.push({name: 'PlantOID', value: localStorage.PlantOID});  
                    var i;
                    for(i = 0; i <  y ; i++){
                      data.push({name: 'D'+i.toString() , value: data[i].name});   
                    };
                    $.ajax({
                        method: 'POST',
                        url: serverUrl + '/plant_ajax/form_cycle2/',    
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        dataType: "html",
                        data: data,
                        retryCount: 3,
                        success : function(response) {
                            ajaxData('DataManual.html', true);
                        }
                    });
                } 
            }
        }
    }); 
});