import _ from 'the-lodash';
import { K8sParser } from '../../parser-builder';
import { ValidatorID } from '@kubevious/entity-meta';
import { LogicLinkKind } from '../../logic/link-kind';
import { Secret } from 'kubernetes-types/core/v1';

export default K8sParser<Secret>()
    .target({
        kind: "Secret"
    })
    .handler(({ item, config }) => {

        if (shouldSkip()) {
            return;
        }

        if ((item.resolveSourceLinks(LogicLinkKind.k8s).length == 0) &&
            (item.resolveTargetLinkItems(LogicLinkKind.svcaccount).length == 0))
        {
            item.raiseAlert(ValidatorID.UNUSED_SECRET, 'Secret not used.');
        }

        /****/

        function shouldSkip()
        {
            if (shouldSkipHelm()) {
                return true;
            }
            return false;
        }

        function shouldSkipHelm()
        {
            if (config.type) {
                if (config.type === 'helm.sh/release.v1') {
                    return true;
                }
            }
            return false;
        }
        
    })
    ;
