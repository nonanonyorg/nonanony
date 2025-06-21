import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

export class CertStack extends Stack {
    public readonly certArn: string;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, {
            ...props,
            env: {region: 'us-east-1'} // 👈 explicitly in us-east-1
        });

        const cert = new acm.Certificate(this, 'NonyCert', {
            domainName: 'nony.io',
            validation: acm.CertificateValidation.fromDns(), // DNS validation
        });

        this.certArn = cert.certificateArn;
    }
}
