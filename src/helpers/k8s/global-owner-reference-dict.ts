import _ from 'the-lodash';
import { DumpWriter, ILogger } from 'the-logger';
import { ObjectMeta, OwnerReference } from "kubernetes-types/meta/v1";
import { LogicItem } from "../../logic/item";
import { KubernetesUtils } from './k8s';

export class GlobalOwnerReferenceDict
{
    private _logger : ILogger;
    private _k8sUtils: KubernetesUtils;
    
    private _children : { [ parentDn: string ] : string[] } = {};
    private _parents : { [ childDn: string ] : string[] } = {};

    constructor(logger: ILogger, k8sUtils: KubernetesUtils)
    {
        this._logger = logger.sublogger('GlobalLabelMatcher');
        this._k8sUtils = k8sUtils;
    }
    
    registerOwners(item: LogicItem)
    {
        const metadata = item.config?.metadata as ObjectMeta;
        if (!metadata) {
            return; 
        }

        for(const ref of metadata.ownerReferences ?? [])
        {
            this._registerOwner(metadata, ref, item);
        }
    }

    getOwnerDns(item: LogicItem) : string[]
    {
        return this._parents[item.dn] ?? [];
    }

    private _registerOwner(metadata: ObjectMeta, ref: OwnerReference, item: LogicItem)
    {
        const keyData : Record<string, string> = {
            apiVersion: ref.apiVersion,
            kind: ref.kind,
            name: ref.name
        };
        if (metadata.namespace) {
            keyData.namespace = metadata.namespace;
        }

        const ownerDn = this._getParentDn(metadata, ref);

        if (!this._children[ownerDn]) {
            this._children[ownerDn] = [];
        }
        this._children[ownerDn].push(item.dn);

        if (!this._parents[item.dn]) {
            this._parents[item.dn] = [];
        }
        this._parents[item.dn].push(ownerDn);
    }

    private _getParentDn(metadata: ObjectMeta, ref: OwnerReference)
    {
        return this._k8sUtils.makeDn(
            metadata.namespace ?? null,
            ref.apiVersion,
            ref.kind,
            ref.name);
    }

    public dumpToFile()
    {
        return Promise.resolve()
            .then(() => {
                const writer = this._logger.outputStream("global-owner-references.txt");
                if (writer) {
                    this._debugOutputToFile(writer);
                    return writer.close();
                }
            })
    }

    private _debugOutputToFile(writer: DumpWriter)
    {
        writer.write(`**** PARENT to CHILD DICTIONARY ****`).newLine();

        for(const parentDn of _.keys(this._children))
        {
            writer.write(`+ ${parentDn}`);

            for(const childDn of this._children[parentDn])
            {
                writer.write(`+--> ${childDn}`);
            }

            writer.newLine();
        }

        writer.write(`**** END`).newLine();
    }

}

// export interface OwnerReferenceDictItem
// {
//     ref: OwnerReference;
//     items: LogicItem[];
// }
