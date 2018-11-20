import Channel from './Channel'

class Store implements IStore{
    static instance: Store = null;
    channels: Array<IChannel> = [];
    pipes: Array<IPipe> = [];
    subscribers: Array<IStoreSubscriber> = [];

    constructor(){
        Store.instance = this;
    }

    protected _findChannel(name: string): IChannel{
        for(let channel of this.channels){
            if(name === channel.name){
                return channel;
            }
        }
        return null;
    }

    getInstance(){
        return Store.instance;
    }

    addChannel(channel: IChannel): IChannel{
        if(channel instanceof Channel){
            this._notifyJoin(channel);
            this.channels.push(channel);
            return channel;
        }else{
            throw new Error('Можно добавть только IChannel');
        }
    }

    addPipe(name: string, fn: Function){
        if(fn instanceof Function){
            this.pipes.push({name, fn});
        }else{
            throw new Error('Можно добавть только IPipe');
        }
    }

    join(channelName: string): IChannel{
        return this._findChannel(channelName);
    }

    createChannel(name: string): IChannel{
        let newChannel = new Channel(name);
        this.channels.push(newChannel);
        return newChannel;
    }

    addSubscriber(sub: IStoreSubscriber){
        this.subscribers.push(sub);
        return this;
    }

    protected _notifyJoin(channel: IChannel){
        let resSubs = this.subscribers.filter( el => {
            return el.method === 'join'
        });
        resSubs.forEach( el => {
            el.event(channel);
        });
    }

}

export {Store}
export default new Store().getInstance();