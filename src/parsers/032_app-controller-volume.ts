import _ from 'the-lodash';
import { LogicItem } from '../item';
import { LogicParser } from '../parser-builder';

export default LogicParser()
    .order(32)
    .target({
        path: ["ns", "app", "launcher"]
    })
    .kind('vol')
    .needNamespaceScope(true)
    .handler(({ scope, item, createItem, createAlert, namespaceScope }) => {


        let app = item.parent!;
        let appScope = app.appScope;

        let volumesProperties : Record<string, any> = {

        }
        let volumesConfig : any[] = _.get(item.config, 'spec.template.spec.volumes');
        if (!volumesConfig || !_.isArray(volumesConfig)) {
            volumesConfig = [];
        }
        let volumesMap = _.makeDict(volumesConfig, x => x.name, x => x);

        volumesProperties['Count'] = volumesConfig.length;
        appScope.properties['Volumes'] = volumesConfig.length;

        if (volumesConfig.length > 0)
        {
            let volumes = app.fetchByNaming("vol", "Volumes");

            volumes.addProperties({
                kind: "key-value",
                id: "properties",
                title: "Properties",
                order: 5,
                config: volumesProperties
            });  

            for(let volumeConfig of volumesConfig) {
                processVolumeConfig(
                    volumes, 
                    volumeConfig,
                    false);
            }

            for(let container of appScope.allContainerItems)
            {
                processContainerItem(container)
            }
        }

        function processContainerItem(container : LogicItem)
        {
            let volumeMounts = _.get(container.config, 'volumeMounts');
            if (!_.isArray(volumeMounts) || volumeMounts.length == 0) {
                return;
            }

            for(let volumeRefConfig of volumeMounts) {
                let volumeConfig = volumesMap[volumeRefConfig.name];
                if (volumeConfig) {
                    let volumeItem = processVolumeConfig(
                        container, 
                        volumeConfig,
                        true);

                    volumeItem.addProperties({
                        kind: "yaml",
                        id: "env",
                        title: "Mount Config",
                        order: 5,
                        config: volumeRefConfig
                    });  
                }
            }
        }

        /** HELPERS **/

        function processVolumeConfig(parent : LogicItem, volumeConfig: any, markUsedBy: boolean)
        {
            let volume = createItem(parent, volumeConfig.name);
            scope.setK8sConfig(volume, volumeConfig);
        
            if (volumeConfig.configMap) {
                findAndProcessConfigMap(volume, volumeConfig.configMap.name, markUsedBy, volumeConfig.configMap.optional)
            }

            if (volumeConfig.secret) {
                findAndProcessSecret(volume, volumeConfig.secret.secretName, markUsedBy)
            }

            return volume;
        }
        
        function findAndProcessConfigMap(parent : LogicItem, name: string, markUsedBy: boolean, isOptional: boolean)
        {
            let configMapScope = namespaceScope.items.get('ConfigMap', name);
            if (configMapScope)
            {
                let configmap = parent.fetchByNaming("configmap", name);
                scope.setK8sConfig(configmap, configMapScope.config);
                if (markUsedBy) {
                    configMapScope.markUsedBy(configmap);
                }
            }
            else
            {
                if (!isOptional) {
                    createAlert("MissingConfig", "error", 'Could not find ConfigMap ' + name);
                }
            }
            return configMapScope;
        }

        function findAndProcessSecret(parent : LogicItem, name: string, markUsedBy: boolean)
        {
            let secret = parent.fetchByNaming("secret", name);
            if (markUsedBy) {
                let secretScope = namespaceScope.items.fetch('Secret', name, null);
                secretScope.markUsedBy(secret);
            }
        }

    })
    ;
