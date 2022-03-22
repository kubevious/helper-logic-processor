import _ from 'the-lodash';
import { PropsKind, PropsId } from '@kubevious/entity-meta';
import { ObjectMeta } from 'kubernetes-types/meta/v1';
import { LogicItem } from '..';
import { LogicRoleBindingRuntime } from '../types/parser/logic-rbac';
import { ClusterRoleBinding, RoleBinding } from 'kubernetes-types/rbac/v1';
import { LogicLinkKind } from '../logic/link-kind';

export type VerbsDict = Record<string, boolean>;

export interface RuleItem {
    name: string;
    namespace?: string;
    verbs: VerbsDict;
}

export interface RulesApiItem {
    api: { api: string, resource: string },
    items: RuleItem[]
}

export type RulesMap = Record<string, RulesApiItem>;

export interface HasRoleRulesMap
{
    rules: RulesMap;
}


export class RoleHelper {

    isDefaultRbacObject(metadata: ObjectMeta)
    {
        const labels = metadata?.labels;
        if (labels) {
            const k8sBootstrapping = labels['kubernetes.io/bootstrapping'];
            if (k8sBootstrapping) {
                return true;
            }
        }
        return false;
    }

    makeRulesMap() : RulesMap
    {
        return <RulesMap>{};
    }

    addRule(rulesMap: RulesMap, api : string, resource: string, name: string, verbs: string[]) {

        const apiKey = makeKey(api, resource);
        if (!rulesMap[apiKey]) {
            rulesMap[apiKey] = {
                api: {
                    api,
                    resource,
                },
                items: []
            };
        }
    
        rulesMap[apiKey].items.push({
            name,
            verbs: _.makeDict(verbs, x => x, x => true)
        });
    }

    combineRulesMap(a : RulesMap, b : RulesMap, targetNamespace? : string) {
        for(const key of _.keys(b))
        {
            const bValue = b[key];
            if (!a[key]) {
                a[key] = {
                    api: bValue.api,
                    items: []
                }
            }
    
            for(const bItem of bValue.items)
            {
                const aItem = _.cloneDeep(bItem);
                if (targetNamespace) {
                    aItem.namespace = targetNamespace;
                }
                a[key].items.push(aItem);
            }
        }
        return a;
    }

    optimizeRulesMap(rulesMap : RulesMap) {

        for(const key of _.keys(rulesMap))
        {
            const apiRules = rulesMap[key];
            apiRules.items = this._optimizeRulesItems(apiRules.items);
        }
        return rulesMap;
    }

    private _optimizeRulesItems(items : RuleItem[]) : RuleItem[]
    {
        const allNsNamedMap : Record<string, Record< string, VerbsDict>> = {};
        for(const item of items)
        {
            if (!item.namespace || item.namespace == '*')
            {
                if (item.name != '*') {
                    addToNsMap(allNsNamedMap, '*', item);
                }
            }
        }
        for(const item of items)
        {
            if (!item.namespace || item.namespace == '*')
            {
                if (item.name == '*') {
                    if (!isAllNsRulePresent(allNsNamedMap, item)) {
                        addToNsMap(allNsNamedMap, '*', item);
                    }
                }
            }
        }
        for(const item of items)
        {
            if (item.namespace && item.namespace != '*')
            {
                if (!isAllNsRulePresent(allNsNamedMap, item)) {
                    addToNsMap(allNsNamedMap, item.namespace, item);
                }
            }
        }

        const newItems = [];
        for(const ns of _.keys(allNsNamedMap))
        {
            for(const name of _.keys(allNsNamedMap[ns]))
            {
                newItems.push({
                    namespace: ns,
                    name: name,
                    verbs: allNsNamedMap[ns][name]
                });
            }
        }

        return newItems;
    }

