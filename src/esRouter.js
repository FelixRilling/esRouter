"use strict";

(function(window) {

    let _location = window.location;

    window.esRouter = class {
        constructor(
            nodeList,
            options,
            events
        ) {
            this.sections = nodeList;
            this.events = {
                before: events.before,
                done: events.done,
                fail: events.fail,
                always: events.always
            };

            this.options = {
                ajax: options.ajax | false,
                log: options.log | false
            };

            this.slug = {
                preSlash: options.slug.preSlash | false,
                postSlash: options.slug.postSlash | false,
                urlFragmentInitator: (typeof options.slug.urlFragmentInitator === "string") ? options.slug.urlFragmentInitator : "#",
                urlFragmentAppend: (typeof options.slug.urlFragmentAppend === "string") ? options.slug.urlFragmentAppend : "",
            };
            this.slug.full = (this.slug.preSlash ? "/" : "") + this.slug.urlFragmentInitator + this.slug.urlFragmentAppend;

            this.data = {
                active: null,
                activeId: null,
                defaultId: null
            };

            if (typeof this.sections[0] === "undefined") {
                this.throwError(0);
            }

        }


        //Initialize & move to url slug
        init() {
            let defaultSection = this.findData(
                this.sections,
                "routerDefault",
                "true"
            );
            if (defaultSection) {
                this.data.defaultId = defaultSection.dataset.routerId;
                let slug = this.slugGet();
                this.writeLog("init", this.data.defaultId);
                this.moveTo(slug);
            } else {
                this.throwError(1);
            }

        }

        //main move-to-id
        moveTo(id, recursive) {
            this.callback(this.events.before, [id, this]);
            this.writeLog("move", id);
            let success = this.toggleActiveSection(id);

            if (!success) {
                //if not found revert to default
                if (!recursive) {
                    this.writeLog("warning", id + " not found");
                    this.moveTo(this.data.defaultId, true);
                } else {
                    this.throwError(2);
                }
            } else {
                this.slugSet(this.data.activeId);
                this.callback(this.events.done, [this.data.active, this.data.activeId, this.getCurrentIndex(), this]);
            }

            this.callback(this.events.always, [this.data.active, this.data.activeId, this.getCurrentIndex(), this]);
            return success;
        }
        moveBy(val) {
            let index = this.getCurrentIndex();
            if (typeof this.sections[index + val] !== "undefined") {
                this.moveTo(
                    this.sections[index + val].dataset["routerId"]
                );
            }
        }
        moveForward() {
            this.moveBy(1);
        }
        moveBackward() {
            this.moveBy(-1);
        }
        toggleActiveSection(id) {
                let newSection = this.findData(this.sections, "routerId", id);
                if (typeof newSection !== "undefined") {
                    this.data.activeId = id;
                    this.data.active = newSection;
                    return true;
                } else {
                    return false;
                }
            }
            /*##############/
            / Slug functions
            /###############*/
        slugGet(recursive) {
            if (this.slugIsSet()) {
                return _location.href.substr(
                    _location.href.lastIndexOf(this.slug.full) +
                    (this.slug.preSlash ? 2 : 1)
                );
            } else {
                //Only recurse once, error after that
                if (!recursive) {
                    this.slugInit(this.data.defaultId);
                    return this.slugGet(true);
                } else {
                    this.throwError(3);
                }
            }
        }
        slugIsSet() {
            return _location.href.lastIndexOf(this.slug.full) > -1;
        }
        slugSet(id) {
            _location.href = (_location.href.substr(
                0,
                _location.href.lastIndexOf(this.slug.full) +
                this.slug.full.length
            ) + id);
        }
        slugInit(id) {
            _location.href = (
                _location.href +
                this.slug.full +
                id);
        }

        /*##############/
        / Utility functions
        /###############*/
        getCurrentIndex() {
            return this.getElementIndex(this.sections, this.data.active);
        }
        getElementIndex(nodelist, node) {
            let result;
            this.iterateDomNode(nodelist, function(x, i) {
                if (x === node) {
                    result = i;
                }
            });
            return result;
        }
        findData(node, data, val) {
            let result;
            this.iterateDomNode(node, function(x) {
                if (x.dataset[data] === val) {
                    result = x;
                }
            });
            return result;
        }
        iterateDomNode(nodelist, fn) {
            for (let i = 0; i < nodelist.length; i++) {
                fn(nodelist[i], i);
            }
        }
        callback(fn, args) {
            if (typeof fn === "function") {
                fn.apply(this, args);
            }
        }
        writeLog(type, message) {
            if (this.options.log) {
                console.log("esRouter " + type + ": " + message);
            }
        }
        throwError(code) {
            throw new Error("esRouter error: " + code);
            this.callback(this.events.fail, [code, this]);
        }
    };

})(window);