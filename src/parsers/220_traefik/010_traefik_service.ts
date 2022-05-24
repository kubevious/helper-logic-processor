import _ from 'the-lodash';
import { K8sServiceRuntime } from '../../types/parser/k8s-service';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { K8sParser } from '../../parser-builder';
import { TraefikService, TraefikServiceReference } from './types/traefik-service';

export default K8sParser<TraefikService>()
    .target({
        api: "traefik.containo.us",
        kind: "TraefikService"
    })
    .handler(({ logger, config, scope, item, metadata, namespace, runtime, helpers }) => {

        for (const serviceRefConfig of config?.spec?.weighted?.services ?? [])
        {
            if (serviceRefConfig.kind === 'Service' ||
                !serviceRefConfig.kind)
            {
                processServiceRef(serviceRefConfig);
            }
        }

        for (const serviceRefConfig of config?.spec?.mirroring?.mirrors ?? [])
        {
            if (serviceRefConfig.kind === 'Service' ||
                !serviceRefConfig.kind)
            {
                processServiceRef(serviceRefConfig);
            }
        }

        /*** HELPERS ***/
        function processServiceRef(serviceRefConfig : TraefikServiceReference)
        {
            const serviceDn = helpers.k8s.makeDn(namespace!, 'v1', 'Service', serviceRefConfig.name);
            const k8sServiceItem = item.link(LogicLinkKind.service, serviceDn, serviceRefConfig.name);

            if (k8sServiceItem)
            {
                const serviceRuntime = k8sServiceItem.runtime as K8sServiceRuntime;
                if (_.isNumber(serviceRefConfig.port)) {
                    const servicePortConfig = serviceRuntime.portsByNumber[serviceRefConfig.port];
                    if (!servicePortConfig) {
                        item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE_PORT, `Service ${k8sServiceItem.naming} is missing port ${serviceRefConfig.port}.`);
                    }
                }
                else if (_.isString(serviceRefConfig.port)) {
                    const servicePortConfig = serviceRuntime.portsByName[serviceRefConfig.port];
                    if (!servicePortConfig) {
                        item.raiseAlert(ValidatorID.MISSING_INGRESS_SERVICE_PORT, `Service ${k8sServiceItem.naming} is missing port ${serviceRefConfig.port}.`);
                    }
                }
            }
            else
            {
                item.raiseAlert(ValidatorID.TRAEFIK_MISSING_SERVICE, `Service ${serviceRefConfig.name} is missing.`);
            }
        }

    })
    ;
