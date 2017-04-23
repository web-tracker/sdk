(function (exports) {
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NA_VERSION = "-1";
var NA = {
  name: "na",
  version: NA_VERSION
};

function typeOf(type) {
  return function (object) {
    return Object.prototype.toString.call(object) === "[object " + type + "]";
  };
}
var isString = typeOf("String");
var isRegExp = typeOf("RegExp");
var isObject = typeOf("Object");
var isFunction = typeOf("Function");

function each(object, factory) {
  for (var i = 0, l = object.length; i < l; i++) {
    if (factory.call(object, object[i], i) === false) {
      break;
    }
  }
}

// UserAgent Detector.
// @param {String} ua, userAgent.
// @param {Object} expression
// @return {Object}
//    返回 null 表示当前表达式未匹配成功。
function detect(name, expression, ua) {
  var expr = isFunction(expression) ? expression.call(null, ua) : expression;
  if (!expr) {
    return null;
  }
  var info = {
    name: name,
    version: NA_VERSION,
    codename: ""
  };
  if (expr === true) {
    return info;
  } else if (isString(expr)) {
    if (ua.indexOf(expr) !== -1) {
      return info;
    }
  } else if (isObject(expr)) {
    if (expr.hasOwnProperty("version")) {
      info.version = expr.version;
    }
    return info;
  } else if (isRegExp(expr)) {
    var m = expr.exec(ua);
    if (m) {
      if (m.length >= 2 && m[1]) {
        info.version = m[1].replace(/_/g, ".");
      } else {
        info.version = NA_VERSION;
      }
      return info;
    }
  }
}

// 初始化识别。
function init(ua, patterns, factory, detector) {
  var detected = NA;
  each(patterns, function (pattern) {
    var d = detect(pattern[0], pattern[1], ua);
    if (d) {
      detected = d;
      return false;
    }
  });
  factory.call(detector, detected.name, detected.version);
}

var Detector$1 = function () {
  function Detector(rules) {
    _classCallCheck(this, Detector);

    this._rules = rules;
  }

  // 解析 UserAgent 字符串
  // @param {String} ua, userAgent string.
  // @return {Object}


  _createClass(Detector, [{
    key: "parse",
    value: function parse(ua) {
      ua = (ua || "").toLowerCase();
      var d = {};

      init(ua, this._rules.device, function (name, version) {
        var v = parseFloat(version);
        d.device = {
          name: name,
          version: v,
          fullVersion: version
        };
        d.device[name] = v;
      }, d);

      init(ua, this._rules.os, function (name, version) {
        var v = parseFloat(version);
        d.os = {
          name: name,
          version: v,
          fullVersion: version
        };
        d.os[name] = v;
      }, d);

      var ieCore = this.IEMode(ua);

      init(ua, this._rules.engine, function (name, version) {
        var mode = version;
        // IE 内核的浏览器，修复版本号及兼容模式。
        if (ieCore) {
          version = ieCore.engineVersion || ieCore.engineMode;
          mode = ieCore.engineMode;
        }
        var v = parseFloat(version);
        d.engine = {
          name: name,
          version: v,
          fullVersion: version,
          mode: parseFloat(mode),
          fullMode: mode,
          compatible: ieCore ? ieCore.compatible : false
        };
        d.engine[name] = v;
      }, d);

      init(ua, this._rules.browser, function (name, version) {
        var mode = version;
        // IE 内核的浏览器，修复浏览器版本及兼容模式。
        if (ieCore) {
          // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
          if (name === "ie") {
            version = ieCore.browserVersion;
          }
          mode = ieCore.browserMode;
        }
        var v = parseFloat(version);
        d.browser = {
          name: name,
          version: v,
          fullVersion: version,
          mode: parseFloat(mode),
          fullMode: mode,
          compatible: ieCore ? ieCore.compatible : false
        };
        d.browser[name] = v;
      }, d);
      return d;
    }

    // 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
    // @param {String} ua, userAgent string.
    // @return {Object}

  }, {
    key: "IEMode",
    value: function IEMode(ua) {
      if (!this._rules.re_msie.test(ua)) {
        return null;
      }

      var m = void 0;
      var engineMode = void 0;
      var engineVersion = void 0;
      var browserMode = void 0;
      var browserVersion = void 0;

      // IE8 及其以上提供有 Trident 信息，
      // 默认的兼容模式，UA 中 Trident 版本不发生变化。
      if (ua.indexOf("trident/") !== -1) {
        m = /\btrident\/([0-9.]+)/.exec(ua);
        if (m && m.length >= 2) {
          // 真实引擎版本。
          engineVersion = m[1];
          var v_version = m[1].split(".");
          v_version[0] = parseInt(v_version[0], 10) + 4;
          browserVersion = v_version.join(".");
        }
      }

      m = this._rules.re_msie.exec(ua);
      browserMode = m[1];
      var v_mode = m[1].split(".");
      if (typeof browserVersion === "undefined") {
        browserVersion = browserMode;
      }
      v_mode[0] = parseInt(v_mode[0], 10) - 4;
      engineMode = v_mode.join(".");
      if (typeof engineVersion === "undefined") {
        engineVersion = engineMode;
      }

      return {
        browserVersion: browserVersion,
        browserMode: browserMode,
        engineVersion: engineVersion,
        engineMode: engineMode,
        compatible: engineVersion !== engineMode
      };
    }
  }]);

  return Detector;
}();

var detector$2 = Detector$1;

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var win = typeof window === "undefined" ? commonjsGlobal : window;
var external = win.external;
var re_msie = /\b(?:msie |ie |trident\/[0-9].*rv[ :])([0-9.]+)/;
var re_blackberry_10 = /\bbb10\b.+?\bversion\/([\d.]+)/;
var re_blackberry_6_7 = /\bblackberry\b.+\bversion\/([\d.]+)/;
var re_blackberry_4_5 = /\bblackberry\d+\/([\d.]+)/;

var NA_VERSION$1 = "-1";

// 硬件设备信息识别表达式。
// 使用数组可以按优先级排序。
var DEVICES = [["nokia", function (ua) {
  // 不能将两个表达式合并，因为可能出现 "nokia; nokia 960"
  // 这种情况下会优先识别出 nokia/-1
  if (ua.indexOf("nokia ") !== -1) {
    return (/\bnokia ([0-9]+)?/
    );
  } else {
    return (/\bnokia([a-z0-9]+)?/
    );
  }
}],
// 三星有 Android 和 WP 设备。
["samsung", function (ua) {
  if (ua.indexOf("samsung") !== -1) {
    return (/\bsamsung(?:[ \-](?:sgh|gt|sm))?-([a-z0-9]+)/
    );
  } else {
    return (/\b(?:sgh|sch|gt|sm)-([a-z0-9]+)/
    );
  }
}], ["wp", function (ua) {
  return ua.indexOf("windows phone ") !== -1 || ua.indexOf("xblwp") !== -1 || ua.indexOf("zunewp") !== -1 || ua.indexOf("windows ce") !== -1;
}], ["pc", "windows"], ["ipad", "ipad"],
// ipod 规则应置于 iphone 之前。
["ipod", "ipod"], ["iphone", /\biphone\b|\biph(\d)/], ["mac", "macintosh"],
// 小米
["mi", /\bmi[ \-]?([a-z0-9 ]+(?= build|\)))/],
// 红米
["hongmi", /\bhm[ \-]?([a-z0-9]+)/], ["aliyun", /\baliyunos\b(?:[\-](\d+))?/], ["meizu", function (ua) {
  return ua.indexOf("meizu") >= 0 ? /\bmeizu[\/ ]([a-z0-9]+)\b/ : /\bm([0-9cx]{1,4})\b/;
}], ["nexus", /\bnexus ([0-9s.]+)/], ["huawei", function (ua) {
  var re_mediapad = /\bmediapad (.+?)(?= build\/huaweimediapad\b)/;
  if (ua.indexOf("huawei-huawei") !== -1) {
    return (/\bhuawei\-huawei\-([a-z0-9\-]+)/
    );
  } else if (re_mediapad.test(ua)) {
    return re_mediapad;
  } else {
    return (/\bhuawei[ _\-]?([a-z0-9]+)/
    );
  }
}], ["lenovo", function (ua) {
  if (ua.indexOf("lenovo-lenovo") !== -1) {
    return (/\blenovo\-lenovo[ \-]([a-z0-9]+)/
    );
  } else {
    return (/\blenovo[ \-]?([a-z0-9]+)/
    );
  }
}],
// 中兴
["zte", function (ua) {
  if (/\bzte\-[tu]/.test(ua)) {
    return (/\bzte-[tu][ _\-]?([a-su-z0-9\+]+)/
    );
  } else {
    return (/\bzte[ _\-]?([a-su-z0-9\+]+)/
    );
  }
}],
// 步步高
["vivo", /\bvivo(?: ([a-z0-9]+))?/], ["htc", function (ua) {
  if (/\bhtc[a-z0-9 _\-]+(?= build\b)/.test(ua)) {
    return (/\bhtc[ _\-]?([a-z0-9 ]+(?= build))/
    );
  } else {
    return (/\bhtc[ _\-]?([a-z0-9 ]+)/
    );
  }
}], ["oppo", /\boppo[_]([a-z0-9]+)/], ["konka", /\bkonka[_\-]([a-z0-9]+)/], ["sonyericsson", /\bmt([a-z0-9]+)/], ["coolpad", /\bcoolpad[_ ]?([a-z0-9]+)/], ["lg", /\blg[\-]([a-z0-9]+)/], ["android", /\bandroid\b|\badr\b/], ["blackberry", function (ua) {
  if (ua.indexOf("blackberry") >= 0) {
    return (/\bblackberry\s?(\d+)/
    );
  }
  return "bb10";
}]];

// 操作系统信息识别表达式
var OS = [["wp", function (ua) {
  if (ua.indexOf("windows phone ") !== -1) {
    return (/\bwindows phone (?:os )?([0-9.]+)/
    );
  } else if (ua.indexOf("xblwp") !== -1) {
    return (/\bxblwp([0-9.]+)/
    );
  } else if (ua.indexOf("zunewp") !== -1) {
    return (/\bzunewp([0-9.]+)/
    );
  }
  return "windows phone";
}], ["windows", /\bwindows nt ([0-9.]+)/], ["macosx", /\bmac os x ([0-9._]+)/], ["ios", function (ua) {
  if (/\bcpu(?: iphone)? os /.test(ua)) {
    return (/\bcpu(?: iphone)? os ([0-9._]+)/
    );
  } else if (ua.indexOf("iph os ") !== -1) {
    return (/\biph os ([0-9_]+)/
    );
  } else {
    return (/\bios\b/
    );
  }
}], ["yunos", /\baliyunos ([0-9.]+)/], ["android", function (ua) {
  if (ua.indexOf("android") >= 0) {
    return (/\bandroid[ \/-]?([0-9.x]+)?/
    );
  } else if (ua.indexOf("adr") >= 0) {
    if (ua.indexOf("mqqbrowser") >= 0) {
      return (/\badr[ ]\(linux; u; ([0-9.]+)?/
      );
    } else {
      return (/\badr(?:[ ]([0-9.]+))?/
      );
    }
  }
  return "android";
  //return /\b(?:android|\badr)(?:[\/\- ](?:\(linux; u; )?)?([0-9.x]+)?/;
}], ["chromeos", /\bcros i686 ([0-9.]+)/], ["linux", "linux"], ["windowsce", /\bwindows ce(?: ([0-9.]+))?/], ["symbian", /\bsymbian(?:os)?\/([0-9.]+)/], ["blackberry", function (ua) {
  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
  return m ? { version: m[1] } : "blackberry";
}]];

// 针对同源的 TheWorld 和 360 的 external 对象进行检测。
// @param {String} key, 关键字，用于检测浏览器的安装路径中出现的关键字。
// @return {Undefined,Boolean,Object} 返回 undefined 或 false 表示检测未命中。
function checkTW360External(key) {
  if (!external) {
    return;
  } // return undefined.
  try {
    //        360安装路径：
    //        C:%5CPROGRA~1%5C360%5C360se3%5C360SE.exe
    var runpath = external.twGetRunPath.toLowerCase();
    // 360SE 3.x ~ 5.x support.
    // 暴露的 external.twGetVersion 和 external.twGetSecurityID 均为 undefined。
    // 因此只能用 try/catch 而无法使用特性判断。
    var security = external.twGetSecurityID(win);
    var version = external.twGetVersion(security);

    if (runpath && runpath.indexOf(key) === -1) {
      return false;
    }
    if (version) {
      return { version: version };
    }
  } catch (ex) {/* */}
}

var ENGINE = [["edgehtml", /edge\/([0-9.]+)/], ["trident", re_msie], ["blink", function () {
  return "chrome" in win && "CSS" in win && /\bapplewebkit[\/]?([0-9.+]+)/;
}], ["webkit", /\bapplewebkit[\/]?([0-9.+]+)/], ["gecko", function (ua) {
  var match = ua.match(/\brv:([\d\w.]+).*\bgecko\/(\d+)/);
  if (match) {
    return {
      version: match[1] + "." + match[2]
    };
  }
}], ["presto", /\bpresto\/([0-9.]+)/], ["androidwebkit", /\bandroidwebkit\/([0-9.]+)/], ["coolpadwebkit", /\bcoolpadwebkit\/([0-9.]+)/], ["u2", /\bu2\/([0-9.]+)/], ["u3", /\bu3\/([0-9.]+)/]];
var BROWSER = [
// Microsoft Edge Browser, Default browser in Windows 10.
["edge", /edge\/([0-9.]+)/],
// Sogou.
["sogou", function (ua) {
  if (ua.indexOf("sogoumobilebrowser") >= 0) {
    return (/sogoumobilebrowser\/([0-9.]+)/
    );
  } else if (ua.indexOf("sogoumse") >= 0) {
    return true;
  }
  return (/ se ([0-9.x]+)/
  );
}],
// TheWorld (世界之窗)
// 由于裙带关系，TheWorld API 与 360 高度重合。
// 只能通过 UA 和程序安装路径中的应用程序名来区分。
// TheWorld 的 UA 比 360 更靠谱，所有将 TheWorld 的规则放置到 360 之前。
["theworld", function () {
  var x = checkTW360External("theworld");
  if (typeof x !== "undefined") {
    return x;
  }
  return (/theworld(?: ([\d.])+)?/
  );
}],
// 360SE, 360EE.
["360", function (ua) {
  var x = checkTW360External("360se");
  if (typeof x !== "undefined") {
    return x;
  }
  if (ua.indexOf("360 aphone browser") !== -1) {
    return (/\b360 aphone browser \(([^\)]+)\)/
    );
  }
  return (/\b360(?:se|ee|chrome|browser)\b/
  );
}],
// Maxthon
["maxthon", function () {
  try {
    if (external && (external.mxVersion || external.max_version)) {
      return {
        version: external.mxVersion || external.max_version
      };
    }
  } catch (ex) {/* */}
  return (/\b(?:maxthon|mxbrowser)(?:[ \/]([0-9.]+))?/
  );
}], ["micromessenger", /\bmicromessenger\/([\d.]+)/], ["qq", /\bm?qqbrowser\/([0-9.]+)/], ["green", "greenbrowser"], ["tt", /\btencenttraveler ([0-9.]+)/], ["liebao", function (ua) {
  if (ua.indexOf("liebaofast") >= 0) {
    return (/\bliebaofast\/([0-9.]+)/
    );
  }
  if (ua.indexOf("lbbrowser") === -1) {
    return false;
  }
  var version = void 0;
  try {
    if (external && external.LiebaoGetVersion) {
      version = external.LiebaoGetVersion();
    }
  } catch (ex) {/* */}
  return {
    version: version || NA_VERSION$1
  };
}], ["tao", /\btaobrowser\/([0-9.]+)/], ["coolnovo", /\bcoolnovo\/([0-9.]+)/], ["saayaa", "saayaa"],
// 有基于 Chromniun 的急速模式和基于 IE 的兼容模式。必须在 IE 的规则之前。
["baidu", /\b(?:ba?idubrowser|baiduhd)[ \/]([0-9.x]+)/],
// 后面会做修复版本号，这里只要能识别是 IE 即可。
["ie", re_msie], ["mi", /\bmiuibrowser\/([0-9.]+)/],
// Opera 15 之后开始使用 Chromniun 内核，需要放在 Chrome 的规则之前。
["opera", function (ua) {
  var re_opera_old = /\bopera.+version\/([0-9.ab]+)/;
  var re_opera_new = /\bopr\/([0-9.]+)/;
  return re_opera_old.test(ua) ? re_opera_old : re_opera_new;
}], ["oupeng", /\boupeng\/([0-9.]+)/], ["yandex", /yabrowser\/([0-9.]+)/],
// 支付宝手机客户端
["ali-ap", function (ua) {
  if (ua.indexOf("aliapp") > 0) {
    return (/\baliapp\(ap\/([0-9.]+)\)/
    );
  } else {
    return (/\balipayclient\/([0-9.]+)\b/
    );
  }
}],
// 支付宝平板客户端
["ali-ap-pd", /\baliapp\(ap-pd\/([0-9.]+)\)/],
// 支付宝商户客户端
["ali-am", /\baliapp\(am\/([0-9.]+)\)/],
// 淘宝手机客户端
["ali-tb", /\baliapp\(tb\/([0-9.]+)\)/],
// 淘宝平板客户端
["ali-tb-pd", /\baliapp\(tb-pd\/([0-9.]+)\)/],
// 天猫手机客户端
["ali-tm", /\baliapp\(tm\/([0-9.]+)\)/],
// 天猫平板客户端
["ali-tm-pd", /\baliapp\(tm-pd\/([0-9.]+)\)/],
// UC 浏览器，可能会被识别为 Android 浏览器，规则需要前置。
// UC 桌面版浏览器携带 Chrome 信息，需要放在 Chrome 之前。
["uc", function (ua) {
  if (ua.indexOf("ucbrowser/") >= 0) {
    return (/\bucbrowser\/([0-9.]+)/
    );
  } else if (ua.indexOf("ubrowser/") >= 0) {
    return (/\bubrowser\/([0-9.]+)/
    );
  } else if (/\buc\/[0-9]/.test(ua)) {
    return (/\buc\/([0-9.]+)/
    );
  } else if (ua.indexOf("ucweb") >= 0) {
    // `ucweb/2.0` is compony info.
    // `UCWEB8.7.2.214/145/800` is browser info.
    return (/\bucweb([0-9.]+)?/
    );
  } else {
    return (/\b(?:ucbrowser|uc)\b/
    );
  }
}], ["chrome", / (?:chrome|crios|crmo)\/([0-9.]+)/],
// Android 默认浏览器。该规则需要在 safari 之前。
["android", function (ua) {
  if (ua.indexOf("android") === -1) {
    return;
  }
  return (/\bversion\/([0-9.]+(?: beta)?)/
  );
}], ["blackberry", function (ua) {
  var m = ua.match(re_blackberry_10) || ua.match(re_blackberry_6_7) || ua.match(re_blackberry_4_5);
  return m ? { version: m[1] } : "blackberry";
}], ["safari", /\bversion\/([0-9.]+(?: beta)?)(?: mobile(?:\/[a-z0-9]+)?)? safari\//],
// 如果不能被识别为 Safari，则猜测是 WebView。
["webview", /\bcpu(?: iphone)? os (?:[0-9._]+).+\bapplewebkit\b/], ["firefox", /\bfirefox\/([0-9.ab]+)/], ["nokia", /\bnokiabrowser\/([0-9.]+)/]];

var webRules = {
  device: DEVICES,
  os: OS,
  browser: BROWSER,
  engine: ENGINE,
  re_msie: re_msie
};

var userAgent = navigator.userAgent || "";
//const platform = navigator.platform || "";
var appVersion = navigator.appVersion || "";
var vendor = navigator.vendor || "";
var ua = userAgent + " " + appVersion + " " + vendor;

var detector = new detector$2(webRules);

// 解析使用 Trident 内核的浏览器的 `浏览器模式` 和 `文档模式` 信息。
// @param {String} ua, userAgent string.
// @return {Object}
function IEMode(ua) {
  if (!webRules.re_msie.test(ua)) {
    return null;
  }

  var m = void 0;
  var engineMode = void 0;
  var engineVersion = void 0;
  var browserMode = void 0;
  var browserVersion = void 0;

  // IE8 及其以上提供有 Trident 信息，
  // 默认的兼容模式，UA 中 Trident 版本不发生变化。
  if (ua.indexOf("trident/") !== -1) {
    m = /\btrident\/([0-9.]+)/.exec(ua);
    if (m && m.length >= 2) {
      // 真实引擎版本。
      engineVersion = m[1];
      var v_version = m[1].split(".");
      v_version[0] = parseInt(v_version[0], 10) + 4;
      browserVersion = v_version.join(".");
    }
  }

  m = webRules.re_msie.exec(ua);
  browserMode = m[1];
  var v_mode = m[1].split(".");
  if (typeof browserVersion === "undefined") {
    browserVersion = browserMode;
  }
  v_mode[0] = parseInt(v_mode[0], 10) - 4;
  engineMode = v_mode.join(".");
  if (typeof engineVersion === "undefined") {
    engineVersion = engineMode;
  }

  return {
    browserVersion: browserVersion,
    browserMode: browserMode,
    engineVersion: engineVersion,
    engineMode: engineMode,
    compatible: engineVersion !== engineMode
  };
}

function WebParse(ua) {
  var d = detector.parse(ua);

  var ieCore = IEMode(ua);

  // IE 内核的浏览器，修复版本号及兼容模式。
  if (ieCore) {
    var engineName = d.engine.name;
    var engineVersion = ieCore.engineVersion || ieCore.engineMode;
    var ve = parseFloat(engineVersion);
    var engineMode = ieCore.engineMode;

    d.engine = {
      name: engineName,
      version: ve,
      fullVersion: engineVersion,
      mode: parseFloat(engineMode),
      fullMode: engineMode,
      compatible: ieCore ? ieCore.compatible : false
    };
    d.engine[d.engine.name] = ve;

    var browserName = d.browser.name;
    // IE 内核的浏览器，修复浏览器版本及兼容模式。
    // 仅修改 IE 浏览器的版本，其他 IE 内核的版本不修改。
    var browserVersion = d.browser.fullVersion;
    if (browserName === "ie") {
      browserVersion = ieCore.browserVersion;
    }
    var browserMode = ieCore.browserMode;
    var vb = parseFloat(browserVersion);
    d.browser = {
      name: browserName,
      version: vb,
      fullVersion: browserVersion,
      mode: parseFloat(browserMode),
      fullMode: browserMode,
      compatible: ieCore ? ieCore.compatible : false
    };
    d.browser[browserName] = vb;
  }
  return d;
}

var Tan = WebParse(ua);
Tan.parse = WebParse;
var webDetector = Tan;

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * 3rd party detector wrapper
 */
var Detector = (function () {
    function Detector(device, os, engine, browser) {
        this.device = device;
        this.os = os;
        this.engine = engine;
        this.browser = browser;
    }
    return Detector;
}());
var _detector = new Detector(webDetector.device, webDetector.os, webDetector.engine, webDetector.browser);
console.log('detector:', JSON.stringify(_detector));

(function (BrowserType) {
    BrowserType[BrowserType["MSIE"] = 0] = "MSIE";
    BrowserType[BrowserType["MS_Edge"] = 1] = "MS_Edge";
    BrowserType[BrowserType["Chrome"] = 2] = "Chrome";
    BrowserType[BrowserType["Safari"] = 3] = "Safari";
    BrowserType[BrowserType["Firefox"] = 4] = "Firefox";
    BrowserType[BrowserType["Opera"] = 5] = "Opera";
})(exports.BrowserType || (exports.BrowserType = {}));

(function (OSType) {
    OSType[OSType["Windows"] = 0] = "Windows";
    OSType[OSType["MacOS"] = 1] = "MacOS";
    OSType[OSType["IOS"] = 2] = "IOS";
    OSType[OSType["Android"] = 3] = "Android";
    OSType[OSType["ChromeOS"] = 4] = "ChromeOS";
    OSType[OSType["Linux"] = 5] = "Linux";
    OSType[OSType["WindowsPhone"] = 6] = "WindowsPhone";
    OSType[OSType["YunOS"] = 7] = "YunOS";
})(exports.OSType || (exports.OSType = {}));

(function (EngineType) {
    EngineType[EngineType["EdgeHTML"] = 0] = "EdgeHTML";
    EngineType[EngineType["Trident"] = 1] = "Trident";
    EngineType[EngineType["Blink"] = 2] = "Blink";
    EngineType[EngineType["Webkit"] = 3] = "Webkit";
    EngineType[EngineType["Gecko"] = 4] = "Gecko";
    EngineType[EngineType["Presto"] = 5] = "Presto";
    EngineType[EngineType["AndroidWebkit"] = 6] = "AndroidWebkit";
    EngineType[EngineType["UC"] = 7] = "UC";
})(exports.EngineType || (exports.EngineType = {}));
var Browser = (function () {
    function Browser(type, version) {
        this.type = type;
        this.version = version;
        this._type = exports.BrowserType[type];
    }
    return Browser;
}());
var Engine = (function () {
    function Engine(type, version) {
        this.type = type;
        this.version = version;
        this._type = exports.EngineType[type];
    }
    return Engine;
}());
var OperatingSystem = (function () {
    function OperatingSystem(type, version) {
        this.type = type;
        this.version = version;
        this._type = exports.OSType[type];
    }
    return OperatingSystem;
}());
var Device = (function () {
    function Device(type, version) {
        this.type = type;
        this.version = version;
    }
    return Device;
}());
/**
 * Represents for Environment of Brower.
 * It's an singleton instance.
 */
var Environment = (function () {
    function Environment() {
    }
    /**
     * Detects the environment of target browser.
     * Like type, version, network, etc.
     */
    Environment.prototype.detect = function () {
        // Detect browser status
        this.detectBrowser();
        this.detectEngine();
        this.detectOperatingSystem();
        this.detectDevice();
        return this;
    };
    /**
     * Detect browser infomation by detector.
     */
    Environment.prototype.detectBrowser = function () {
        var browser = exports.BrowserType.Chrome;
        var version = _detector.browser.fullVersion;
        switch (_detector.browser.name) {
            case 'chrome':
                browser = exports.BrowserType.Chrome;
                break;
            case 'firefox':
                browser = exports.BrowserType.Firefox;
                break;
            case 'opera':
                browser = exports.BrowserType.Opera;
                break;
            case 'ie':
                browser = exports.BrowserType.MSIE;
                break;
            case 'edge':
                browser = exports.BrowserType.MS_Edge;
                break;
            default: break;
        }
        this.browser = new Browser(browser, version);
    };
    Environment.prototype.detectEngine = function () {
        var engine = exports.EngineType.Webkit;
        var version = _detector.engine.fullVersion;
        switch (_detector.engine.name) {
            case 'edgehtml':
                engine = exports.EngineType.EdgeHTML;
                break;
            case 'trident':
                engine = exports.EngineType.Trident;
                break;
            case 'blink':
                engine = exports.EngineType.Blink;
                break;
            case 'webkit':
                engine = exports.EngineType.Webkit;
                break;
            case 'gecko':
                engine = exports.EngineType.Gecko;
                break;
            case 'presto':
                engine = exports.EngineType.Presto;
                break;
            case 'androidwebkit':
                engine = exports.EngineType.AndroidWebkit;
                break;
            case 'u2':
            case 'u3':
                engine = exports.EngineType.UC;
                break;
            default: break;
        }
        this.engine = new Engine(engine, version);
    };
    Environment.prototype.detectOperatingSystem = function () {
        var operatingSystem = exports.OSType.MacOS;
        var version = _detector.browser.fullVersion;
        switch (_detector.os.name) {
            case 'window':
                operatingSystem = exports.OSType.Windows;
                break;
            case 'macosx':
                operatingSystem = exports.OSType.MacOS;
                break;
            case 'ios':
                operatingSystem = exports.OSType.IOS;
                break;
            case 'android':
                operatingSystem = exports.OSType.Android;
                break;
            case 'chromeos':
                operatingSystem = exports.OSType.ChromeOS;
                break;
            case 'linux':
                operatingSystem = exports.OSType.Linux;
                break;
            case 'wp':
                operatingSystem = exports.OSType.WindowsPhone;
                break;
            case 'yunos':
                operatingSystem = exports.OSType.YunOS;
                break;
            default: break;
        }
        this.operatingSystem = new OperatingSystem(operatingSystem, version);
    };
    Environment.prototype.detectDevice = function () {
        this.device = new Device(_detector.device.name, _detector.device.fullVersion);
    };
    return Environment;
}());

/**
 * Base performance metric measurement.
 * Implements Navigation Timing API and
 * Resource Timing API, which are W3C standards.
 *
 * Compatibility
 * http://caniuse.com/#feat=nav-timing
 */
var BaseMetric = (function () {
    function BaseMetric() {
    }
    BaseMetric.prototype.computeFirstPaintTime = function () {
        throw new Error('Method not implemented.');
    };
    BaseMetric.prototype.computeFirstMearningfulTime = function () {
        throw new Error('Method not implemented.');
    };
    BaseMetric.prototype.computeFirstInteractionTime = function () {
        throw new Error('Method not implemented.');
    };
    BaseMetric.prototype.computeTotalLoadingTime = function () {
        throw new Error('Method not implemented.');
    };
    BaseMetric.prototype.computeResourceTime = function () {
        throw new Error('Method not implemented.');
    };
    BaseMetric.prototype.computeDOMParsingTime = function () {
        throw new Error('Method not implemented.');
    };
    /**
     * Get DNS Lookup Time by using Timing API.
     * Note: the time might be 0 due to cache.
     */
    BaseMetric.prototype.computeDNSLookupTime = function () {
        var performanceAPI = window.performance;
        if (!performanceAPI) {
            return -1;
        }
        var timing = performanceAPI.timing;
        var DNSLookupTime = timing.domainLookupEnd - timing.domainLookupStart;
        return DNSLookupTime;
    };
    BaseMetric.prototype.computeFistByteTime = function () {
        throw new Error('Method not implemented.');
    };
    return BaseMetric;
}());

var ChromeMetric = (function (_super) {
    __extends(ChromeMetric, _super);
    function ChromeMetric() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChromeMetric.prototype.computeFirstPaintTime = function () {
        var loadTimes = window['chrome'].loadTimes();
        var firstPaintTime = loadTimes.firstPaintTime;
        var startLoadTime = loadTimes.startLoadTime;
        return (firstPaintTime - startLoadTime) * 1000;
    };
    return ChromeMetric;
}(BaseMetric));

var env = new Environment();
var detected = env.detect();
function measure() {
    if (detected.browser.type === exports.BrowserType.Chrome) {
        var metric = new ChromeMetric();
        var firstPaintTime = metric.computeFirstPaintTime();
        // if (firstPaintTime <= 0) {
        //   setTimeout(() => {
        //     measure();
        //   }, 200);
        //   return;
        // }
        console.log('Chrome first paint time:', firstPaintTime);
        var DNSLookupTime = metric.computeDNSLookupTime();
        console.log('DNSLookupTime:', DNSLookupTime);
        console.log('Load Event End', window.performance.timing.loadEventEnd);
        console.log('First Paint Time', window['chrome'].loadTimes().firstPaintTime);
    }
}
window.onload = measure;

exports.Browser = Browser;
exports.Engine = Engine;
exports.OperatingSystem = OperatingSystem;
exports.Device = Device;
exports.Environment = Environment;

}((this.WebTracker = this.WebTracker || {})));
//# sourceMappingURL=sdk.js.map
