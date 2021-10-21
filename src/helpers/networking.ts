export const NETWORK_POLICY_INGRESS = 'Ingress';
export const NETWORK_POLICY_EGRESS = 'Egress';
export const NETWORK_POLICY_DIRECTIONS = [ NETWORK_POLICY_INGRESS, NETWORK_POLICY_EGRESS ];

export class NetworkingUtils
{
    get directionIngress() {
        return NETWORK_POLICY_INGRESS;
    }

    get directionEgress() {
        return NETWORK_POLICY_EGRESS;
    }

    get directions() {
        return NETWORK_POLICY_DIRECTIONS;
    }
}