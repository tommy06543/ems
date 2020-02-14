myApp.onPageInit('main', function (page) {
    new Vue({
        el: page.container.children[0],
		data: panelData
    });
    vue = new Vue({
        el: page.container.children[1],
        data: {
            now: globalData.now,
            cycle: null,
            cycle_data: null,
            lastUpdate: null
        },
        methods: {
            resetData: function() {
                var self = this;
                this.cycle = _.find(globalData.load_cycle, function(o) { return moment(o.StartDate) <= moment(); });
                this.cycle_data = globalData.load_cycle_data.length > 0 ? _.findLast(globalData.load_cycle_data, function(item) { return moment(item.Date).isBetween(self.cycle.StartDate, self.cycle.EndDate, null, '[]') && moment(item.Date + ' ' + self.cycle.DailyConclude).isBefore(moment()); }) : null;
                this.lastUpdate = this.cycle_data ? moment(this.cycle_data.LastUpdate) : null;
                if(globalData.load_cycle_data.length > 0)
                    setTimeout(function () { self.initChartMain(); });
            },
            initChartMain: function () {
                var self = this;
                var dataWeightGain = [], dataWeightStd = [], dataWeight = [], dayLimit = 7;
                $.each(globalData.load_cycle_data, function(index, item) {
                    if(moment(item.Date).isBetween(self.cycle.StartDate, self.cycle.EndDate, null, '[]') && moment(item.Date + ' ' + self.cycle.DailyConclude).add(1, 'hours').isBefore(moment())) {
                        dataWeight.push([moment(item.Date), parseFloat(item.Weight || 0)]);
                        dataWeightStd.push([moment(item.Date), parseFloat(item.WeightStd)]);
                    }
                    if(moment(item.Date).isBetween(self.cycle.StartDate, self.cycle.EndDate, null, '(]') && moment(item.Date + ' ' + self.cycle.DailyConclude).add(1, 'hours').isBefore(moment())) {
                        dataWeightGain.push([moment(item.Date), parseFloat(item.WeightGain || 0)]);
                    }
                });
                plotMain = $.plot("#chartMain", [{
                        label: "增重", 
                        unit: "g", 
                        float: 2, 
                        data: dataWeightGain.slice(Math.max(0, dataWeightGain.length - dayLimit)), 
                        bars: { 
                            show: true, 
                            barWidth: 12 * 60 * 60 * 1000, 
                            fillColor: { colors: [{opacity: 0.8}, {opacity: 0.1}] }, 
                            align: "center"
                        }, 
                        yaxis: 2, 
                        color: "#169eee"
                    }, {
                        label: "標準重", 
                        unit: "g", 
                        float: 0, 
                        data: dataWeightStd.slice(Math.max(0, dataWeightStd.length - dayLimit)), 
                        lines: { show: true, lineWidth: 7 }, 
                        points: { show: true, radius: 5 }, 
                        color: 89
                    }, {
                        label: "毛雞重", 
                        unit: "g", 
                        float: 2, 
                        data: dataWeight.slice(Math.max(0, dataWeight.length - dayLimit)), 
                        lines: { show: true, lineWidth: 3 }, 
                        points: { show: true, radius: 5 }, 
                        color: 92
                    }
                ], {
                    series: { shadowSize: 0 }, 
                    xaxis: { mode: "time", timezone: "browser", ticks: 3 },
                    // yaxes: [ {}, { axisLabel: '增重', position: "right" } ], 
                    yaxes: [ {}, { position: "right" } ], 
                    grid: { borderWidth: 0, hoverable: true, clickable: true },
                    legend: { position: "nw" },
                    tooltip: {
                        show: true,
                        contents: function(item) {
                            var timestamp = moment(moment(parseFloat(item.datapoint[0])).format('YYYY-MM-DD' + " " + self.cycle.DailyConclude));
                            // if(item.series.label == '增重')
                                // timestamp.subtract(1, 'days');
                            return timestamp.format("YYYY-MM-DD HH:mm") + ' ~ ' + moment.min(moment(timestamp).add(1, 'day'), moment(moment().format("YYYY-MM-DD HH:00"))).subtract(1, 'seconds').format("YYYY-MM-DD HH:mm") + "<br />" + item.series.label + ": " + item.datapoint[1].toFixed(item.series.float) + item.series.unit;
                        }
                    }
                });
                // 增重Y軸標題
                $("#chartMain .flot-y2-axis,.y2axisLabel").css('color', "#169eee");
            }
        },
        beforeMount: function () {
            this.resetData();
            updateTimestamp(this, 'main');
        }
    });
});