    buildRoleMatrixTable(rulesMap : RulesMap)
    {
        const usedVerbs = {};
        for(const apiRules of _.values(rulesMap))
        {
            for(const item of apiRules.items)
            {
                _.defaults(usedVerbs, item.verbs);
            }
        }
    
        let headers : any[] = [
            {
                id: 'api',
                label: "API Group"
            },
            {
                id: 'resource',
                label: 'Resource'
            },
            {
                id: 'namespace',
                label: 'Namespace'
            },
            {
                id: 'name',
                label: 'Name'
            }
        ]
    
        let verbHeaders = _.keys(usedVerbs);
        verbHeaders = _.orderBy(verbHeaders, x => {
            const order = K8S_RBAC_VERBS_ORDER[x];
            if (order) {
                return order;
            }
            return 0;
        })
        
        const verbHeaders2 = verbHeaders.map(x => ({
            id: x,
            kind: 'check'
        }))
    
        headers = _.concat(headers, verbHeaders2);
    
        let rows = [];
        for(const apiRules of _.values(rulesMap))
        {
            for(const item of apiRules.items)
            {
                const row = {
                    api: apiRules.api.api,
                    resource: apiRules.api.resource,
                    name: item.name,
                    namespace : item.namespace || '*'
                }
                _.defaults(row, item.verbs);
                rows.push(row);
            }
        }
    
        rows = _.orderBy(rows, [
            'api', 
            'resource',
            'name'
        ]);
    
        const roleTableConfig = {
            headers: headers,
            rows: rows
        }

        return roleTableConfig;
    }

    buildRoleMatrixProps(rulesMap : RulesMap)
    {
        const roleTableConfig = this.buildRoleMatrixTable(rulesMap);
        
        const config = {
            kind: PropsKind.table,
            id: PropsId.resourceRoleMatrix,
            config: roleTableConfig
        };
    
        return config;
    }

    produceItemSubjectRoleMatrix(item: LogicItem, runtime: HasRoleRulesMap)
    {
        runtime.rules = this.makeRulesMap();

        const bindingItems = item.resolveSourceLinkItems(LogicLinkKind.subject);
        for(const bindingItem of bindingItems)
        {
            runtime.rules = this.combineRulesMap(
                runtime.rules,
                (<LogicRoleBindingRuntime>bindingItem.runtime).rules);
        } 

        runtime.rules = this.optimizeRulesMap(runtime.rules);

        item.addProperties(this.buildRoleMatrixProps(runtime.rules));
    }

    linkSubjectToBinding(subject: LogicItem, bindingItem: LogicItem, bindingObject: ClusterRoleBinding | RoleBinding)
    {
        let linkNamingParts = [
            bindingObject.kind,
            bindingObject.metadata?.namespace,
            bindingObject.metadata?.name
        ];
        linkNamingParts = linkNamingParts.filter(x => x);
        const linkNaming = linkNamingParts.join('_');

        subject.link(LogicLinkKind.binding, bindingItem, linkNaming);
    }
}

function isAllNsRulePresent(allNsNamedMap : Record<string, Record< string, VerbsDict>>, item : RuleItem)
{
    if (isAllNsRulePresentInNamespace(allNsNamedMap, '*', item))
    {
        return true;
    }
    if (item.namespace) 
    {
        if (item.namespace != '*') 
        {
            if (isAllNsRulePresentInNamespace(allNsNamedMap, item.namespace, item))
            {
                return true;
            }
        }
    }
    return false;
}

function isAllNsRulePresentInNamespace(allNsNamedMap : Record<string, Record< string, VerbsDict>>, ns : string, item : RuleItem)
{
    if (allNsNamedMap[ns]) {
        if (allNsNamedMap[ns]['*'])
        {
            if (areVerbsPresent(allNsNamedMap[ns]['*'], item.verbs)) {
                return true
            }
        }
    }
    return false;
}

function areVerbsPresent(aVerbs : VerbsDict, bVerbs : VerbsDict)
{
    for(const x of _.keys(bVerbs)) {
        if (!aVerbs[x]) {
            return false;
        }
    }
    return true;
}

function addToNsMap(allNsNamedMap : Record<string, Record< string, VerbsDict>>, ns : string, item : RuleItem)
{
    if (!allNsNamedMap[ns]) {
        allNsNamedMap[ns] = {};
    }
    let verbsDict = allNsNamedMap[ns][item.name]
    if (!verbsDict) {
        verbsDict = {}
        allNsNamedMap[ns][item.name] = verbsDict;
    }
    _.defaults(verbsDict, item.verbs);
}

function makeKey(api : string, resource: string) : string
{
    let key : string;
    if (api) {
        key = api + '/' + resource;
    } else {
        key = resource;
    }
    return key.toLowerCase();
}


const K8S_RBAC_VERBS = ["get", "list", "watch", "create", "update", "patch", "delete"];
const K8S_RBAC_VERBS_ORDER : Record<string, number> = {};
for(let i = 0; i < K8S_RBAC_VERBS.length; i++) {
    K8S_RBAC_VERBS_ORDER[K8S_RBAC_VERBS[i]] = i;
}