import _ from 'the-lodash';
import { LogicItem } from '../item';

export class AppScope
{
    private _parent : any;
    private _name : string;
    private _item : LogicItem;

    private _ports : Record<string, any> = {};
    private _properties : Record<string, any> = {};

    constructor(parent : any, name : string)
    {
        this._parent = parent; 

        this._name = name;

        this._item = this.namespaceScope.item.fetchByNaming("app", name);

        this._ports = {};
        this._properties = {
            'Exposed': 'No'
        }
    }

    get parent() {
        return this._parent;
    }

    get namespaceScope() {
        return this.parent;
    }

    get namespace() {
        return this.namespaceScope.item;
    }

    get name() {
        return this._name;
    }

    get item() {
        return this._item;
    }

    get ports() {
        return this._ports;
    }

    get properties() {
        return this._properties;
    }

    get containerItems() : LogicItem[] {
        return this.item.getChildrenByKind('cont');
    }

    get initContainerItems() : LogicItem[] {
        return this.item.getChildrenByKind('initcont');
    }

    get allContainerItems() : LogicItem[] {
        return _.union(this.initContainerItems, this.containerItems);
    }
}
