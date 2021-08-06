import _ from 'the-lodash';
import { LogicItem } from '../../item';
import { LogicParser } from '../../parser-builder';

const yaml = require('js-yaml');

export default LogicParser()
    .order(31)
    .target({
        path: ["ns", "app", "launcher"]
    })
    .needNamespaceScope(true)
    .handler(({ scope, item, createItem, createAlert, namespaceScope }) => {

        let app = item.parent!;
        let appScope = app.appScope;

        // Normal Containers 
        {
            let containersConfig = _.get(item.config, 'spec.template.spec.containers');
            if (!containersConfig) {
                containersConfig = [];
            }
            appScope.properties['Container Count'] = containersConfig.length;
            if (_.isArray(containersConfig)) {
                for(let containerConfig of containersConfig)
                {
                    processContainer(containerConfig, "cont");
                }
            }
        }

        // Init Containers 
        {
            let containersConfig = _.get(item.config, 'spec.template.spec.initContainers');
            if (!containersConfig) {
                containersConfig = [];
            }
            appScope.properties['Init Container Count'] = containersConfig.length;
            if (_.isArray(containersConfig)) {
                for(let containerConfig of containersConfig)
                {
                    processContainer(containerConfig, "initcont");
                }
            }
        }


        /** HELPERS **/

        function processContainer(containerConfig: any, kind : string)
        {
            let container = createItem(app, containerConfig.name, { kind: kind });
            scope.setK8sConfig(container, containerConfig);

            if (containerConfig.image) {
                let image = containerConfig.image;
                let imageTag;
                let i = image.indexOf(':');
                let repository = 'docker';
                if (i != -1) {
                    imageTag = image.substring(i + 1);
                    image = image.substring(0, i);
                } else {
                    imageTag = 'latest';
                }

                let imageName = image;
                i = image.lastIndexOf('/');
                if (i != -1) {
                    repository = image.substring(0, i);
                    imageName = image.substring(i + 1);
                }

                let imageItem = container.fetchByNaming("image", image);
                imageItem.addProperties({
                    kind: "key-value",
                    id: "properties",
                    title: "Properties",
                    order: 10,
                    config: {
                        name: imageName,
                        tag: imageTag,
                        fullName: containerConfig.image,
                        repository: repository
                    }
                });  

            }

            let envVars : Record<string, any> = {
            }

            if (containerConfig.env) {
                for(let envObj of containerConfig.env) {
                    let value = null;
                    if (envObj.value) {
                        value = envObj.value;
                    } else if (envObj.valueFrom) {
                        value = "<pre>" + yaml.dump(envObj.valueFrom) + "</pre>";
                    }
                    envVars[envObj.name] = value;
                }
            }

            if (containerConfig.envFrom) {
                for(let envFromObj of containerConfig.envFrom) {
                    if (envFromObj.configMapRef) {
                        let configMapScope = findAndProcessConfigMap(container, envFromObj.configMapRef.name, true);
                        if (configMapScope) {
                            if (configMapScope.config.data) {
                                for(let dataKey of _.keys(configMapScope.config.data)) {
                                    envVars[dataKey] = configMapScope.config.data[dataKey];
                                }
                            } else {
                                createAlert("EmptyConfig", "warn", 'ConfigMap has no data: ' + envFromObj.configMapRef.name);
                            }
                        }
                    }
                }
            }


            if (_.keys(envVars).length > 0) {
                container.addProperties({
                    kind: "key-value",
                    id: "env",
                    title: "Environment Variables",
                    order: 10,
                    config: envVars
                });    
            }

            if (_.isArray(containerConfig.ports)) {
                for(let portConfig of containerConfig.ports) {
                    let portName = portConfig.protocol + "-" + portConfig.containerPort;
                    if (portConfig.name) {
                        portName = portConfig.name + " (" + portName + ")";
                    }
                    let portItem = container.fetchByNaming("port", portName);
                    scope.setK8sConfig(portItem, portConfig);

                    let portConfigScope = {
                        name: portConfig.name,
                        containerName: containerConfig.name,
                        portItem: portItem,
                        containerItem: container
                    };

                    appScope.ports[portConfig.name] = portConfigScope;
                    appScope.ports[portConfig.containerPort] = portConfigScope;
                }
            }

        }
        
        function findAndProcessConfigMap(parent: LogicItem, name: string, markUsedBy: boolean, isOptional?: boolean)
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

    })
    ;