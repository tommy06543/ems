var serverUrl = "http://ems.shh.tw";
var globalData = {}, localData, vue_panel, vue, calendarPicker, notification, formChanged;
var h = $(window).height();
var panelData = {
    account: null,
    alarm: [],
    plant_list: null,
    selectedPlant: null
};
moment.tz.setDefault("Asia/Taipei");
moment.locale('zh-tw');

// 判斷平台並修改樣式
if (Framework7.prototype.device.android) {
    $('<link rel="stylesheet" href="lib/framework7/css/framework7.material.min.css">' + '<link rel="stylesheet" href="lib/framework7/css/framework7.material.colors.min.css">').prependTo('head');
} else {
    $('.pages.navbar-fixed').removeClass('navbar-fixed').addClass('navbar-through');
    $('.page .navbar').prependTo('.view');
    $('<link rel="stylesheet" href="lib/framework7/css/framework7.ios.min.css">' + '<link rel="stylesheet" href="lib/framework7/css/framework7.ios.colors.min.css">').prependTo('head');
}

// Initialize app
var myApp = new Framework7({
    // init: false, //Disable App's automatic initialization
    material: Framework7.prototype.device.android,
    swipeBackPage: false,
    // swipePanel: 'left',
    // swipePanelActiveArea: 20,
    smartSelectOpenIn:'popup',
    smartSelectBackText: '返回',
    onPageAfterAnimation: function (app, page) {
        formChanged = false;
        $(page.container).find('form input, form select, form textarea').change(function() {
            formChanged = true;
        });
        $(page.container).find('.back').removeClass('back').click(function() {
            backFormCheck();
        });
        $(page.container).find('a').each(function() {
            var self = this;
            $(this).prop('router', $(this).prop('href')).removeAttr('href').click(function() {
                mainView.router.load({
                    content: localStorage.getItem(self.router)
                });
            })
        });
        
        // myApp.hideIndicator();
    }
});

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    // dynamicNavbar: true
});

Vue.mixin({
    methods: {
        route: function(url) {
            var path = url.split("?")[0];
            var query = {};
            if(url.split("?").length > 1) {
                _.forEach(url.split("?")[1].split("&"), function(el) {
                    query[el.split("=")[0]] = el.split("=")[1];
                });
            }
            
            if(!localStorage[path]){
                notification = myApp.addNotification({
                    title: '訊息',
                    message: '資料同步中，請稍後..',
                    closeIcon: false,
                    button: {}
                });

                $.ajax({
                    method: 'GET',
                    url: 'http://mobile.shh.tw/' + path,
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    dataType: "html",
                    retryCount: 3,
                    success : function(response) {
                        myApp.closeNotification(notification);
                        localStorage[path] = response;
                        mainView.router.load({
                            content: localStorage.getItem(path),
                            query: query
                        });
                    }
                });
            } else
                mainView.router.load({
                    content: localStorage.getItem(path),
                    query: query
                });
        }
    }
})

myApp.onPageInit('index', function (page) {
    if(!vue_panel) {
        $.ajax({
            method: 'GET',
            url: 'http://mobile.shh.tw/panel.html',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            dataType: "html",
            retryCount: 3,
            success : function(response) {
                $(".panel").html(response);
                vue_panel = new Vue({
                    el: '.panel',
                    data: panelData,
                    methods: {
                        resetData: function() {
                            panelData.account = globalData.account ? globalData.account : null;
                            panelData.alarm = globalData.alarm ? globalData.alarm : null;
                            panelData.plant_list = globalData.plant_list ? globalData.plant_list : null;
                            panelData.selectedPlant = globalData.plant_list ? _.find(globalData.plant_list, {PlantOID: localStorage.PlantOID}) : null;
                        }
                    }/* ,
                    beforeMount: function () {
                        $(".panel").find('a').each(function() {
                            var self = this;
                            $(this).prop('router', $(this).prop('href')).removeAttr('href').click(function() {
                                mainView.router.load({
                                    content: localStorage.getItem(self.router)
                                });
                            })
                        });
                    } */
                });
            }
        });
    }

    vue = new Vue({
        el: '[data-page="index"].page .page-content',
		data: { logged: localStorage.getItem('loginToken') != null }
    });

    $('.form-to-data').on('click', function(){
        // 手動登入
        $.ajax({
            method: 'POST',
            url: serverUrl + '/plant_ajax/',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            dataType: "json",
            data: {RegID: localStorage.regID, loginToken: btoa($('[data-page="index"].page [name="Account"]').val() + ":" + $('[data-page="index"].page [name="Password"]').val()), login: 1},
            retryCount: 3,
            beforeSend : function() {
                setTimeout(function() { myApp.showPreloader('登入中..'); });
            },
            success : function(response) {
                if(response.loginToken == "False") {
                    notification = myApp.addNotification({
                        title: '錯誤',
                        message: '登入失敗。請檢查帳號密碼是否正確。',
                        hold: 3000,
                        closeOnClick: true
                    });
                } else if(response.loginToken == "Over") {
                    notification = myApp.addNotification({
                        title: '錯誤',
                        message: '登入失敗。<br/>您的網路IP位置已於30分內嘗試超過10次。',
                        hold: 3000,
                        closeOnClick: true
                    });
                } else {
                    localStorage.loginToken = response.loginToken;
                    loginSuccessful(response);
                }
            },
            complete : function() {
                myApp.hidePreloader();
            }
        });
    });
}).trigger();

