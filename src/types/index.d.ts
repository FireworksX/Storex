declare interface IChannel {
    name: string
    properties: Array<IProperty>
    setOptions(props: IChannelOptions): IChannel
    set(nameProp: string, valProp: any, options?: IPropertyOptions): IChannel
    get(nameProp)
    assign<T>(...props): T
    clear(propName: string): void
    getAll(): any
    fill(data): IChannel
    pipe(event: Function): IChannel
}

declare enum PropertyTypes{
    'string',
    'number',
    'boolean',
    'object',
    'array'
}

declare enum StoreSubsMethods{
    'join'
}

declare interface IPropertyOptions{
    useDotSyntax: boolean
    type: PropertyTypes
    readonly: boolean
    append: boolean // Если массив, то добавить в массив, если объект, то ассоциировать
    pipes: Array<IPipe|String|Function>
}

declare interface IChannelOptions{
    await: boolean
    unique: boolean
}

declare interface IProperty{
    name: string
    value: any
    type?: PropertyTypes
    readonly?: boolean
}

declare interface IStoreSubscriber{
    method: string//StoreSubsMethods
    event: Function
}

declare interface IStore {
    subscribers: Array<IStoreSubscriber>
    pipes: Array<IPipe>
    getInstance(): IStore
    join(channelName: string): IChannel
    createChannel(name: string): IChannel
    addChannel(channel: IChannel): IChannel
    addSubscriber(sub: IStoreSubscriber): IStore
    addPipe(name: string, fn: Function): void
}

declare namespace Units{
    export function findChannelInStore(name: string): IChannel|null;
    export function subscribeOnStore(sub: IStoreSubscriber);
    export function addChannelToStore(channel: IChannel);
    export function createChannel(name: string);
    export function dotSyntaxSet(property: IProperty, propTrace: string, value: any): IProperty;
    export function dotSyntaxGet(property: IProperty, propTrace: string): any;
    export function defineProperty(object, propName, value);
    export function isDotString(val: string): boolean;
    export function mergeChannels(...channels: Array<IChannel>);
    export function mergeAllChannels();
    export function registerPipe(name: string, fn: Function): void;
    export function getGlobalPipe(name): IPipe;
}

declare namespace Config{
    const PROPERTY_OPTIONS: IChannelOptions
}

declare interface IPipe {
    name: string,
    fn: Function
}