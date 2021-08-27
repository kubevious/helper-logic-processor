import _ from 'the-lodash';
import { Promise } from 'the-promise';

import { LabelSelector } from "kubernetes-types/meta/v1";
import { DumpWriter, ILogger } from "the-logger";
import { K8sConfig, LogicItem } from "../..";
import { LabelMap, LabelMatcher } from "./label-matcher";


type ResourceKindMap = {
    clustered: LabelMatcher,
    namespaced: { [ namespace : string ] : LabelMatcher }
}

type GlobalMap = { [ kind: string ] : ResourceKindMap };


export class GlobalLabelMatcher
{
    private _dict : GlobalMap = {};
    private _logger : ILogger;
    
    constructor(logger: ILogger)
    {
        this._logger = logger.sublogger('GlobalLabelMatcher');
    }

    register(config: K8sConfig, item: LogicItem)
    {
        let labels : LabelMap;
        if (config.metadata && config.metadata.labels) {
            labels = config.metadata.labels;
        } else {
            labels = {};
        }

        this.registerManual(config.kind, config.metadata!.namespace, labels, item);
    }

    registerManual(kind: string, namespace: string | null | undefined, labels : LabelMap, item: LogicItem)
    {
        let resourceMap = this._dict[kind];
        if (!resourceMap) {
            resourceMap = {
                clustered: new LabelMatcher(),
                namespaced: {}
            };
            this._dict[kind] = resourceMap;
        }

        let matcher: LabelMatcher;
        if (namespace)
        {
            matcher = resourceMap.namespaced[namespace];
            if (!matcher) {
                matcher = new LabelMatcher();
                resourceMap.namespaced[namespace] = matcher;
            }
        }
        else
        {
            matcher = resourceMap.clustered;
        }

        if (!labels) {
            labels = {};
        }

        matcher.register(labels, item);
    }


    matchSelector(kindOrKinds: string | string[], namespace: string | null, selector: LabelSelector)
    {
        if (_.isString(kindOrKinds))
        {
            return this._matchSelector(kindOrKinds, namespace, selector);
        }

        return _.flatten(
            kindOrKinds.map(x => this._matchSelector(x, namespace, selector))
        );
    }

    private _matchSelector(kind: string, namespace: string | null, selector: LabelSelector)
    {
        let resourceMap = this._dict[kind];
        if (!resourceMap) {
            return [];
        }

        let matcher: LabelMatcher;
        if (namespace)
        {
            matcher = resourceMap.namespaced[namespace];
            if (!matcher) {
                return []
            }
        }
        else
        {
            matcher = resourceMap.clustered;
        }

        return matcher.matchSelector(selector);
    }


    public dumpToFile()
    {
        return Promise.resolve()
            .then(() => {
                let writer = this._logger.outputStream("global-label-matcher.txt");
                if (writer) {
                    this._debugOutputToFile(writer);
                    return writer.close();
                }
            })
    }

    private _debugOutputToFile(writer: DumpWriter)
    {
        writer.write(`**** BEGIN`).newLine();

        for(let kind of _.keys(this._dict))
        {
            writer.write(`KIND: ${kind}`)
                  .newLine()
                  .indent();

            let kindMap = this._dict[kind];

            writer.write(`>>> Clustered`)
                .newLine();
            this._debugOutputMatcherToFile(kindMap.clustered, writer);
            
            for(let ns of _.keys(kindMap.namespaced))
            {
                writer.write(`>>> Namespace: ${ns}`)
                    .newLine();
                    
                const namespaceMatcher = kindMap.namespaced[ns];
                this._debugOutputMatcherToFile(namespaceMatcher, writer);
            }

            writer.unindent();
        }

        writer.write(`**** END`).newLine();
    }

    private _debugOutputMatcherToFile(labelMatcher: LabelMatcher, writer: DumpWriter)
    {
        writer.indent();
        labelMatcher.debugOutputToFile(writer);
        writer.unindent();
    }
}