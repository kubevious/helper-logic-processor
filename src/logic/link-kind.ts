export enum LogicLinkKind
{
    owner = 'owner',
    logic = 'logic',
    k8s = 'k8s',

    app = 'app',

    role = 'role',
    subject = 'subject',
    binding = 'binding',

    psp = 'psp',

    volume = 'volume',
    pvc = 'pvc',
    mount = 'mount',

    nsapi = 'nsapi',
    cluster = 'cluster',

    secret = 'secret',

    target = 'target',

    service = 'service',
    port = 'port',
    
    gateway = 'gateway',

    pack = 'pack',

    infra = 'infra',
    pod = 'pod',

    env = 'env',

    image = 'image',

    rbac = 'rbac',

}