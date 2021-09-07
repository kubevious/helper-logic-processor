import _ from 'the-lodash';
import { DaemonSet, Deployment, StatefulSet } from 'kubernetes-types/apps/v1';
import { Job } from 'kubernetes-types/batch/v1';
import { LogicLauncherRuntime } from '../types/parser/logic-launcher';

import { LogicParser } from './';
import { LogicContainerRuntime } from '../types/parser/logic-container';
import { Container, PersistentVolumeClaim, Pod, Volume } from 'kubernetes-types/core/v1';
import { LogicVolumeRuntime } from '../types/parser/logic-volume';
import { LogicPodRuntime } from '../types/parser/logic-pod';

export function LogicLauncherParser() {

    return LogicParser<Deployment | DaemonSet | StatefulSet | Job, LogicLauncherRuntime>()
        .target({
            path: ["logic", "ns", "app", "launcher"]
        });
}

export function LogicContainerParser() {

    return LogicParser<Container, LogicContainerRuntime>()
        .target({
            path: ["logic", "ns", "app", "cont"]
        })
        .target({
            path: ["logic", "ns", "app", "initcont"]
        })
}

export function LogicVolumeParser() {

    return LogicParser<Volume, LogicVolumeRuntime>()
        .target({
            path: ["logic", "ns", "app", "vols", "vol"]
        })
}

export function LogicNetworkPoliciesParser() {

    return LogicParser()
        .target({
            path: ["logic", "ns", "app", "netpols"]
        })
}


export function LogicPodParser() {

    return LogicParser<Pod, LogicPodRuntime>()
        .target({
            path: ["logic", "ns", "app", "launcher", "replicaset", "pod"]
        })
        .target({
            path: ["logic", "ns", "app", "launcher", "pod"]
        })
}


export function LogicPodPvcParser() {

    return LogicParser<PersistentVolumeClaim, LogicPodRuntime>()
        .target({
            path: ["logic", "ns", "app", "launcher", "replicaset", "pod", "pvc"]
        })
        .target({
            path: ["logic", "ns", "app", "launcher", "pod", "pvc"]
        })
}
