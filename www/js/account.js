myApp.onPageInit('account', function (page) {
	localData = {
        account: panelData.account,
        newPassword: null
	};
    new Vue({
        el: page.container.children[0],
		data: localData,
        methods: {
            submit: function() {
                if(formValidate($(page.container).find('form'))) {
                    $.ajax({
                        method: 'POST',
                        url: serverUrl + '/plant_ajax/form_account/',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                        dataType: "html",
                        data: $('[data-page="account"].page .page-content form').serializeArray(),
                        retryCount: 3,
                        success : function(response) {
                            notification = myApp.addNotification({
                                title: '訊息',
                                message: '已修改完成。',
                                hold: 5000,
                                closeOnClick: true
                            });
                            mainView.router.back();
                        }
                    });
                }
            }
        }
    });
    vue = new Vue({
        el: page.container.children[1],
		data: localData,
        methods: {
            logout: function() {
                localStorage.removeItem("loginToken");
                myApp.closePanel(false);
                mainView.router.back({
                    url: 'index.html',
                    force: true
                });
                // this.$destroy();
            }
        }
    });
});