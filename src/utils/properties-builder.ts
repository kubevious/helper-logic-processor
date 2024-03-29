import _ from 'the-lodash';

export type PostBuildActionFunc = (props: Record<string, any>) => Record<string, any>;
export type FormatterFunc = (value: any) => any;

export class PropertiesBuilder
{
    private _itemConfig: any;
    private _properties : Record<string, any> = {};
    private _postBuildAction? : PostBuildActionFunc;

    constructor(itemConfig: any, postBuildAction?: PostBuildActionFunc)
    {
        this._itemConfig = itemConfig;
        this._properties = {};
        this._postBuildAction = postBuildAction;
    }

    fromConfig(name: string, valuePath: string, defaultValue?: any, formatter?: FormatterFunc) : PropertiesBuilder
    {
        return this.fromObject(this._itemConfig, name, valuePath, defaultValue, formatter);
    }

    fromObject(obj: any, name: string, valuePath: string, defaultValue?: any, formatter?: FormatterFunc) : PropertiesBuilder
    {
        let value = _.get(obj, valuePath);
        this.add(name, value, defaultValue, formatter);
        return this;
    }

    add(name: string, value: any, defaultValue?: any, formatter?: FormatterFunc) : PropertiesBuilder
    {
        if (_.isUndefined(value)) {
            value = defaultValue;
        }

        if (formatter) {
            if (!_.isUndefined(value)) {
                value = formatter(value);
            }
        }

        if (!_.isUndefined(value)) {
            this._properties[name] = value;
        }

        return this;
    }

    get(name: string) : any {
        return this._properties[name];
    }

    build() : Record<string, any>
    {
        if (this._postBuildAction) {
            return this._postBuildAction(this._properties);
        }
        return this._properties;
    }
}