myApp.onPageAfterAnimation('index', function (page) {
    setTimeout(function() {
        // $('#logo').height(window.outerHeight / 3);
        $("body").css({visibility: 'initial'});
        // $('[data-page="index"].page .page-content').css({'padding-top': ($('[data-page="index"].page .page-content').height() - $('[data-page="index"].page .page-content .login-screen-title').height() - $('[data-page="index"].page .page-content form').height()) / 2});
        // $('#logo').height($('[data-page="index"].page').height() / 3);
        // setTimeout(function() { $('#logo').height($('[data-page="index"].page .page-content').height() / 3); });

        setTimeout(function() {
            if(localStorage.loginToken) {
                // 自動登入
                $.ajax({
                    method: 'POST',
                    url: serverUrl + '/plant_ajax/',
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    dataType: "json",
                    data: {RegID: localStorage.regID, login: 1},
                    retryCount: 3,
                    beforeSend : function() {
                        setTimeout(function() { myApp.showPreloader('登入中..'); });
                    },
                    success : function(response) {
                        if(response.loginToken == "False")
                            localStorage.removeItem("loginToken");
                        else if(response.loginToken == localStorage.loginToken) {
                            loginSuccessful(response);
                        }
                    },
                    complete : function() {
                        myApp.hidePreloader();
                    }
                });
            }
        }, 1000);
    });
}).trigger();

function loginSuccessful(response) {
    globalData.account = response.account;
    globalData.alarm = response.alarm;
    _.forEach(globalData.alarm, function(element) {
        element.Read = parseInt(element.Read);
    });
    globalData.plant_list = response.plant_list;
    localStorage.PlantOID = localStorage.PlantOID && _.find(globalData.plant_list, {PlantOID: localStorage.PlantOID}) ? localStorage.PlantOID : globalData.plant_list[0].PlantOID;
    // mobileVersion
    if(!localStorage.mobileVersion || moment(response.mobileVersion).isAfter(moment(localStorage.mobileVersion))) {
        for (var i = 0; i < localStorage.length; i++){
            if(localStorage.key(i).indexOf(".html") != -1) {
                localStorage.removeItem(localStorage.key(i));
                i--;
            }
        }
        localStorage.mobileVersion = response.mobileVersion;
    }
    vue_panel.resetData();
    setTimeout(function() { ajaxData('main.html'); });
}

function ajaxData(url, back = false) {
    notification = myApp.addNotification({
        title: '訊息',
        message: '資料同步中，請稍後..',
        closeIcon: false,
        button: {}
    });

    $.ajax({
        method: 'POST',
        url: serverUrl + '/plant_ajax/ajaxData/',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        dataType: "json",
        data: {PlantOID: localStorage.PlantOID},
        retryCount: 3,
        success : function(response) {
            myApp.closeNotification(notification);
            $.each(response, function(key, value){
                globalData[key.toString()] = value;
            });
            _.forEach(globalData.load_cycle, function(element) {
                element.Readonly = moment(element.EndDate).add(10, 'days').isBefore(moment()) || panelData.selectedPlant.Readonly == 1;
            });
            if(!back)
                mainView.router.load({
                    url: url,
                    reload: true
                });
            else
                mainView.router.back({
                    url: url,
                    force: true
                });
        }
    });
}

