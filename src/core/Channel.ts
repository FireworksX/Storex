import Units, {default as Units} from './units/index'
import Property from "./Property";
import Middleware from "./Midleware";
import {Debug} from "./units/debug";

class Channel implements IChannel{
    name: string = null;
    properties: Array<IProperty> = [];

    constructor(name: string, options?: IChannelOptions = null){
        this.name = name;
        let channel = Units.findChannelInStore(name);
        if(!!options && !!options.unique){
            channel = this;
            Debug.warn('If you use option [unique], then we a recommended to use this channel as local storage.');
        }
        if(channel === null){
            if(!!options && !!options.await){
                return this._awaitChannel(name);
            }else{
                Units.addChannelToStore(this);
                return this;
            }
        }else{
            return channel
        }
    }

    protected _awaitChannel(name): Promise<IChannel>{
        let promise = new Promise((resolve) => {
            let fn = (channel) => {
                if(name === channel.name){
                    resolve(channel);
                }
            };
            Units.subscribeOnStore({
                method: 'join',
                event: fn
            });
        });
        return promise;
    }

    private _findProperty(name: string): IProperty{
        for(let prop of this.properties){
            if(prop.name === name){
                return prop;
            }
        }
        return null;
    }

    setOptions(props: IChannelOptions): IChannel{
        return this;
    }

    set(nameProp: string, value: any, options?: IPropertyOptions): IChannel {
        if(Units.isDotString(nameProp)){
            let currentProperty = this._findProperty(nameProp.split('.')[0]);
            let propTrace = nameProp.split('.').slice(1);
            let res = Units.dotSyntaxSet(currentProperty, propTrace.join('.'), value);
            return this;
        }else{
            let currentProp = this._findProperty(nameProp);
            if(!!currentProp){
                currentProp.value = value;
            }else{
                this.properties.push(new Property(nameProp, value, options));
            }
            return this;
        }
    }

    get(nameProp){
        let isDotSyntax = Units.isDotString(nameProp);
        if(isDotSyntax){
            let rootElSlug = nameProp.split('.')[0];
            let rootEl = this._findProperty(rootElSlug);
            let res = Units.dotSyntaxGet(rootEl, nameProp.split('.').slice(1).join('.'));
            return res;
        }else{
            if(!!this._findProperty(nameProp)){
                return this._findProperty(nameProp).value;
            }else{
                Debug.error(`Property ${nameProp} in not define. Returned default null.`);
                return null;
            }
        }
        //return this._findProperty(nameProp).value
    }

    getAll(){
        let obj: any = {};
        for(let prop of this.properties){
            Object.defineProperty(obj, prop.name, {
                value: prop.value,
                enumerable: true,
                writable: true
            })
        }
        return obj;
    }

    assign(...props){
        let resObj = {};
        for(let prop of props){
            let findProp = this._findProperty(prop);
            if(!!findProp){
                Object.assign(resObj, findProp.value);
            }else{
                Debug.error(`Property ${prop} is not define.`);
            }

        }
        return resObj;
    }

    clear(propName: string): void{
        if(Units.isDotString(propName)){
            let mainProp = propName.split('.')[0];
            let findedProp = this._findProperty(mainProp);
            if(!!findedProp){
                Units.dotSyntaxClear(this._findProperty(mainProp), propName.split('.').slice(1).join('.'));
            }else{
                Debug.error(`Property ${propName} is not define.`);
            }
        }else{
            let listNames = this.properties.map( el => {
                return el.name;
            });
            let index = listNames.indexOf(propName);
            if(index !== -1){
                this.properties.splice(index, 1);
            }else{
                Debug.error(`Property ${propName} is not define.`);
            }
        }
    }

    fill(object): IChannel{
        if(object instanceof Object){
            let newList = [];
            for(let key in object){
                newList.push(new Property(key, object[key]));
            }
            this.properties = newList;
        }else{
            Debug.error(`Method fill takes prop as Object.`);
        }
        return this;
    }

    pipe(event: Function): IChannel{
        event(this);
        return this;
    }

    static mergeChannels(...channels){
        return Units.mergeChannels(...channels);
    }

    static getAll(){
        return Units.mergeAllChannels();
    }

    static pipe(name: string = null, fn: Function){
        Units.registerPipe(name, fn);
    }

    // static middleware(name: string){
    //     return new Middleware(name);
    // }
    //
    // static use(middleware: Middleware){
    //     if(!!middleware){
    //         if(middleware instanceof Middleware){
    //
    //         }else{
    //             Debug.error(`Middleware should be Middleware class. Use [Storex.createMiddleware()]`);
    //         }
    //     }else{
    //         Debug.error(`Prop [middleware] is not define.`)
    //     }
    // }

}

export default Channel