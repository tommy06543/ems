myApp.onPageInit('device_edit', function (page) {
    vue = new Vue({
        el: page.container.children[1],
		data: {
			device: globalData.device,
			modify: [],
			readonly: vue_panel.selectedPlant.Readonly == true
		},
        mounted: function () {
        }
    });
    new Vue({
        el: page.container.children[0],
		data: vue._data,
        methods: {
            submit: function() {
                if(formValidate($(page.container).find('form'))) {
                    var data = $('[data-page="device_edit"].page .page-content form').serializeArray();
					_.forEach(data, function(item) {
						if(item.value == 'on')
							item.value = 1;
					});
					$('[data-page="device_edit"].page .page-content form input:checkbox:not(:checked)').map(function() {
						data.push({ name: this.name, value: 0 });
					});
                    data = _.filter(data, function(el) {
						return vue.modify.indexOf(el.name) != -1;
					});
                    data.push({name: 'PlantOID', value: localStorage.PlantOID});
                    $.ajax({
                        method: 'POST',
                        url: serverUrl + '/plant_ajax/form_device/',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        dataType: "json",
                        data: data,
                        retryCount: 3,
                        success : function(response) {
                            ajaxData('device.html', true);
                        }
                    });
                }
            }
        }
    });
});