function formValidate(formElement) {
    var valid = true;
    _.forEachRight(formElement.find('[required]'), function(el) {
        if(el.value == "") {
            valid = false
            el.focus();
            if(Framework7.prototype.device.android)
                $(el).parent().addClass('required');
            else
                $(el).parent().parent().addClass('required');
        } else {
            if(Framework7.prototype.device.android)
                $(el).parent().removeClass('required');
            else
                $(el).parent().parent().removeClass('required');
        }
    })
    _.forEachRight(formElement.find('[validate]'), function(el) {
        if(el.value != $('[name="' + $(el).prop('validate') + '"]').val()) {
            valid = false
            el.focus();
            if(Framework7.prototype.device.android)
                $(el).parent().addClass('required');
            else
                $(el).parent().parent().addClass('required');
        } else {
            if(Framework7.prototype.device.android)
                $(el).parent().removeClass('required');
            else
                $(el).parent().parent().removeClass('required');
        }
    })
    if(!valid) {
        notification = myApp.addNotification({
            title: '訊息',
            message: '有欄位尚未完成正確填寫',
            hold: 5000,
            closeIcon: false,
            closeOnClick: true
        });
    }
    return valid;
}

function backFormCheck() {
    if(formChanged) {
        myApp.modal({
            title: '訊息',
            text: '資料尚未儲存，確定離開？',
            buttons: [{
                text: '取消'
            },{
                text: '確定',
                onClick: function () {
                    mainView.router.back();
                }
            }]
        });
    } else
        mainView.router.back();
}

function updateTimestamp(vueInstance, page) {
    if(mainView.activePage.name == page) {
        vueInstance.now = moment();
        setTimeout(function() {
            updateTimestamp(vueInstance, page);
        }, 1000);
    }
}

// Handle Cordova Device Ready Event
$(document).on('deviceready', function() {
    // Push notification
    var push = PushNotification.init({
        "android": {
            forceShow: true
        },
        "browser": {
            pushServiceURL: 'http://push.api.phonegap.com/v1/push'
        },
        "ios": {
            alert: true,
            badge: true,
            sound: false
        },
        "windows": {}
    });
    push.on('registration', function(data) {
        localStorage.regID = data.registrationId;
    });
    push.on('notification', (data) => {
        alert('notification');
        alert(data.message);
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
    });
    push.on('error', (e) => {
        alert('error');
        alert(e.message);
        // e.message
    });
    
    // Android 返回鍵
    document.addEventListener("backbutton", function() {
        if ($('body').hasClass('with-panel-left-cover'))    // Panel
            myApp.closePanel();
        else if (calendarPicker && calendarPicker.opened) // 日曆
            calendarPicker.close();
        else if ($('.modal-in').length > 0)    // Modal
            myApp.closeModal();
        else if(mainView.activePage.name == 'main') { // 已在首頁
            myApp.modal({
                title: '訊息',
                text: '確定結束應用程式嗎？',
                buttons: [{
                    text: '取消'
                },{
                    text: '確定',
                    onClick: function () {
                        navigator.app.exitApp();;
                    }
                }]
            });
        } else    // 上一頁
            backFormCheck();
    }, false);
}).ajaxStart(function() {
    setTimeout(function() { myApp.showIndicator(); });
}).ajaxSend(function( event, jqxhr, settings ) {
    if(settings.method == "POST" && settings.data.indexOf('loginToken') == -1)
        settings.data += "&loginToken=" + localStorage.loginToken;
}).ajaxError(function(event, jqxhr, settings, thrownError) {
    notification = myApp.addNotification({
        title: '錯誤',
        message: '連線失敗，重新嘗試中..(' + settings.retryCount + ')',
        hold: 5000,
        closeOnClick: true
    });
    if (settings.retryCount--)
        $.ajax(settings);
}).ajaxComplete(function() {
    setTimeout(function() { myApp.hideIndicator(); });
});

// Android 虛擬鍵盤偏移
$(window).resize(function() {
    if($(":focus").length > 0 && $(":focus").offset().top > h - $(window).height())
        $(mainView.activePage.container).find('.page-content').scrollTop($(mainView.activePage.container).find('.page-content').scrollTop() + h - $(window).height());
});