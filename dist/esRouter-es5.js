/*
esRouter v2.0.0

Copyright (c) 2016 Felix Rilling

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (window) {
    var _location = window.location;

    window.esRouter = function () {
        function _class() {
            var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
            var events = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

            _classCallCheck(this, _class);

            var _this = this;
            _this.$e = events;

            _this.options = {
                ajax: options.ajax || false,
                log: options.log || false,
                autoBind: options.autoBind || true
            };
            _this.data = {
                active: null,
                activeId: null,
                defaultId: null,
                index: 0
            };

            //Everything about changing the URL
            options.slug = options.slug || {};
            _this.$s = {
                preSlash: options.slug.preSlash || false, //prepend slash?
                postSlash: options.slug.postSlash || false, //append slash?
                prepend: typeof options.slug.prepend === "string" ? options.slug.prepend : "",
                append: typeof options.slug.append === "string" ? options.slug.append : "",
                get: function get(recursive, error) {
                    if (_this.$s.has()) {
                        return _location.href.substr(_location.href.lastIndexOf(_this.$s.built) + _this.$s.built.length + (_this.$s.preSlash ? 1 : 0));
                    } else {
                        error(recursive);
                    }
                },
                has: function has() {
                    return _location.href.lastIndexOf(_this.$s.built) > -1;
                },
                set: function set(id) {
                    _location.href = _location.href.substr(0, _location.href.lastIndexOf(_this.$s.built) + _this.$s.built.length) + id;
                },
                create: function create(id) {
                    _location.href = _location.href + _this.$s.built + id;
                },
                init: function init(error, done) {
                    var slug = _this.$s.get(false, function (recursive) {
                        //Only recurse once, error after that
                        if (!recursive) {
                            _this.$s.create(_this.data.defaultId);
                            return _this.$s.get(true);
                        } else {
                            error();
                        }
                    });
                    done(slug);
                },

                built: null
            };
            _this.$s.built = (_this.$s.preSlash ? "/" : "") + "#" + _this.$s.prepend + _this.$s.append;

            _this.$d = {
                corePrefix: options.dataPrefix || "router", //Core of the data-router attribute
                built: {},
                elements: {},
                base: {
                    field: "section",
                    fieldDefault: "default",
                    link: "href",
                    pagination: "pagin",
                    source: "src"
                },
                getElements: function getElements(error, done) {
                    _this.$u.eachObject(_this.$d.base, function (item, key, index) {
                        var attr = _this.$d.buildAttr(_this.$d.corePrefix, _this.$d.base[key]);

                        _this.$d.built[key] = attr;
                        _this.$d.elements[key] = document.querySelectorAll("[" + attr[0] + "]") || [];

                        if (!_this.$u.isDefined(_this.$d.elements[key])) {
                            error(_this.$d.elements[key]);
                        }
                    });
                    done();
                },
                buildAttr: function buildAttr(pre, attr) {
                    return [buildDomAttr(pre, attr), buildDataSet(pre, attr)];

                    function buildDomAttr(pre, attr) {
                        return "data-" + pre + "-" + attr;
                    }

                    function buildDataSet(pre, attr) {
                        return pre + attr[0].toUpperCase() + attr.substr(1);
                    }
                },
                autoBind: function autoBind() {
                    if (_this.options.autoBind) {
                        addClickEvent(_this.$d.elements.link, function (ev) {
                            _this.moveTo(ev.target.dataset[_this.$d.built.link[1]]);
                        });
                        addClickEvent(_this.$d.elements.pagination, function (ev) {
                            _this.moveBy(parseInt(ev.target.dataset[_this.$d.built.pagination[1]]));
                        });
                    }

                    function addClickEvent(element, fn) {
                        _this.$u.each(element, function (link) {
                            link.addEventListener("click", fn);
                        });
                    }
                }
            };

            _this.$r = {
                init: function init(error) {
                    //Query DOM
                    _this.$d.getElements(function (key) {
                        _this.$u.log(1, 0, 1, key);
                    }, _this.$d.autoBind);

                    //Read defaults
                    if (!_this.$u.isDefined(_this.$d.elements.field)) {
                        _this.$u.log(0, 0, 0, _this);
                    }
                    if (!_this.$u.isDefined(_this.$d.elements.fieldDefault)) {
                        _this.$u.log(0, 0, 0, _this);
                    } else {
                        _this.data.defaultId = _this.$d.elements.fieldDefault[0].dataset[_this.$d.built.field[1]];
                    }

                    //Init slug
                    _this.$s.init(function () {
                        _this.$u.log(1, 1, 1, _this);
                    }, function (slug) {
                        _this.moveTo(slug);
                    });
                },
                move: function move(id, recursive) {
                    _this.$u.callback(_this.$e.before, [id, _this]);
                    var success = toggleActivefield(id);

                    if (success) {
                        _this.$s.set(_this.data.activeId);
                        if (_this.options.ajax) {
                            _this.$u.getAJAX(_this.data.active.dataset[_this.$d.built.source[1]], function (responseText) {
                                _this.data.active.innerHTML = responseText;
                                _this.$u.callback(_this.$e.done, [_this.data.active, _this.data.activeId, _this.data.index, _this, responseText]);
                            });
                        } else {
                            _this.$u.callback(_this.$e.done, [_this.data.active, _this.data.activeId, _this.data.index, _this]);
                        }
                    } else {
                        //if not found revert to default
                        if (!recursive) {
                            _this.$u.log(1, 1, 0, id);
                            _this.$r.move(_this.data.defaultId, true);
                        } else {
                            _this.$u.callback(_this.$e.fail, [id, _this]);
                            _this.$u.log(0, 1, 1, this);
                        }
                    }

                    _this.$u.callback(_this.$e.always, [_this.data.active, _this.data.activeId, _this.data.index, _this]);
                    return success;

                    function toggleActivefield(id) {
                        var newfield = _this.$u.findData(_this.$d.elements.field, _this.$d.built.field[1], id);

                        if (_this.$u.isDefined(newfield)) {
                            _this.data.activeId = id;
                            _this.data.active = newfield;
                            _this.data.index = _this.getCurrentIndex();
                            return true;
                        } else {
                            return false;
                        }
                    }
                }
            };

            _this.$u = {
                getElementIndex: function getElementIndex(nodelist, node) {
                    var result = void 0;

                    _this.$u.each(nodelist, function (x, i) {
                        if (x === node) {
                            result = i;
                        }
                    });
                    return result;
                },
                findData: function findData(node, data, val) {
                    var result = void 0;

                    _this.$u.each(node, function (x) {
                        if (x.dataset[data] === val) {
                            result = x;
                        }
                    });
                    return result;
                },
                each: function each(arr, fn) {
                    for (var i = 0, l = arr.length; i < l; i++) {
                        fn(arr[i], i);
                    }
                },
                eachObject: function eachObject(object, fn) {
                    var keys = Object.keys(object);

                    for (var i = 0, l = keys.length; i < l; i++) {
                        fn(object[keys[i]], keys[i], i);
                    }
                },
                getAJAX: function getAJAX(url, fn) {
                    var _this2 = this;

                    var xhr = new XMLHttpRequest();

                    xhr.addEventListener("load", function (data) {
                        fn(data.target.response);
                    });
                    xhr.addEventListener("error", function (data) {
                        _this2.ut.log(1, 3, 0, xhr);
                    });
                    xhr.open("GET", url);
                    xhr.send();
                },
                callback: function callback(fn, args) {
                    if (typeof fn === "function") {
                        fn.apply(this, args);
                    }
                },
                isDefined: function isDefined(val) {
                    return typeof val !== "undefined";
                },

                /*tryCatch(fn, error, sucess) {
                    let result = true;
                    try {
                        fn();
                    } catch (e) {
                        result = false;
                        error(e);
                    } finally {
                        if (result) {
                            sucess();
                        }
                    }
                },*/
                log: function log(type, module, name, msg) {
                    var str = "esRouter: " + type + ": " + module + "=>" + name + "= " + msg;
                    if (type === 0) {
                        throw str;
                    } else if (_this.options.log) {
                        if (type === 1) {
                            console.warn(str);
                        } else {
                            console.log(str);
                        }
                    }
                }
            };
        }

        //Initialize & move to url slug


        _createClass(_class, [{
            key: "init",
            value: function init() {
                var _this = this;
                _this.$r.init();
                return _this;
            }
        }, {
            key: "moveTo",
            value: function moveTo(id) {
                var _this = this;
                _this.$r.move(id, false);
                return _this;
            }
        }, {
            key: "moveBy",
            value: function moveBy(val) {
                var _this = this;

                if (_this.$u.isDefined(_this.$d.elements.field[_this.data.index + val])) {
                    _this.$r.move(_this.$d.elements.field[_this.data.index + val].dataset[_this.$d.built.field[1]]);
                } else {
                    _this.$u.log(2, 1, 0, val);
                }
                return _this;
            }
        }, {
            key: "moveForward",
            value: function moveForward() {
                return this.moveBy(1);
            }
        }, {
            key: "moveBackward",
            value: function moveBackward() {
                return this.moveBy(-1);
            }
        }, {
            key: "getCurrentIndex",
            value: function getCurrentIndex() {
                var _this = this;
                return _this.$u.getElementIndex(_this.$d.elements.field, _this.data.active);
            }
        }]);

        return _class;
    }();
})(window);
//# sourceMappingURL=esRouter-es5.js.map
