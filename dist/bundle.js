(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.Storex = factory());
}(this, (function () { 'use strict';

    var Store = /** @class */ (function () {
        function Store() {
            this.channels = [];
            this.pipes = [];
            this.subscribers = [];
            Store.instance = this;
        }
        Store.prototype._findChannel = function (name) {
            for (var _i = 0, _a = this.channels; _i < _a.length; _i++) {
                var channel = _a[_i];
                if (name === channel.name) {
                    return channel;
                }
            }
            return null;
        };
        Store.prototype.getInstance = function () {
            return Store.instance;
        };
        Store.prototype.addChannel = function (channel) {
            if (channel instanceof Channel) {
                this._notifyJoin(channel);
                this.channels.push(channel);
                return channel;
            }
            else {
                throw new Error('Можно добавть только IChannel');
            }
        };
        Store.prototype.addPipe = function (name, fn) {
            if (fn instanceof Function) {
                this.pipes.push({ name: name, fn: fn });
            }
            else {
                throw new Error('Можно добавть только IPipe');
            }
        };
        Store.prototype.join = function (channelName) {
            return this._findChannel(channelName);
        };
        Store.prototype.createChannel = function (name) {
            var newChannel = new Channel(name);
            this.channels.push(newChannel);
            return newChannel;
        };
        Store.prototype.addSubscriber = function (sub) {
            this.subscribers.push(sub);
            return this;
        };
        Store.prototype._notifyJoin = function (channel) {
            var resSubs = this.subscribers.filter(function (el) {
                return el.method === 'join';
            });
            resSubs.forEach(function (el) {
                el.event(channel);
            });
        };
        Store.instance = null;
        return Store;
    }());
    var Store$1 = new Store().getInstance();
    //# sourceMappingURL=Store.js.map

    var Config;
    (function (Config) {
        Config.PROPERTY_OPTIONS = {
            useDotSyntax: true
        };
    })(Config || (Config = {}));
    var Config$1 = Config;
    //# sourceMappingURL=config.js.map

    var Debug;
    (function (Debug) {
        function error(msg) {
            console.error("[Storex] Error: " + msg);
        }
        Debug.error = error;
        function warn(msg) {
            console.warn("[Storex] Warn: " + msg);
        }
        Debug.warn = warn;
    })(Debug || (Debug = {}));
    //# sourceMappingURL=debug.js.map

    var Property = /** @class */ (function () {
        function Property(name, value, options) {
            if (options === void 0) { options = null; }
            this.name = null;
            this.pipes = [];
            this.value_ = null;
            this.type = null;
            this.readonly = false;
            this.name = name;
            if (!!options) {
                //this._parseOptions(options);
                this.doPipes(options);
                this.value = value;
                this.doReadonly(options);
                this.doType(options);
            }
            else {
                this.value = value;
            }
        }
        Object.defineProperty(Property.prototype, "value", {
            get: function () {
                return this.value_;
            },
            set: function (val) {
                var _this = this;
                if (this._validVal(val)) {
                    this.pipes.forEach(function (pipe) {
                        if (typeof pipe === 'string') {
                            var globPipe = Units$1.getGlobalPipe(pipe);
                            if (!!globPipe) {
                                pipe = globPipe.fn;
                                val = pipe(val, _this.value);
                            }
                            else {
                                Debug.error("Pipe [" + pipe + "] id not define.");
                            }
                        }
                        else {
                            val = pipe(val, _this.value);
                        }
                    });
                    if (Property._compareTypes(val, this.value) && Property._getType(val) === 'array') {
                        this.value_ = this.value.concat(val);
                        return;
                    }
                    if (Property._compareTypes(val, this.value) && Property._getType(val) === 'object') {
                        if (this.value === null)
                            this.value_ = {};
                        this.value_ = Object.assign(this.value, val);
                        return;
                    }
                    this.value_ = val;
                }
            },
            enumerable: true,
            configurable: true
        });
        Property._getType = function (val) {
            if (val instanceof Array) {
                return 'array';
            }
            if (val instanceof Object) {
                return 'object';
            }
            return typeof val;
        };
        Property._compareTypes = function (val1, val2) {
            if (Property._getType(val1) === Property._getType(val2)) {
                return true;
            }
            else {
                return false;
            }
        };
        Property.prototype._validVal = function (val) {
            var flag = true;
            if (!!this.type) {
                if (!this._validType(val)) {
                    Debug.error("Type of property [" + this.name + "] set as " + this.type.toString() + ", but got " + typeof val);
                    flag = false;
                }
            }
            if (!!this.readonly) {
                Debug.error("Property [" + this.name + "] set Readonly flag.");
                flag = false;
            }
            return flag;
        };
        Property.prototype._parseOptions = function (options) {
            this.type = !!options.type ? options.type : null;
            this.readonly = !!options.readonly ? options.readonly : null;
            if (!!options.pipes) {
                this.pipes = this.pipes.concat(options.pipes);
            }
        };
        Property.prototype._validType = function (value) {
            if (value instanceof Array && this.type.toString() === 'array') {
                return true;
            }
            if (typeof value === this.type.toString()) {
                return true;
            }
            else {
                return false;
            }
        };
        Property.prototype.doReadonly = function (options) {
            this.readonly = !!options.readonly ? options.readonly : null;
        };
        Property.prototype.doType = function (options) {
            this.type = !!options.type ? options.type : null;
        };
        Property.prototype.doPipes = function (options) {
            if (!!options.pipes) {
                this.pipes = this.pipes.concat(options.pipes);
            }
        };
        return Property;
    }());

    var Units;
    (function (Units) {
        var StoreSubsMethods;
        (function (StoreSubsMethods) {
            StoreSubsMethods[StoreSubsMethods["join"] = 0] = "join";
        })(StoreSubsMethods = Units.StoreSubsMethods || (Units.StoreSubsMethods = {}));
        function findChannelInStore(name) {
            var channels = Store$1.channels;
            for (var _i = 0, channels_1 = channels; _i < channels_1.length; _i++) {
                var channel = channels_1[_i];
                if (name === channel.name) {
                    return channel;
                }
            }
            return null;
        }
        Units.findChannelInStore = findChannelInStore;
        function subscribeOnStore(sub) {
            Store$1.addSubscriber(sub);
            return null;
        }
        Units.subscribeOnStore = subscribeOnStore;
        function addChannelToStore(channel) {
            if (channel instanceof Channel) {
                Store$1.addChannel(channel);
            }
            else {
                throw new Error('В хранилище можно добавлять только IChannel');
            }
        }
        Units.addChannelToStore = addChannelToStore;
        function createChannel(name) {
            if (!!name && name !== '') {
                Store$1.createChannel(name);
            }
            else {
                throw new Error('Вы не передали имя');
            }
        }
        Units.createChannel = createChannel;
        function isDotString(val) {
            var arr = val.split('.');
            if (arr.length > 1) {
                return true;
            }
            else {
                return false;
            }
        }
        Units.isDotString = isDotString;
        function dotSyntaxSet(property, propTrace, value) {
            if (property instanceof Property) {
                var explodePropTrace = propTrace.split('.');
                var state = property.value;
                var obj = {};
                var l = explodePropTrace.length;
                var i = 1;
                for (var _i = 0, explodePropTrace_1 = explodePropTrace; _i < explodePropTrace_1.length; _i++) {
                    var prop = explodePropTrace_1[_i];
                    if (prop in state) {
                        if (l === i) {
                            Units.defineProperty(obj, prop, value);
                        }
                        else {
                            Units.defineProperty(obj, prop, state[prop]);
                        }
                        state = state[prop];
                    }
                    else {
                        throw new Error("Property " + prop + " in not define");
                    }
                    i++;
                }
                var newObj = {};
                var subState = obj;
                var j = 1;
                var stateArr = [];
                for (var _a = 0, explodePropTrace_2 = explodePropTrace; _a < explodePropTrace_2.length; _a++) {
                    var prop = explodePropTrace_2[_a];
                    if (prop in subState) {
                        if (j === l) {
                            subState[prop] = value;
                            stateArr.push(subState);
                            newObj = stateArr[0];
                            break;
                        }
                        subState = subState[prop];
                        stateArr.push(subState);
                        newObj[explodePropTrace[0]] = stateArr[0];
                    }
                    else {
                        throw new Error("Property " + prop + " in not define");
                    }
                    j++;
                }
                Object.assign(property.value, newObj);
                return property;
            }
            else {
                throw new Error('Property [' + property + '] don`t follow IProperty');
            }
        }
        Units.dotSyntaxSet = dotSyntaxSet;
        function dotSyntaxGet(property, propTrace) {
            if (property instanceof Property) {
                if (typeof propTrace === 'string') {
                    var explodePropTrace = propTrace.split('.');
                    var state = property.value;
                    for (var _i = 0, explodePropTrace_3 = explodePropTrace; _i < explodePropTrace_3.length; _i++) {
                        var prop = explodePropTrace_3[_i];
                        if (prop in state) {
                            state = state[prop];
                        }
                        else {
                            throw new Error("Property " + prop + " in not define");
                        }
                    }
                    return state;
                }
                else {
                    throw new Error('PropertyTrace isn`t string');
                }
            }
            else {
                throw new Error('Property don`t follow IProperty');
            }
        }
        Units.dotSyntaxGet = dotSyntaxGet;
        function dotSyntaxClear(property, propTrace) {
            if (property instanceof Property) {
                if (typeof propTrace === 'string') {
                    var explodePropTrace = propTrace.split('.');
                    var state = property.value;
                    for (var _i = 0, explodePropTrace_4 = explodePropTrace; _i < explodePropTrace_4.length; _i++) {
                        var prop = explodePropTrace_4[_i];
                        if (prop in state) {
                            state = state[prop];
                        }
                        else {
                            throw new Error("Property " + prop + " in not define");
                        }
                    }
                    return state;
                }
                else {
                    throw new Error('PropertyTrace isn`t string');
                }
            }
            else {
                throw new Error('Property don`t follow IProperty');
            }
        }
        Units.dotSyntaxClear = dotSyntaxClear;
        function defineProperty(object, prop, value, enumerable) {
            if (enumerable === void 0) { enumerable = true; }
            Object.defineProperty(object, prop, {
                value: value,
                enumerable: enumerable,
                writable: true
            });
        }
        Units.defineProperty = defineProperty;
        function assignOptions(options) {
            var res = Object.assign(Config$1.PROPERTY_OPTIONS, options);
            return res;
        }
        Units.assignOptions = assignOptions;
        function mergeChannels() {
            var channels = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                channels[_i] = arguments[_i];
            }
            var res = {};
            for (var _a = 0, channels_2 = channels; _a < channels_2.length; _a++) {
                var channel = channels_2[_a];
                Units.defineProperty(res, channel.name, channel.getAll());
            }
            return res;
        }
        Units.mergeChannels = mergeChannels;
        function mergeAllChannels() {
            var res = {};
            for (var _i = 0, _a = Store$1.channels; _i < _a.length; _i++) {
                var channel = _a[_i];
                Units.defineProperty(res, channel.name, channel.getAll());
            }
            return res;
        }
        Units.mergeAllChannels = mergeAllChannels;
        function registerPipe(name, fn) {
            Store$1.addPipe(name, fn);
        }
        Units.registerPipe = registerPipe;
        function getGlobalPipe(name) {
            var pipe = Store$1.pipes.filter(function (pipe) {
                return pipe.name === name;
            });
            return pipe[0];
        }
        Units.getGlobalPipe = getGlobalPipe;
    })(Units || (Units = {}));
    var Units$1 = Units;
    //# sourceMappingURL=index.js.map

    var Channel = /** @class */ (function () {
        function Channel(name, options) {
            if (options === void 0) { options = null; }
            this.name = null;
            this.properties = [];
            this.name = name;
            var channel = Units$1.findChannelInStore(name);
            if (!!options && !!options.unique) {
                channel = this;
                Debug.warn('If you use option [unique], then we a recommended to use this channel as local storage.');
            }
            if (channel === null) {
                if (!!options && !!options.await) {
                    return this._awaitChannel(name);
                }
                else {
                    Units$1.addChannelToStore(this);
                    return this;
                }
            }
            else {
                return channel;
            }
        }
        Channel.prototype._awaitChannel = function (name) {
            var promise = new Promise(function (resolve) {
                var fn = function (channel) {
                    if (name === channel.name) {
                        resolve(channel);
                    }
                };
                Units$1.subscribeOnStore({
                    method: 'join',
                    event: fn
                });
            });
            return promise;
        };
        Channel.prototype._findProperty = function (name) {
            for (var _i = 0, _a = this.properties; _i < _a.length; _i++) {
                var prop = _a[_i];
                if (prop.name === name) {
                    return prop;
                }
            }
            return null;
        };
        Channel.prototype.setOptions = function (props) {
            return this;
        };
        Channel.prototype.set = function (nameProp, value, options) {
            if (Units$1.isDotString(nameProp)) {
                var currentProperty = this._findProperty(nameProp.split('.')[0]);
                var propTrace = nameProp.split('.').slice(1);
                var res = Units$1.dotSyntaxSet(currentProperty, propTrace.join('.'), value);
                return this;
            }
            else {
                var currentProp = this._findProperty(nameProp);
                if (!!currentProp) {
                    currentProp.value = value;
                }
                else {
                    this.properties.push(new Property(nameProp, value, options));
                }
                return this;
            }
        };
        Channel.prototype.get = function (nameProp) {
            var isDotSyntax = Units$1.isDotString(nameProp);
            if (isDotSyntax) {
                var rootElSlug = nameProp.split('.')[0];
                var rootEl = this._findProperty(rootElSlug);
                var res = Units$1.dotSyntaxGet(rootEl, nameProp.split('.').slice(1).join('.'));
                return res;
            }
            else {
                if (!!this._findProperty(nameProp)) {
                    return this._findProperty(nameProp).value;
                }
                else {
                    Debug.error("Property " + nameProp + " in not define. Returned default null.");
                    return null;
                }
            }
            //return this._findProperty(nameProp).value
        };
        Channel.prototype.getAll = function () {
            var obj = {};
            for (var _i = 0, _a = this.properties; _i < _a.length; _i++) {
                var prop = _a[_i];
                Object.defineProperty(obj, prop.name, {
                    value: prop.value,
                    enumerable: true,
                    writable: true
                });
            }
            return obj;
        };
        Channel.prototype.assign = function () {
            var props = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                props[_i] = arguments[_i];
            }
            var resObj = {};
            for (var _a = 0, props_1 = props; _a < props_1.length; _a++) {
                var prop = props_1[_a];
                var findProp = this._findProperty(prop);
                if (!!findProp) {
                    Object.assign(resObj, findProp.value);
                }
                else {
                    Debug.error("Property " + prop + " is not define.");
                }
            }
            return resObj;
        };
        Channel.prototype.clear = function (propName) {
            if (Units$1.isDotString(propName)) {
                var mainProp = propName.split('.')[0];
                var findedProp = this._findProperty(mainProp);
                if (!!findedProp) {
                    Units$1.dotSyntaxClear(this._findProperty(mainProp), propName.split('.').slice(1).join('.'));
                }
                else {
                    Debug.error("Property " + propName + " is not define.");
                }
            }
            else {
                var listNames = this.properties.map(function (el) {
                    return el.name;
                });
                var index = listNames.indexOf(propName);
                if (index !== -1) {
                    this.properties.splice(index, 1);
                }
                else {
                    Debug.error("Property " + propName + " is not define.");
                }
            }
        };
        Channel.prototype.fill = function (object) {
            if (object instanceof Object) {
                var newList = [];
                for (var key in object) {
                    newList.push(new Property(key, object[key]));
                }
                this.properties = newList;
            }
            else {
                Debug.error("Method fill takes prop as Object.");
            }
            return this;
        };
        Channel.prototype.pipe = function (event) {
            event(this);
            return this;
        };
        Channel.mergeChannels = function () {
            var channels = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                channels[_i] = arguments[_i];
            }
            return Units$1.mergeChannels.apply(Units$1, channels);
        };
        Channel.getAll = function () {
            return Units$1.mergeAllChannels();
        };
        Channel.pipe = function (name, fn) {
            if (name === void 0) { name = null; }
            Units$1.registerPipe(name, fn);
        };
        return Channel;
    }());
    //# sourceMappingURL=Channel.js.map

    //# sourceMappingURL=index.js.map

    return Channel;

})));
