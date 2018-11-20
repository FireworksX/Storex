import {Debug} from "./units/debug";
import Units, {default as Units} from './units/index'

class Property implements IProperty{
    name: string = null;
    pipes: Array<IPipe|String|Function> = [];
    value_: any = null;
    type: PropertyTypes = null;
    readonly: boolean = false;

    constructor(name: string, value: any, options?: IPropertyOptions = null){
        this.name = name;
        if(!!options){
            //this._parseOptions(options);
            this.doPipes(options);
            this.value = value;
            this.doReadonly(options);
            this.doType(options);
        }else{
            this.value = value;
        }
    }

    get value(){
        return this.value_;
    }

    set value(val){
        if(this._validVal(val)){
            this.pipes.forEach(pipe => {
                if(typeof pipe === 'string'){
                    let globPipe = Units.getGlobalPipe(pipe);
                    if(!!globPipe){
                        pipe = globPipe.fn;
                        val = pipe(val, this.value);
                    }else{
                        Debug.error(`Pipe [${pipe}] id not define.`);
                    }
                }else{
                    val = pipe(val, this.value);
                }

            });
            if(Property._compareTypes(val, this.value) && Property._getType(val) === 'array'){
                this.value_ = this.value.concat(val);
                return;
            }
            if(Property._compareTypes(val, this.value) && Property._getType(val) === 'object'){
                if(this.value === null) this.value_ = {};
                this.value_ = Object.assign(this.value, val);
                return;
            }
            this.value_ = val;
        }
    }

    static _getType(val){
        if(val instanceof Array){
            return 'array';
        }
        if(val instanceof Object){
            return 'object';
        }
        return typeof val;
    }

    static _compareTypes(val1, val2){
        if(Property._getType(val1) === Property._getType(val2)){
            return true;
        }else{
            return false;
        }
    }

    protected _validVal(val){
        let flag = true;

        if(!!this.type){
            if(!this._validType(val)){
                Debug.error(`Type of property [${this.name}] set as ${this.type.toString()}, but got ${typeof val}`);
                flag = false;
            }
        }

        if(!!this.readonly){
            Debug.error(`Property [${this.name}] set Readonly flag.`);
            flag = false;
        }

        return flag;
    }

    protected _parseOptions(options: IPropertyOptions){
        this.type = !!options.type ? options.type : null;
        this.readonly = !!options.readonly ? options.readonly : null;
        if(!!options.pipes){
            this.pipes = this.pipes.concat(options.pipes);
        }
    }

    protected _validType(value){
        if(value instanceof Array && this.type.toString() === 'array'){
            return true;
        }
        if(typeof value === this.type.toString()){
            return true;
        }else{
            return false;
        }
    }

    protected doReadonly(options: IPropertyOptions){
        this.readonly = !!options.readonly ? options.readonly : null;
    }

    protected doType(options: IPropertyOptions){
        this.type = !!options.type ? options.type : null;
    }

    protected doPipes(options: IPropertyOptions){
        if(!!options.pipes){
            this.pipes = this.pipes.concat(options.pipes);
        }
    }

}

export default Property