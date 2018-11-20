import Store from '../Store'
import Channel from "../Channel";
import Config from './config'
import Property from "../Property";

namespace Units{

    export enum StoreSubsMethods{
        'join'
    }

    export function findChannelInStore(name: string): IChannel{
        let channels = Store.channels;
        for(let channel of channels){
            if(name === channel.name){
                return channel;
            }
        }
        return null;
    }

    export function subscribeOnStore(sub: IStoreSubscriber){
        Store.addSubscriber(sub);
        return null;
    }

    export function addChannelToStore(channel: IChannel) {
        if(channel instanceof Channel){
            Store.addChannel(channel);
        }else{
            throw new Error('В хранилище можно добавлять только IChannel');
        }
    }

    export function createChannel(name: string) {
        if(!!name && name !== ''){
            Store.createChannel(name);
        }else{
            throw new Error('Вы не передали имя');
        }
    }

    export function isDotString(val: string): boolean {
        let arr = val.split('.');
        if(arr.length > 1){
            return true
        }else{
            return false
        }
    }
    
    export function dotSyntaxSet(property: IProperty, propTrace: string, value): IProperty {
        if(property instanceof Property){
            let explodePropTrace = propTrace.split('.');
            let state = property.value;
            let obj = {};
            let l = explodePropTrace.length;
            let i = 1;
            for(let prop of explodePropTrace){
                if(prop in state){
                    if(l === i){
                        Units.defineProperty(obj, prop, value);
                    }else {
                        Units.defineProperty(obj, prop, state[prop]);
                    }

                    state = state[prop];
                }else{
                    throw new Error(`Property ${prop} in not define`);
                }
                i++;
            }

            let newObj: object = {};

            let subState = obj;
            let j = 1;
            let stateArr = [];
            for(let prop of explodePropTrace){
                if(prop in subState){
                    if(j === l){
                        subState[prop] = value;
                        stateArr.push(subState);
                        newObj = stateArr[0];
                        break;
                    }
                    subState = subState[prop];
                    stateArr.push(subState);
                    newObj[explodePropTrace[0]] = stateArr[0]
                }else{
                    throw new Error(`Property ${prop} in not define`);
                }
                j++;
            }

            Object.assign(property.value, newObj);
            return property;

        }else{
            throw new Error('Property [' + property + '] don`t follow IProperty');
        }
    }

    export function dotSyntaxGet(property: IProperty, propTrace: string): any {
        if(property instanceof Property){
            if(typeof propTrace === 'string'){
                let explodePropTrace = propTrace.split('.');
                let state = property.value;
                for(let prop of explodePropTrace){
                    if(prop in state){
                        state = state[prop];
                    }else{
                        throw new Error(`Property ${prop} in not define`);
                    }
                }
                return state;
            }else{
                throw new Error('PropertyTrace isn`t string');
            }
        }else{
            throw new Error('Property don`t follow IProperty');
        }
    }

    export function dotSyntaxClear(property: IProperty, propTrace: string): any {
        if(property instanceof Property){
            if(typeof propTrace === 'string'){
                let explodePropTrace = propTrace.split('.');
                let state = property.value;
                for(let prop of explodePropTrace){
                    if(prop in state){
                        state = state[prop];
                    }else{
                        throw new Error(`Property ${prop} in not define`);
                    }
                }
                return state;
            }else{
                throw new Error('PropertyTrace isn`t string');
            }
        }else{
            throw new Error('Property don`t follow IProperty');
        }
    }
    
    export function defineProperty(object: object, prop, value, enumerable = true) {
        Object.defineProperty(object, prop, {
            value,
            enumerable,
            writable: true
        })
    }

    export function assignOptions(options: IPropertyOptions): IPropertyOptions {
        let res = Object.assign(Config.PROPERTY_OPTIONS, options);
        return res;
    }

    export function mergeChannels(...channels: Array<IChannel>) {
        let res = {};
        for(let channel of channels){
            Units.defineProperty(res, channel.name, channel.getAll());
        }
        return res;
    }

    export function mergeAllChannels() {
        let res = {};
        for(let channel of Store.channels){
            Units.defineProperty(res, channel.name, channel.getAll());
        }
        return res;
    }

    export function registerPipe(name: string, fn: Function): void {
        Store.addPipe(name, fn);
    }

    export function getGlobalPipe(name: string): IPipe {
        let pipe = Store.pipes.filter( pipe => {
           return pipe.name === name;
        });
        return pipe[0];
    }

}

export default Units;