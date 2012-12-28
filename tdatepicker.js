/**
 * @name    tDatePicker
 * @author  Travis
 * @website http://travisup.com/
 */
(function(window, undefined) {
    // 日期选择框样式
    var style = '.tdp-box.tdp-box table,.tdp-box tr,.tdp-box th,.tdp-box td{padding:0;margin:0}.tdp-box{width:176px;margin:0;padding:0;font:12px/24px Tahoma,Arial,"SimSun";box-shadow:1px 2px 2px rgba(0,0,0,0.2)}.tdp-box table{border-collapse:collapse;border-spacing:0}.tdp-week th,.tdp-days td,.tdp-btns td{height:24px;width:24px;border:1px solid #ccc;text-align:center}.tdp-top{height:26px;margin:0;padding:0;border:1px solid #ccc;border-bottom:none;overflow:hidden;*zoom:1}.tdp-prev,.tdp-next{float:left;width:24px;height:20px;font:bold 12px/26px serif;text-align:center;cursor:pointer}.tdp-next{float:right}.tdp-y,.tdp-m{float:left;height:20px;width:44px;margin:2px 0 0 25px;padding:0;border:1px solid #eee;line-height:20px;text-align:center;outline:0;cursor:pointer}.tdp-m{width:28px;margin-left:0}.tdp-day,.tdp-clear,.tdp-today,.tdp-cancel{cursor:pointer}';
    
    // 日期选择框
    var selectBox = '<div class="tdp-box"><div class="tdp-top"><span class="tdp-prev">&lt;</span><input type="text"class="tdp-y"/><input type="text"class="tdp-m"/><span class="tdp-next">&gt;</span></div><table class="tdp-main"><thead class="tdp-week"><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thead><tbody class="tdp-days"></tbody><tfoot class="tdp-btns"><tr><td>T</td><td colspan="2"class="tdp-clear">清空</td><td colspan="2"class="tdp-today">今天</td><td colspan="2"class="tdp-cancel">取消</td></tr></tfoot></table></div>';
    
    // 主题样式
    var theme = {
        grey: '.tdp-box{color:#333;background:#f5f5f5}.tdp-top{background:#eee;}.tdp-y,.tdp-m{background:#eee;border-color:#eee}.tdp-y:focus,.tdp-m:focus{border-color:#aaa;background:#fff}.tdp-day:hover{background:#666;color:#fff}.tdp-cur{background:#333;color:#fff}',
        white: '.tdp-box{color:#333;background:#fff}.tdp-top{background:#f7f7f7}.tdp-y,.tdp-m{background:#f7f7f7;border-color:#f7f7f7}.tdp-y:focus,.tdp-m:focus{border-color:#aaa;background:#fff}.tdp-day:hover{background:#999;color:#fff}.tdp-cur{background:#666;color:#fff}',
        skyblue: '.tdp-box{color:#08c;background:#fff}.tdp-top{background:#b7dffb;border-color:#86ccfe}.tdp-week th,.tdp-days td,.tdp-btns td{border-color:#86ccfe}.tdp-y,.tdp-m{background:#b7dffb;border-color:#b7dffb;color:#076ab1}.tdp-y:focus,.tdp-m:focus{border-color:#08c;background:#fff}.tdp-day:hover{background:#b7dffb}.tdp-cur{background:#3af;color:#fff}'
    };
    
    var elem = null,
        pickerElem = null,
        pickeId = "tDatePicker",
        isInit = false;
    
    var months= [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        y = 1970, m = 0, d = 1;
    
    var option = {
        theme: "grey",
        minYear: 1900,
        maxYear: 2099
    };
    
    // 获得元素基于文档位置
    var elemOffset = function() {
        var box = {top: 0, left: 0};
        
        if(!elem || elem.nodeType !== 1) {
            return box;
        }
        
        var clientTop, clientLeft, scrollTop, scrollLeft,
            doc = elem && elem.ownerDocument,
            docElem = doc.documentElement,
            docBody = doc.body;
        
        if(typeof elem.getBoundingClientRect !== "undefined") {
            box = elem.getBoundingClientRect();
        }
        clientTop  = docElem.clientTop  || docBody.clientTop  || 0;
        clientLeft = docElem.clientLeft || docBody.clientLeft || 0;
        scrollTop  = window.pageYOffset || docElem.scrollTop;
        scrollLeft = window.pageXOffset || docElem.scrollLeft;
        return {
            top: box.top  + scrollTop  - clientTop,
            left: box.left + scrollLeft - clientLeft
        };
    };
    
    // 添加监听事件
    var addEvent = function(el, type, handler) {
        var eventHandler = handler;
        if(window.addEventListener) {
            el.addEventListener(type, handler, false);
        } else if (document.attachEvent) {
            el.attachEvent("on" + type, handler);
        }
    };
    
    // 删除监听事件
    var removeEvent = function(el, type, handler) {
        if(window.removeEventListener) {
            el.removeEventListener(type, handler, false);
        } else if (document.detachEvent) {
            el.detachEvent("on" + type, handler);
        }
    };
    
    // 初始化当前日期
    var currentDate = function() {
        var cDate = new Date();
        return {
            year: cDate.getFullYear(),
            month: cDate.getMonth(),
            day: cDate.getDate()
        };
    };
    
    var setLeapYear = function(year) {
        if(year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0)) {
            months[1] = 29;
        } else {
            months[1] = 28;
        }
    };
    
    var drawDays = function() {
        var sign = 1,
            days = "",
            week = new Date(y, m, 1).getDay(),
            tr, td,
            tbody = pickerElem.getElementsByTagName("tbody")[0];
			
        setLeapYear(y);
        
        if(d > months[m]) {
            d = months[m];
        }
        
        // clear tbody
        for(var i = tbody.childNodes.length - 1; i >= 0; i--) {
            tbody.removeChild(tbody.childNodes[i]);
        }
        
        tr = document.createElement("tr");
        for(var i = 0; i < 7; i++) {
            td = document.createElement("td");
            if(i < week) {
                td.className = "tdp-empty";
            } else {
                td.className = "tdp-day" + (sign == d ? " tdp-cur": "");
                if(td.textContent) {
                    td.textContent = sign++;
                } else {
                    td.innerText = sign++;
                }
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);

        while(sign <= months[m]) {
            tr = document.createElement("tr");
            for(var i = 0; i < 7; i++) {
                td = document.createElement("td");
                if(sign <= months[m]) {
                    td.className = "tdp-day" + (sign == d ? " tdp-cur": "");
                    if(td.textContent) {
                        td.textContent = sign++;
                    } else {
                        td.innerText = sign++;
                    }
                } else {
                    td.className = "tdp-empty";
                }
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        
        var daysElem = c("tdp-day", "td", pickerElem);
        for(var i = 0; i < daysElem.length; i++) {
            daysElem[i].onclick = function() {
                d = parseInt(this.innerHTML);
                if(typeof elem.value !== "undefined") {
                    elem.value = dateToString();
                }
                hidePicker();
            };
        }
        
        c("tdp-y", "input", pickerElem)[0].value = y;
        c("tdp-m", "input", pickerElem)[0].value = m + 1;
    };
    
    var hidePicker = function() {
        pickerElem.style.display = "none";
        removeEvent(document, "click", hidePicker);
        removeEvent(elem, "click", stopHidePicker);
    };
    
    var stopHidePicker = function(e) {
        e = e || window.event;
        if(typeof e.stopPropagation === "function") {
            e.stopPropagation();
        } else {
            e.cancelBubble = true;
        }
    };
    
    var dateToString = function() {
		return y + "-" + (m < 9 ? 0 : "") + (m + 1) + "-" + (d < 10 ? 0 : "") + d;
    };
    
    var g = function(id) {
        return document.getElementById(id);
    };
    
    // 获取class元素集合
    var c = function(className, tagName, parentNode) {
        parentNode = parentNode || document;
        tagName = tagName || "*";
        if(document.getElementsByClassName) {
            return parentNode.getElementsByClassName(className);
        } else {
            var elems = (tagName === "*" && parentNode.all)? parentNode.all : parentNode.getElementsByTagName(tagName),
                match = new RegExp("(^|\\s)" + className + "(\\s|$)"),
                ret = [];
            for(var i = 0 ; i < elems.length; i++) {
                if(match.test(elems[i].className)) {
                    ret.push(elems[i]);
                }
            }
            return ret;
        }
    };
    
    var init = function() {
        isInit = true;
        
        var styleElem = document.createElement("style");
        styleElem.type = "text/css";
        if(styleElem.styleSheet) {
            styleElem.styleSheet.cssText = style + theme[option.theme];
        } else {
            styleElem.innerHTML = style + theme[option.theme];
        }
        
        var selectElem = document.createElement("div");
        selectElem.id = pickeId;
        selectElem.innerHTML = selectBox;
        
        document.body.appendChild(styleElem);
        document.body.appendChild(selectElem);
            
        pickerElem = g(pickeId);
        
        var cDate = currentDate();
        y = cDate.year;
        m = cDate.month;
        d = cDate.day;
        
        addEvent(pickerElem, "click", stopHidePicker);
        
        var yearElem = c("tdp-y", "input", pickerElem)[0],
            monthElem = c("tdp-m", "input", pickerElem)[0];
        addEvent(yearElem, "click", function() {
            yearElem.select();
        });
        addEvent(monthElem, "click", function() {
            monthElem.select();
        });
        addEvent(yearElem, "blur", function() {
            y = isNaN(parseInt(yearElem.value)) ? y : parseInt(yearElem.value);
            y = y > option.maxYear ? option.maxYear : (y < option.minYear ? option.minYear : y);
            drawDays();
        });
        addEvent(monthElem, "blur", function() {
            m = isNaN(parseInt(monthElem.value)) ? m : parseInt(monthElem.value) - 1;
            m = m > 11 ? 11 : (m < 0 ? 0 : m);
            drawDays();
        });
        addEvent(c("tdp-prev", "span", pickerElem)[0], "click", function() {
            if(m - 1 < 0) {
                if(y == option.minYear) {
                    d = 1;
                } else {
                    m = 11;
                    y--;
                }
            } else {
                m--;
            }
            drawDays();
        });
        addEvent(c("tdp-next", "span", pickerElem)[0], "click", function() {
            if(m + 1 > 11) {
                if(y == option.maxYear) {
                    d = 31;
                } else {
                    m = 0;
                    y++;
                }
            } else {
                m++;
            }
            drawDays();
        });
        addEvent(c("tdp-clear", "td", pickerElem)[0], "click", function() {
            if(typeof elem.value !== "undefined") {
                elem.value = "";
            }
            hidePicker();
        });
        addEvent(c("tdp-today", "td", pickerElem)[0], "click", function() {
            cDate = currentDate();
            y = cDate.year;
            m = cDate.month;
            d = cDate.day;
            drawDays();
            if(typeof elem.value !== "undefined") {
                elem.value = dateToString();
            }
            hidePicker();
        });
        addEvent(c("tdp-cancel", "td", pickerElem)[0], "click", function() {
            hidePicker();
        });
    };
    
    var picker = function(input) {
        if(!input || input.nodeType !== 1) {
            return;
        }
        elem = input;
        
        if(!isInit) {
            init();
        }
        
        drawDays();
        
        var pos = elemOffset(elem);
        pickerElem.style.position = "absolute";
        pickerElem.style.top = pos.top + elem.offsetHeight + "px";
        pickerElem.style.left = pos.left + "px";
        pickerElem.style.display = "block";
        
        addEvent(elem, "click", stopHidePicker);
        addEvent(document, "click", hidePicker);
    };
    
    picker.set = function(opt) {
        if(typeof opt !== "undefined") {
            if(opt.theme && (opt.theme == "grey" || opt.theme == "white" || opt.theme == "skyblue")) {
                option.theme = opt.theme;
            }
            var min = (opt.minYear && !isNaN(parseInt(opt.minYear))) ? parseInt(opt.minYear) : option.minYear,
                max = (opt.maxYear && !isNaN(parseInt(opt.maxYear))) ? parseInt(opt.maxYear) : option.maxYear;
                
            if(min <= max) {
                option.minYear = min;
                option.maxYear = max;
            }
        }
    };
    
    window.tDatePicker = picker;
    
})(window);