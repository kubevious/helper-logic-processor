import _ from 'the-lodash';

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

export class RoleHelper {

    makeRulesMap() : RulesMap
    {
        return <RulesMap>{};
    }

    addRule(rulesMap: RulesMap, api : string, resource: string, name: string, verbs: string[]) {

        let apiKey = makeKey(api, resource);
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
        for(var key of _.keys(b))
        {
            var bValue = b[key];
            if (!a[key]) {
                a[key] = {
                    api: bValue.api,
                    items: []
                }
            }
    
            for(var bItem of bValue.items)
            {
                var aItem = _.cloneDeep(bItem);
                if (targetNamespace) {
                    aItem.namespace = targetNamespace;
                }
                a[key].items.push(aItem);
            }
        }
        return a;
    }

    optimizeRulesMap(rulesMap : RulesMap) {

        for(var key of _.keys(rulesMap))
        {
            var apiRules = rulesMap[key];
            apiRules.items = this._optimizeRulesItems(apiRules.items);
        }
        return rulesMap;
    }

    private _optimizeRulesItems(items : RuleItem[]) : RuleItem[]
    {
        let allNsNamedMap : Record<string, Record< string, VerbsDict>> = {};
        for(var item of items)
        {
            if (!item.namespace || item.namespace == '*')
            {
                if (item.name != '*') {
                    addToNsMap(allNsNamedMap, '*', item);
                }
            }
        }
        for(var item of items)
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
        for(var item of items)
        {
            if (item.namespace && item.namespace != '*')
            {
                if (!isAllNsRulePresent(allNsNamedMap, item)) {
                    addToNsMap(allNsNamedMap, item.namespace, item);
                }
            }
        }

        var newItems = [];
        for(var ns of _.keys(allNsNamedMap))
        {
            for(var name of _.keys(allNsNamedMap[ns]))
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

    buildRoleMatrix(rulesMap : RulesMap) {

        var usedVerbs = {};
        for(var apiRules of _.values(rulesMap))
        {
            for(var item of apiRules.items)
            {
                _.defaults(usedVerbs, item.verbs);
            }
        }
    
        var headers : any[] = [
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
    
        var verbHeaders = _.keys(usedVerbs);
        verbHeaders = _.orderBy(verbHeaders, x => {
            var order = K8S_RBAC_VERBS_ORDER[x];
            if (order) {
                return order;
            }
            return 0;
        })
        
        let verbHeaders2 = verbHeaders.map(x => ({
            id: x,
            kind: 'check'
        }))
    
        headers = _.concat(headers, verbHeaders2);
    
        var rows = [];
        for(var apiRules of _.values(rulesMap))
        {
            for(var item of apiRules.items)
            {
                var row = {
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
    
        var roleTableConfig = {
            headers: headers,
            rows: rows
        }
    
        var config = {
            kind: "table",
            id: "resource-role-matrix",
            title: "Resource Role Matrix",
            order: 8,
            config: roleTableConfig
        };
    
        return config;
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
    for(var x of _.keys(bVerbs)) {
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
    var verbsDict = allNsNamedMap[ns][item.name]
    if (!verbsDict) {
        verbsDict = {}
        allNsNamedMap[ns][item.name] = verbsDict;
    }
    _.defaults(verbsDict, item.verbs);
}

function makeKey(api : string, resource: string) : string
{
    var key;
    if (api) {
        key = api + '/' + resource;
    } else {
        key = resource;
    }
    return key.toLowerCase();
}


const K8S_RBAC_VERBS = ["get", "list", "watch", "create", "update", "patch", "delete"];
const K8S_RBAC_VERBS_ORDER : Record<string, number> = {};
for(var i = 0; i < K8S_RBAC_VERBS.length; i++) {
    K8S_RBAC_VERBS_ORDER[K8S_RBAC_VERBS[i]] = i;
}