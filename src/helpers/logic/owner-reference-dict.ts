import _ from 'the-lodash';
import { OwnerReference } from "kubernetes-types/meta/v1";
import { LogicItem } from "../../logic/item";

export class OwnerReferenceDict
{
    private _dict : Record<string, OwnerReferenceDictItem> = {};

    private _get(ref: OwnerReference)
    {
        const key = _.stableStringify({
            apiVersion: ref.apiVersion,
            kind: ref.kind,
            name: ref.name
        });

        let value = this._dict[key];
        if (!value) {
            value = {
                ref: ref,
                items: []
            }
            this._dict[key] = value;
        }
        return value;
    }

    getItems() {
        return _.values(this._dict);
    }

    register(ref: OwnerReference, item: LogicItem)
    {
        const value = this._get(ref);
        value.items.push(item);
    }
}

export interface OwnerReferenceDictItem
{
    ref: OwnerReference;
    items: LogicItem[];
}
