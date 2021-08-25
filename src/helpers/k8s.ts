import { K8sConfig, LogicItem } from "..";

import { Container, Pod } from 'kubernetes-types/core/v1'
import { Deployment } from 'kubernetes-types/apps/v1'


export class KubernetesUtils {

    config(item : LogicItem) : K8sConfig
    {
        const config = <K8sConfig>item.config;
        return config;
    }

    container(item : LogicItem) : Container
    {
        return <Container>item.config;
    }
    
}   