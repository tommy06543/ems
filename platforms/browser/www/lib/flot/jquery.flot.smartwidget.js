/* Flot plugin for showing crosshairs when the mouse hovers over the plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

    tooltip: {
        show: boolean,
        titleFormat: null or  Moment Format e.g. 'YYYY-MM-DD',
        contents: function(item, opts) {
            return HTML string;
        }, 
        css: {}
    }, 
    crosshair: {
        lock: boolean
    },
    legend: {
        showTitle: boolean,
        titleFormat: null or Moment Format e.g. 'YYYY-MM-DD',
        showValue: boolean
    },
    overlays: null or array of object {
            x: number,
            y: number,
            xaxis: number,
            yaxis: number,
            direction: 'h' or 'v',
            label: string
        }
---

And each series support the following options:
    series: {
        interpolate: null or 'left' or 'right',
        digitalTitle: null or [False string, True string],
        float: number,
        unit: null or string
    }
*/

(function ($) {
    var options = {
        tooltip: {
            show: false,
            titleFormat: null,
            contents: function(item, opts) {
                var x = item.datapoint[0], y = item.datapoint[1];
                return (opts.tooltip.titleFormat ? moment(x, "x").format(opts.tooltip.titleFormat) : x) + "<br />" + item.series.label + " = " + (!y ? '無' : (item.series.digitalTitle ? item.series.digitalTitle[y] : (y.toFixed(item.series.float ? item.series.float : 2) + (item.series.unit ? item.series.unit : ''))));
            }, 
            css: {
                position: "absolute", 
                display: "none", 
                border: "1px solid #fdd", 
                padding: "2px", 
                "background-color": "#fee", 
                opacity: 0.8, 
                'pointer-events': 'none'
            }
        }, 
        crosshair: {
            lock: false
        },
        legend: {
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            showTitle: false,
            titleFormat: null,
            showValue: false
        },
        overlays: null
    };
    
    function init(plot) {
        var placeholder = plot.getPlaceholder(), opts = plot.getOptions();
    
        // hover功能
        placeholder.off("plotclick plothover").on("plotclick plothover", function (event, pos, item) {
            if(item) {
                // crosshair吸附
                if(opts.crosshair.lock === true) {
                    pos.x = item.datapoint[0];
                    pos.y = item.datapoint[1];
                    plot.lockCrosshair({ x: item.datapoint[0], y: item.datapoint[1] });
                }

                // tooltip
                if(opts.tooltip.show === true) {
                    $("#flotTooltip_" + placeholder[0].id).html(opts.tooltip.contents(item, opts)).show();
                    // Tooltip position within canvas
                    if(pos.x > (item.series.xaxis.max + item.series.xaxis.min) / 2) // Right
                        $("#flotTooltip_" + placeholder[0].id).css({right: plot.getCanvas().offsetWidth - (item.pageX - plot.offset().left + plot.getPlotOffset().left) + 5, left: ''});
                    else    // Left
                        $("#flotTooltip_" + placeholder[0].id).css({left: item.pageX - plot.offset().left + plot.getPlotOffset().left + 5, right: ''});
                    if(pos.y > (item.series.yaxis.max + item.series.yaxis.min) / 2) // Top
                        $("#flotTooltip_" + placeholder[0].id).css({top: item.pageY - plot.offset().top + plot.getPlotOffset().top, bottom: ''});
                    else    // Bottom
                        $("#flotTooltip_" + placeholder[0].id).css({bottom: plot.getCanvas().offsetHeight - (item.pageY - plot.offset().top + plot.getPlotOffset().top), top: ''});
                }
            } else {
                if(opts.crosshair.lock === true)
                    plot.unlockCrosshair();
                if(opts.tooltip.show === true)
                    $("#flotTooltip_" + placeholder[0].id).hide();
            }
          
            // Legend
            if(opts.legend.show === true) {
                var axes = plot.getAxes(), xAxes = plot.getXAxes(), yAxes = plot.getYAxes();
                for(var i = 0; i < xAxes.length; i++) {
                    if(pos['x' + (i + 1)] < xAxes[i].min || pos['x' + (i + 1)] > xAxes[i].max)
                        return;
                }
                for(var i = 0; i < yAxes.length; i++) {
                    if(pos['y' + (i + 1)] < yAxes[i].min || pos['y' + (i + 1)] > yAxes[i].max)
                        return;
                }
                
                // Legend視窗位置與滑鼠位置左右相反
                if(pos.x > (axes.xaxis.max + axes.xaxis.min) / 2)
                  placeholder.find("table").css({left: plot.getPlotOffset().left + 5, right: ''});
                else
                  placeholder.find("table").css({right: plot.getPlotOffset().right + 5, left: ''});

                // 顯示X軸數值為標題
                if(opts.legend.showTitle === true)
                    $("#legendTitle_" + placeholder[0].id).html(opts.legend.titleFormat ? opts.legend.titleFormat(pos.x) : pos.x);
                
                if(opts.legend.showValue === true) {
                    var lengthIndex = 0, dataset = plot.getData();
                    for(var i = 0; i < dataset.length; ++i) {
                        var series = dataset[i];

                        if(series.data.length > 0) {
                            var y = null;
                            // Find the nearest points, x-wise
                            for (var j = 0; j < series.data.length; ++j) {
                                if (series.data[j][0] < pos.x)
                                    continue;
                                
                                if (series.data[j][0] == pos.x) // Hover an item
                                    y = parseFloat(series.data[j][1]);
                                else {
                                    // Now Interpolate
                                    var p1 = series.data[j - 1], p2 = series.data[j];

                                    if (p1 == null || series.interpolate === "right")
                                        y = parseFloat(p2[1]);
                                    else if (p2 == null || series.interpolate === "left")
                                        y = parseFloat(p1[1]);
                                    else if(series.interpolate === true)
                                        y = parseFloat(p1[1]) + (parseFloat(p2[1]) - parseFloat(p1[1])) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                                }
                                
                                break;
                            }

                            placeholder.find(".legendLabel").eq(lengthIndex).text(series.label + " = " + (y == null ? '無' : (
                            series.digitalTitle ? series.digitalTitle[y] : 
                            (y.toFixed(series.float ? series.float : 2) + " " + (series.unit ? series.unit : ''))
                            )));
                            lengthIndex++;
                        } else if(series.label) {
                            placeholder.find(".legendLabel").eq(lengthIndex).text(series.label + " = 無");
                            lengthIndex++;
                        }
                    }
                }
            }
        }).off("plotselected").on("plotselected", function (event, ranges) {
            if(opts.selection.mode != null) {
                // clamp the zooming to prevent eternal zoom
                if (ranges.xaxis.to - ranges.xaxis.from < 0.00001) {
                    ranges.xaxis.to = ranges.xaxis.from + 0.00001;
                }
                if (ranges.yaxis.to - ranges.yaxis.from < 0.00001) {
                    ranges.yaxis.to = ranges.yaxis.from + 0.00001;
                }

                // do the zooming
                $.each(plot.getXAxes(), function(_, axis) {
                    var opts = axis.options;
                    opts.min = ranges.xaxis.from;
                    opts.max = ranges.xaxis.to;
                });
                plot.setupGrid();
                plot.draw();
                plot.clearSelection();
            }
		});
        
        function draw() {
            $(".flot-smartwidget-" + placeholder[0].id).remove();
            // Tooltip
            if(opts.tooltip.show === true)
                $("<div id='flotTooltip_" + placeholder[0].id + "' class='flot-smartwidget-" + placeholder[0].id + "'></div>").css(opts.tooltip.css).appendTo("#" + placeholder[0].id);
            
            // Legend
            if(opts.legend.show === true) {
                placeholder.find(".legend > div").remove();
                placeholder.find(".legend table").css('background-color', opts.legend.backgroundColor);
                placeholder.find(".legendColorBox").css('width', 14);
                // 顯示X軸標題
                if(opts.legend.showTitle === true && $.find('#legendTitle_' + placeholder[0].id).length == 0) {
                    placeholder.find("tbody").prepend('<tr><td colspan="2" style="padding-bottom:5px"><span id="legendTitle_' + placeholder[0].id + '" class="label label-primary"></span></td></tr>');
                }
            }
            
            // 線條與標記
            if(opts.overlays) {
                for(var i = 0; i < opts.overlays.length; i++) {
                    var item = opts.overlays[i];
                    if(item.direction == 'h')
                        placeholder.append("<div class='flot-smartwidget-" + placeholder[0].id + "' style='position:absolute; left:" + plot.getPlotOffset().left + "px; right:" + plot.getPlotOffset().right + "px; top:" + plot.pointOffset(item).top + "px; color:#666; border-top:1px solid; font-size:smaller; pointer-events:none'><i class='fa fa-caret-up fa-fw' aria-hidden='true'></i>" + item.label + "</div>");
                    else if(item.direction == 'v')
                        placeholder.append("<div class='flot-smartwidget-" + placeholder[0].id + "' style='position:absolute; top:" + plot.getPlotOffset().top + "px; bottom:" + plot.getPlotOffset().bottom + "px; left:" + plot.pointOffset(item).left + "px; color:#666; border-left:1px solid; font-size:smaller; pointer-events:none'><i class='fa fa-caret-left fa-fw' aria-hidden='true'></i>" + item.label + "</div>");
                }
            }
        }
        
        plot.checkSelection = function() {
            var isSelected = false;
            $.each(plot.getXAxes(), function(_, axis) {
                isSelected = isSelected || (axis.datamin != null && axis.min != axis.datamin) || (axis.datamax != null && axis.max != axis.datamax);
            });
            return isSelected;
        }
        
        plot.resetRange = function() {
            $.each(plot.getXAxes(), function(_, axis) {
                var opts = axis.options;
                opts.min = axis.datamin;
                opts.max = axis.datamax;
            });
            plot.setupGrid();
            plot.draw();
            plot.clearSelection();
        }
        
        plot.hooks.draw.push(draw);
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'smartwidget',
        version: '1.0'
    });
})(jQuery);